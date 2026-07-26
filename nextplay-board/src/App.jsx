import { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
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
      <span>Normal priority</span>
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

function App() {
  const [tasks, setTasks] = useState([]);

  function createTask() {
    const title = window.prompt("Enter a task title:");

    if (!title || !title.trim()) {
      return;
    }

    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      status: "todo",
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
  }

  function handleDragEnd(event) {
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

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === active.id
          ? { ...task, status: newStatus }
          : task
      )
    );
  }

  return (
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
            onClick={createTask}
          >
            + New Task
          </button>
        </header>

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
  );
}

export default App;