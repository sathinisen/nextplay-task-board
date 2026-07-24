import { useState } from "react";
import "./App.css";

const columns = [
  {
    id: "todo",
    title: "To Do",
  },
  {
    id: "in_progress",
    title: "In Progress",
  },
  {
    id: "in_review",
    title: "In Review",
  },
  {
    id: "done",
    title: "Done",
  },
];

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

  return (
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
            <div className="column" key={column.id}>
              <div className="column-header">
                <h2>{column.title}</h2>
                <span className="task-count">{columnTasks.length}</span>
              </div>

              <div className="task-list">
                {columnTasks.length === 0 ? (
                  <div className="empty-state">
                    <p>No tasks here</p>
                    <span>Create a task to get started.</span>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <article className="task-card" key={task.id}>
                      <h3>{task.title}</h3>
                      <span>Normal priority</span>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

export default App;