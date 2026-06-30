// File: server/index.js
// Tujuan: Nyalain server + siapin pintu buat React masuk

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db"); // Biar bisa ngobrol sama Postgres
const authRoutes = require("./routes/auth"); // Biar bisa ngurusin login/register
const productRoutes = require("./routes/products"); // Biar bisa ngurusin produk
const transactionRoutes = require("./routes/transactions"); // Biar bisa ngurusin transaksi

const app = express();
const PORT = process.env.PORT || 3000;

// 1. INI BAGIAN YANG DIGANTI 👇
const allowedOrigins = [
  'http://localhost:5173', // Buat dev lokal Vite
  'https://sisko-client.vercel.app' // GANTI INI -> URL Vercel FE kamu yang bener
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true // Wajib kalau nanti pake cookie/session
}));
// SAMPAI SINI 👆

// 2. Sisanya tetap sama persis
app.use(express.json());

// Route tes: buat mastiin server nyala
app.get("/ping", (req, res) => {
  res.json({ message: "Pong! Server Sisko nyala 🚀" });
});

// Route buat test homepage
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Selamat datang di API Sisko POS",
  });
});

// Route
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);

// Nyalain server
app.listen(PORT, () => {
  console.log(`Server Sisko jalan di http://localhost:${PORT}`);
});