import { useState } from "react";

export default function App() {
  const [projects, setProjects] = useState([]);
  const [token, setToken] = useState("");

  const login = async () => {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "user", password: "user" }),
    });
    const data = await res.json();
    setToken(data.token);
  };

  const loadProjects = async () => {
    const res = await fetch("http://localhost:3000/projects");
    const data = await res.json();
    setProjects(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">🔐 CipherCorelink</h1>

      {!token ? (
        <button
          onClick={login}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Login (user/user)
        </button>
      ) : (
        <button
          onClick={loadProjects}
          className="bg-green-500 text-white px-4 py-2 rounded mt-4"
        >
          Load Projects
        </button>
      )}

      <ul className="mt-6">
        {projects.map((p, i) => (
          <li key={i} className="border p-2 mb-2 rounded">
            <span className="font-semibold">{p.name}</span> — {p.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
