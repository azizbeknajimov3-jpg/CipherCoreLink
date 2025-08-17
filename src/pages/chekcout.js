// src/pages/Checkout.js
import { useState } from "react";
import api from "../api/client";

export default function Checkout() {
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState(100); // cent/tiyin
  const [result, setResult] = useState(null);

  async function pay(e) {
    e.preventDefault();
    const res = await api.post(`/payments/checkout/${projectId}`, { amount });
    setResult(res.data);
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">Checkout</h1>
      <form onSubmit={pay} className="space-y-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="Project ID"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Summasi (cent/tiyin)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button className="bg-green-600 text-white rounded px-4 py-2">💳 To‘lash</button>
      </form>

      {result && (
        <div className="mt-4 border p-3 rounded bg-gray-50">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}