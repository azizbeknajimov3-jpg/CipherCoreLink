import { useState, useEffect } from "react";

export default function App() {
  const [projects, setProjects] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(false);

  // Tokenni localStorage bilan sinxronlash
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Login qilish
  const login = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "user", password: "user" }),
      });

      if (!res.ok) throw new Error("❌ Login failed");

      const data = await res.json();
      setToken(data.token);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loyihalarni yuklash
  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("❌ Failed to load projects");

      const data = await res.json();
      setProjects(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">🔐 CipherCoreLink</h1>

      {!token ? (
        <button
          onClick={login}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login (user/user)"}
        </button>
      ) : (
        <button
          onClick={loadProjects}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load Projects"}
        </button>
      )}

      <ul className="mt-6">
        {projects.map((p, i) => (
          <li
            key={i}
            className="border p-3 mb-2 rounded bg-white shadow-sm hover:shadow-md"
          >
            <span className="font-semibold">{p.name}</span> — {p.description}
          </li>
        ))}
      </ul>
    </div>
  );
}