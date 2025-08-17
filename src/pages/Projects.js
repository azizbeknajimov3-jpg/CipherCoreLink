// src/pages/Projects.js
import { useState, useEffect } from "react";
import api from "../api/client";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [provider, setProvider] = useState("none");

  useEffect(() => {
    api.get("/payments/projects").then((res) => setProjects(res.data || []));
  }, []);

  async function createProject(e) {
    e.preventDefault();
    const res = await api.post("/payments/projects", { name, description: desc, provider });
    setProjects([...projects, res.data.project]);
    setName(""); setDesc(""); setProvider("none");
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">Mening loyihalarim</h1>

      <form onSubmit={createProject} className="space-y-2 mb-6">
        <input
          className="border p-2 rounded w-full"
          placeholder="Loyiha nomi"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="border p-2 rounded w-full"
          placeholder="Tavsif"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <select className="border p-2 rounded w-full" value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="none">Internal (faqat virtual)</option>
          <option value="stripe">Stripe</option>
          <option value="yookassa">YooKassa</option>
        </select>
        <button className="bg-blue-600 text-white rounded px-4 py-2">+ Yaratish</button>
      </form>

      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p._id} className="border rounded p-2">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-500">{p.description}</div>
            <div className="text-xs text-gray-400">Provider: {p.paymentProvider}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}