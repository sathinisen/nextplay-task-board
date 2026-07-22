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

        <button className="new-task-button" type="button">
          + New Task
        </button>
      </header>

      <section className="board">
        {columns.map((column) => (
          <div className="column" key={column.id}>
            <div className="column-header">
              <h2>{column.title}</h2>
              <span className="task-count">0</span>
            </div>

            <div className="empty-state">
              <p>No tasks here</p>
              <span>Create a task to get started.</span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

export default App;