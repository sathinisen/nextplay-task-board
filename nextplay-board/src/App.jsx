import { useEffect, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { supabase } from "./lib/supabase";
import "./App.css";

const columns = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
];

function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 1000 : "auto",
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? "task-card-dragging" : ""}`}
      {...listeners}
      {...attributes}
    >
      <h3>{task.title}</h3>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-card-footer">
        <span className={`priority-badge priority-${task.priority}`}>
          {task.priority}
        </span>

        {task.due_date && (
          <span className="due-date">
            Due {new Date(`${task.due_date}T00:00:00`).toLocaleDateString()}
          </span>
        )}
      </div>
    </article>
  );
}

function BoardColumn({ column, tasks }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`column ${isOver ? "column-over" : ""}`}
    >
      <div className="column-header">
        <h2>{column.title}</h2>
        <span className="task-count">{tasks.length}</span>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>Drop tasks here</p>
            <span>Or create a new task to get started.</span>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

function NewTaskModal({
  isOpen,
  onClose,
  onCreate,
  savingTask,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState("");

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("normal");
    setDueDate("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    const success = await onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
    });

    if (success) {
      resetForm();
      onClose();
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">NEW TASK</p>
            <h2 id="new-task-title">Create a new task</h2>
          </div>

          <button
            className="close-button"
            type="button"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Task title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: Design homepage"
              autoFocus
              required
            />
          </label>

          <label className="form-field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add any helpful details..."
              rows="4"
            />
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Priority</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="form-field">
              <span>Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={handleClose}
            >
              Cancel
            </button>

            <button
              className="new-task-button"
              type="submit"
              disabled={savingTask || !title.trim()}
            >
              {savingTask ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingTask, setSavingTask] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function startApp() {
      try {
        setLoading(true);
        setErrorMessage("");

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        let currentUser = session?.user;

        if (!currentUser) {
          const { data, error: signInError } =
            await supabase.auth.signInAnonymously();

          if (signInError) {
            throw signInError;
          }

          currentUser = data.user;
        }

        setUser(currentUser);

        const { data: savedTasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: true });

        if (tasksError) {
          throw tasksError;
        }

        setTasks(savedTasks ?? []);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "Could not load the task board.");
      } finally {
        setLoading(false);
      }
    }

    startApp();
  }, []);

  async function createTask({
    title,
    description,
    priority,
    dueDate,
  }) {
    if (!user) {
      return false;
    }

    setSavingTask(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title,
        description: description || null,
        status: "todo",
        priority,
        due_date: dueDate || null,
        user_id: user.id,
      })
      .select()
      .single();

    setSavingTask(false);

    if (error) {
      console.error(error);
      setErrorMessage("The task could not be created.");
      return false;
    }

    setTasks((currentTasks) => [...currentTasks, data]);
    return true;
  }

  async function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const newStatus = over.id;

    const validStatus = columns.some(
      (column) => column.id === newStatus
    );

    if (!validStatus) {
      return;
    }

    const movedTask = tasks.find((task) => task.id === active.id);

    if (!movedTask || movedTask.status === newStatus) {
      return;
    }

    const oldStatus = movedTask.status;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === active.id
          ? { ...task, status: newStatus }
          : task
      )
    );

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", active.id);

    if (error) {
      console.error(error);
      setErrorMessage("The task could not be moved.");

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === active.id
            ? { ...task, status: oldStatus }
            : task
        )
      );
    }
  }

  if (loading) {
    return (
      <main className="app">
        <p>Loading your task board...</p>
      </main>
    );
  }

  return (
    <>
      <DndContext onDragEnd={handleDragEnd}>
        <main className="app">
          <header className="page-header">
            <div>
              <p className="eyebrow">TASK MANAGEMENT</p>
              <h1>NextPlay Board</h1>
              <p className="subtitle">
                Plan your work and keep every task moving forward.
              </p>
            </div>

            <button
              className="new-task-button"
              type="button"
              onClick={() => setIsTaskModalOpen(true)}
            >
              + New Task
            </button>
          </header>

          {errorMessage && (
            <div className="error-message" role="alert">
              {errorMessage}
            </div>
          )}

          <section className="board">
            {columns.map((column) => {
              const columnTasks = tasks.filter(
                (task) => task.status === column.id
              );

              return (
                <BoardColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                />
              );
            })}
          </section>
        </main>
      </DndContext>

      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreate={createTask}
        savingTask={savingTask}
      />
    </>
  );
}

export default App;