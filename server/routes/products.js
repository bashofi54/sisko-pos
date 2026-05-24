// File: server/routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /api/products - Semua yg login boleh liat
router.get('/products', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, barcode, price, stock FROM products ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products - CUMA ADMIN
router.post('/products', authMiddleware, adminOnly, async (req, res) => {
  const { name, barcode, price, stock } = req.body;
  if (!name ||!price) return res.status(400).json({ message: 'Nama dan harga wajib diisi' });

  try {
    const [result] = await db.query(
      'INSERT INTO products (name, barcode, price, stock) VALUES (?,?,?,?)',
      [name, barcode || null, price, stock || 0]
    );
    res.status(201).json({ message: 'Produk berhasil ditambah', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Barcode sudah terdaftar' });
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/products/:id - CUMA ADMIN
router.put('/products/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { name, barcode, price, stock } = req.body;
  try {
    await db.query(
      'UPDATE products SET name =?, barcode =?, price =?, stock =? WHERE id =?',
      [name, barcode, price, stock, id]
    );
    res.json({ message: 'Produk berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/products/:id - CUMA ADMIN
router.delete('/products/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM products WHERE id =?', [id]);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;