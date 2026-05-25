// File: server/routes/transactions.js
// Tujuan: Proses penjualan. Stok kurang, catat transaksi, semua aman pake DB Transaction

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// POST /api/transactions - Kasir & Admin boleh jualan
router.post('/transactions', authMiddleware, async (req, res) => {
  const { items, payment_method } = req.body; // items = [{product_id: 1, qty: 2}]
  const user_id = req.user.id;

  if (!items ||!items.length) {
    return res.status(400).json({ message: 'Keranjang kosong, bos' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let total_price = 0;
    const detailToInsert = [];

    // 1. Cek stok & hitung total harga dari DB, bukan dari frontend
    for (const item of items) {
      const [rows] = await conn.query(
        'SELECT id, name, price, stock FROM products WHERE id =? FOR UPDATE',
        [item.product_id]
      );
      if (rows.length === 0) throw new Error(`Produk ID ${item.product_id} ga ketemu`);
      
      const product = rows[0];
      if (product.stock < item.qty) throw new Error(`Stok ${product.name} kurang. Sisa ${product.stock}`);

      total_price += product.price * item.qty;
      detailToInsert.push({ ...item, price_per_item: product.price });
    }

    // 2. Simpan header transaksi
    const [result] = await conn.query(
      'INSERT INTO transactions (user_id, total_price, payment_method) VALUES (?,?,?)',
      [user_id, total_price, payment_method || 'cash']
    );
    const transaction_id = result.insertId;

    // 3. Simpan detail + potong stok
    for (const d of detailToInsert) {
      await conn.query(
        'INSERT INTO transaction_details (transaction_id, product_id, quantity, price_per_item) VALUES (?,?,?,?)',
        [transaction_id, d.product_id, d.qty, d.price_per_item]
      );
      await conn.query('UPDATE products SET stock = stock -? WHERE id =?', [d.qty, d.product_id]);
    }

    await conn.commit();
    res.status(201).json({ message: 'Transaksi sukses', transaction_id, total_price });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message || 'Transaksi gagal total' });
  } finally {
    conn.release();
  }
});

// GET /api/transactions - Liat riwayat transaksi
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id, t.total_price, t.payment_method, t.created_at, u.username as kasir 
      FROM transactions t JOIN users u ON t.user_id = u.id 
      ORDER BY t.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reports/today - Laporan omzet hari ini. KHUSUS ADMIN
router.get('/reports/today', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) as total_transaksi,
        IFNULL(SUM(total_price), 0) as total_omzet
      FROM transactions
      WHERE DATE(created_at) = CURDATE()
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reports/best-sellers - 5 barang paling laris. KHUSUS ADMIN
router.get('/reports/best-sellers', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.name,
        SUM(td.quantity) as total_terjual
      FROM transaction_details td
      JOIN products p ON td.product_id = p.id
      GROUP BY td.product_id, p.name
      ORDER BY total_terjual DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;