// src/pages/Wallet.js
import { useEffect, useState } from "react";
import api from "../api/client";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    api.get("/wallet/me").then((res) => setWallet(res.data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">Mening hamyonim</h1>
      {wallet ? (
        <div className="border rounded p-3 bg-gray-50">
          <div>Balance: {wallet.balance / 100} {wallet.currency}</div>
        </div>
      ) : (
        <div>⏳ Yuklanmoqda...</div>
      )}
    </div>
  );
}