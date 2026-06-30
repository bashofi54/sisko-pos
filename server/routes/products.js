// File: server/routes/products.js - VERSI RBAC FINAL
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, ownerOnly, gudangOnly, kasirOnly } = require('../middleware/auth'); // GANTI DI SINI

// GET /api/products - Semua role boleh
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, barcode, price, stock FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/products - Cuma Gudang + Owner
router.post('/', authMiddleware, gudangOnly, async (req, res) => {
  const { name, barcode, price, stock } = req.body;
  if (!name ||!price) return res.status(400).json({ message: 'Nama dan harga wajib diisi' });
  try {
    const result = await db.query('INSERT INTO products (name, barcode, price, stock) VALUES ($1, $2, $3, $4) RETURNING id', [name, barcode || null, price, stock || 0]);
    res.status(201).json({ message: 'Produk berhasil ditambah', id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Barcode sudah terdaftar' });
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/products/:id - Cuma Gudang + Owner
router.put('/:id', authMiddleware, gudangOnly, async (req, res) => {
  const { id } = req.params;
  const { name, barcode, price, stock } = req.body;
  try {
    const result = await db.query('UPDATE products SET name = $1, barcode = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *', [name, barcode, price, stock, id]);
    if(result.rowCount === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ message: 'Produk berhasil diupdate', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Barcode sudah terdaftar' });
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/products/:id - CUMA OWNER
router.delete('/:id', authMiddleware, ownerOnly, gudangOnly, kasirOnly, async (req, res) => { // GANTI DI SINI
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1', [id]);
    if(result.rowCount === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;