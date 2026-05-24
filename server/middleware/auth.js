// File: server/middleware/auth.js
// Tujuan: Jadi Satpam. Cek JWT di header tiap request.

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // 1. Ambil tiket dari header. Format: "Bearer eyJhbGciOi..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Ambil bagian setelah "Bearer"

  if (token == null) {
    return res.status(401).json({ message: 'Akses ditolak. Tiket tidak ada' });
  }

  // 2. Verifikasi tiket: Asli apa palsu? Udah expired belum?
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Tiket tidak valid atau sudah hangus' });
    }

    // 3. Kalau tiket asli, simpan data user ke req.user
    // Jadi route selanjutnya tau "Oh ini user id 1, role-nya admin"
    req.user = user;
    next(); // Lanjut ke route tujuan
  });
}

module.exports = authMiddleware;