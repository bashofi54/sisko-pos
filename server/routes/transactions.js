// File: server/routes/transactions.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, ownerOnly, kasirOnly } = require('../middleware/auth'); // 1. GANTI IMPORT

// POST /api/transactions - Cuma Kasir + Owner boleh jualan
router.post('/', authMiddleware, kasirOnly, async (req, res) => { // 2. KASIH KUNCI KASIR
  const { items } = req.body; // payment_method dihapus karena di schema gak ada
  const user_id = req.user.id;

  if (!items ||!items.length) {
    return res.status(400).json({ message: 'Keranjang kosong, bos' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    let total_amount = 0;
    const detailToInsert = [];

    for (const item of items) {
      const result = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );
      if (result.rows.length === 0) throw new Error(`Produk ID ${item.product_id} ga ketemu`);

      const product = result.rows[0];
      if (product.stock < item.qty) throw new Error(`Stok ${product.name} kurang. Sisa ${product.stock}`);

      total_amount += product.price * item.qty;
      detailToInsert.push({...item, price_at_sale: product.price });
    }

    const transResult = await client.query(
      'INSERT INTO transactions (user_id, total_amount, paid_amount, change_amount) VALUES ($1, $2, $3, $4) RETURNING id',
      [user_id, total_amount, total_amount, 0]
    );
    const transaction_id = transResult.rows[0].id;

    for (const d of detailToInsert) {
      await client.query(
        'INSERT INTO transaction_items (transaction_id, product_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4)',
        [transaction_id, d.product_id, d.qty, d.price_at_sale]
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [d.qty, d.product_id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Transaksi sukses', transaction_id, total_amount });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: err.message || 'Transaksi gagal total' });
  } finally {
    client.release();
  }
});

// GET /api/transactions - Semua yang login boleh lihat riwayat
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.id, t.total_amount, t.created_at, u.username as kasir
      FROM transactions t JOIN users u ON t.user_id = u.id
      ORDER BY t.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reports/today - CUMA OWNER
router.get('/reports/today', authMiddleware, ownerOnly, async (req, res) => { // 3. GANTI ADMINONLY
  try {
    const result = await db.query(`
      SELECT
        COUNT(*)::INT as total_transaksi, -- ::INT biar di frontend gak string
        COALESCE(SUM(total_amount), 0)::INT as total_omzet
      FROM transactions
      WHERE created_at::date = CURRENT_DATE
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reports/best-sellers - CUMA OWNER
router.get('/reports/best-sellers', authMiddleware, ownerOnly, async (req, res) => { // 4. GANTI ADMINONLY
  try {
    const result = await db.query(`
      SELECT
        p.name,
        SUM(td.quantity)::INT as total_terjual -- ::INT biar di frontend gak string
      FROM transaction_items td
      JOIN products p ON td.product_id = p.id
      GROUP BY p.name
      ORDER BY total_terjual DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;