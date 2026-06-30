// File: server/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'Akses ditolak. Tiket tidak ada' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Tiket tidak valid atau sudah hangus' });
    req.user = decoded.user || decoded; // Anti error format token
    next();
  });
}

// 1. KHUS OWNER DOANG. Contoh: Hapus Produk, Lihat Laporan
const ownerOnly = (req, res, next) => {
  if (!req.user || req.user.role!== 'owner') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya Owner yang bisa akses' });
  }
  next();
};

// 2. KHUS GUDANG + OWNER. Contoh: Tambah/Ubah Produk
const gudangOnly = (req, res, next) => {
  if (!req.user || (req.user.role!== 'owner' && req.user.role!== 'gudang')) {
    return res.status(403).json({ message: 'Akses ditolak. Hanya Gudang/Owner yang bisa akses' });
  }
  next();
};

// 3. KHUS KASIR + OWNER. Contoh: Checkout
const kasirOnly = (req, res, next) => {
  if (!req.user || (req.user.role!== 'owner' && req.user.role!== 'kasir')) {
    return res.status(403).json({ message: 'Akses ditolak. Hanya Kasir/Owner yang bisa akses' });
  }
  next();
};

module.exports = { authMiddleware, ownerOnly, gudangOnly, kasirOnly };