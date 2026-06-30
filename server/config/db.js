// File: server/config/db.js
// Tujuan: Satu pintu untuk ngobrol sama PostgreSQL

const { Pool } = require('pg');
require('dotenv').config();

// Bikin "kolam koneksi" versi Postgres
// ssl: { rejectUnauthorized: false } wajib buat Neon/Supabase/Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  },
  max: 10, // Maksimal 10 koneksi barengan, sama kayak mysql2
});

// Tes koneksi 1x buat mastiin beneran nyambung
pool.connect()
  .then(client => {
    console.log('Database PostgreSQL sisko_db berhasil konek ✅');
    client.release(); // Balikin koneksinya ke kolam
  })
  .catch(err => {
    console.error('GAGAL KONEK DATABASE ❌:', err.message);
  });

module.exports = pool;