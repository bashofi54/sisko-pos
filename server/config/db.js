// File: server/config/db.js
// Tujuan: Satu pintu untuk ngobrol sama MySQL

const mysql = require('mysql2');
require('dotenv').config();

// Bikin "kolam koneksi". Kenapa kolam? Biar ga buka-tutup koneksi terus.
// Ibarat warung: kalau tiap pelanggan dateng baru bikin gelas, lama.
// Mending siapin 10 gelas di awal, tinggal pake.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Maksimal 10 koneksi barengan
  queueLimit: 0
});

// Tes koneksi + ubah ke Promise biar bisa pake async/await
const db = pool.promise();

// Coba konek 1x buat mastiin beneran nyambung
db.getConnection()
  .then(connection => {
    console.log('Database MySQL sisko_pos_db berhasil konek ✅');
    connection.release(); // Balikin gelasnya ke kolam
  })
  .catch(err => {
    console.error('GAGAL KONEK DATABASE ❌:', err.message);
  });

module.exports = db;