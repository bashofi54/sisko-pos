// File: server/seed.js - VERSI FINAL COCOK SCHEMA
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const password = '123456';
    const hash = await bcrypt.hash(password, 10);

    // 1. Kosongin tabel biar bersih. Urutannya penting karena ada relasi
    await client.query("TRUNCATE TABLE transaction_items, transactions, products, users RESTART IDENTITY CASCADE");
    console.log('Tabel dikosongin');

    // 2. SEED USERS
    const userQuery = "INSERT INTO users (name, username, password, role) VALUES ($1, $2, $3, $4)";
    await client.query(userQuery, ['Bu Sari', 'owner', hash, 'owner']);
    await client.query(userQuery, ['Mas Agus', 'kasir1', hash, 'kasir']);
    await client.query(userQuery, ['Mba Rina', 'gudang1', hash, 'gudang']);
    console.log('✅ 3 User berhasil dibuat');

    // 3. SEED PRODUCTS -> GANTI SKU JADI BARCODE
    const productQuery = "INSERT INTO products (name, barcode, price, stock, is_active) VALUES ($1, $2, $3, $4, TRUE)";
    await client.query(productQuery, ['Beras Premium 5kg', 'BR-001', 65000, 20]);
    await client.query(productQuery, ['Minyak Goreng 1L', 'MG-002', 18000, 50]);
    await client.query(productQuery, ['Gula Pasir 1kg', 'GL-003', 15000, 30]);
    await client.query(productQuery, ['Mie Sedap Goreng', 'MI-004', 3200, 100]);
    console.log('✅ 4 Produk berhasil dibuat');

    await client.query('COMMIT');
    console.log('✅ SEEDING SELESAI');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeder gagal:', err);
  } finally {
    client.release();
    pool.end();
  }
}
seed();