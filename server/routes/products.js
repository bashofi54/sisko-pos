// File: server/routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth'); // <-- Import Satpam

// GET /api/products - Hanya yg punya tiket yg bisa akses
// Caranya: Sisipin authMiddleware sebelum (req, res)
router.get('/products', authMiddleware, async (req, res) => {
  try {
    // req.user isinya { id: 1, role: 'admin' } dari tiket JWT
    console.log('Request dari user:', req.user);

    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;