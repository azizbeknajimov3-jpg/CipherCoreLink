// src/pages/Transactions.js
import { useEffect, useState } from "react";
import api from "../api/client";

export default function Transactions() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    api.get("/wallet/transactions").then((res) => setTxs(res.data || []));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">📑 Tranzaksiyalar tarixi</h1>

      {txs.length === 0 && <div>Hech qanday tranzaksiya yo‘q.</div>}

      <ul className="space-y-2">
        {txs.map((tx) => (
          <li
            key={tx._id}
            className={`border rounded p-3 ${
              tx.status === "success" ? "bg-green-50" : "bg-yellow-50"
            }`}
          >
            <div className="font-semibold">
              {tx.type === "incoming" ? "⬆ Kirim" : "⬇ Chiqim"}
            </div>
            <div>
              {tx.amount / 100} {tx.currency}
            </div>
            <div className="text-sm text-gray-500">Holat: {tx.status}</div>
            <div className="text-xs text-gray-400">ID: {tx._id}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}