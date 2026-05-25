// File: server/index.js
// Tujuan: Nyalain server + siapin pintu buat React masuk

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db"); // Biar bisa ngobrol sama MySQL
const authRoutes = require("./routes/auth"); // Biar bisa ngurusin login/register
const productRoutes = require("./routes/products"); // Biar bisa ngurusin produk
const transactionRoutes = require("./routes/transactions"); // Biar bisa ngurusin transaksi

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Biar bisa baca JSON + biar React boleh masuk
app.use(cors());
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
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", transactionRoutes);


// Nyalain server
app.listen(PORT, () => {
  console.log(`Server Sisko jalan di http://localhost:${PORT}`);
});
