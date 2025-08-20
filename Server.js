const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ==== Import Routes ====
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const transactionRoutes = require("./routes/transactions");
const aiRoutes = require("./routes/ai");
const adminAuditRoutes = require("./routes/adminAudit");
const adminRevenueRoutes = require("./routes/adminRevenue");
const leaderboardRoutes = require("./routes/leaderboard");
const walletRoutes = require("./routes/wallet");
const withdrawRoutes = require("./routes/withdraw");
const depositRoutes = require("./routes/deposit");

const app = express();

// ==== Middleware ====
app.use(cors());
app.use(express.json());

// Stripe webhooklari uchun raw body kerak bo‘ladi
app.use("/webhooks/stripe", express.raw({ type: "application/json" }));

// ==== MongoDB ulanish ====
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ciphercorelink")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ==== Routes ====
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/transactions", transactionRoutes);
app.use("/ai", aiRoutes);

app.use("/admin/audit", adminAuditRoutes);
app.use("/admin/revenue", adminRevenueRoutes);

app.use("/leaderboard", leaderboardRoutes);
app.use("/wallet", walletRoutes);
app.use("/withdraw", withdrawRoutes);
app.use("/deposit", depositRoutes);

// ==== Health check ====
app.get("/health", (req, res) => res.json({ status: "ok", ts: Date.now() }));

// ==== Start server ====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CipherCoreLink server running at http://localhost:${PORT}`);
});