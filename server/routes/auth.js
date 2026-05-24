// File: server/routes/auth.js
// Tujuan: Ngurusin login + register

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // 1. Validasi input kosong
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi" });
  }

  try {
    // 2. Cari user di database berdasarkan username
    const [rows] = await db.query("SELECT * FROM users WHERE username =?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const user = rows[0];

    // 3. Bandingin password yang diinput vs password acak di DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    // 4. Kalau cocok, buatin "Tiket Masuk" JWT
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Data yang mau disimpen di tiket
      process.env.JWT_SECRET, // Stempel rahasia
      { expiresIn: "8h" }, // Tiket hangus 8 jam
    );

    // 5. Kirim tiket + data user ke frontend
    res.json({
      message: "Login berhasil",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
