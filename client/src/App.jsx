import { useEffect, useState } from "react";
import { getThreads, createThread } from "./services/threads.service";

// App.jsx is already wired for the your project. It calls the service functions you implement.
// It also logs the env var so you can grab the screenshot for your PR.
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

export default function App() {
  const [threads, setThreads] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | todo | error
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const data = await getThreads();
      setThreads(data);
      setStatus("ready");
    } catch (e) {
      if (e?.message === "NOT_IMPLEMENTED") setStatus("todo");
      else {
        setError(String(e?.message || e));
        setStatus("error");
      }
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createThread({ title, body });
      setTitle("");
      setBody("");
      await load();
    } catch (e) {
      setError(e?.message === "NOT_IMPLEMENTED" ? "Implement createThread() first." : String(e?.message || e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wrap">
      <h1>Threadbase</h1>
      <p className="muted">
        API base URL: <code>{String(import.meta.env.VITE_API_URL)}</code> (open the console too)
      </p>

      {status === "todo" && (
        <div className="notice">
          <strong>Service layer not implemented yet.</strong>
          <p style={{ marginTop: "0.5rem" }}>
            Implement <code>src/services/apiClient.js</code> and{" "}
            <code>src/services/threads.service.js</code>, then this list will render.
          </p>
        </div>
      )}

      {status === "error" && <p className="err">Error: {error}</p>}

      {status === "ready" && (
        <>
          <form onSubmit={onSubmit}>
            <input
              placeholder="Thread title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Thread body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add thread"}
            </button>
            {error && <span className="err">{error}</span>}
          </form>

          {threads.map((t) => (
            <div className="card" key={t.id}>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
