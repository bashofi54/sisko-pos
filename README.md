## ATURAN EMAS PORTOFOLIO SISKO API

1.  **1 DB UNTUK SEMUA**: API ini pake Neon PostgreSQL. Jadi semua orang nembak ke 1 database yang sama. Gak perlu setup DB lokal.
2.  **SEED CUKUP 1x**: Cukup Developer yang jalanin `npm run seed` 1x pas awal. User lain gak perlu.
3.  **AKUN DEMO PUBLIK**: 
. 
# SISKO - Sistem Informasi Toko Sederhana

Backend API untuk Aplikasi Kasir Toko Sederhana. Dibangun pake `Node.js + Express + PostgreSQL`. Arsitektur `JWT + RBAC` biar aman.

## 1. Teknologi yang Dipakai
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Auth**: JSON Web Token `jsonwebtoken`, Bcrypt `bcryptjs`
- **Akses**: Role Based Access Control `RBAC`

## 2. Cara Install & Jalanin

### A. Siapkan Database
1.  Buka `psql` > `CREATE DATABASE sisko_db;`
2.  `\c sisko_db;`
3.  Jalankan semua isi `schema.sql` buat bikin tabel.
4.  Jalankan `seed.js` buat bikin 3 user default: `node seed.js`

### B. Jalanin Server
```bash
cd server
npm install
npm run dev
Server jalan di `http://localhost:5000`

## 3. Akun Default untuk Tes
Username | Password | Role | Tugas
`owner` | `123456` | `owner` | Bos. Akses semua
`gudang1` | `123456` | `gudang` | Admin Barang
`kasir1` | `123456` | `kasir` | Kasir/Jualan
## 4. Aturan RBAC - Role Based Access Control
Ini jantungnya biar 3 user gak bisa saling masuk.
Middleware | Yang Boleh Akses | Dipakai di Endpoint
`authMiddleware` | Semua yang login | Semua endpoint
`gudangOnly` | `owner`, `gudang` | `POST, PUT /api/products`
`kasirOnly` | `owner`, `kasir` | `POST /api/transactions`
`ownerOnly` | `owner` doang | `DELETE /api/products`, `GET /api/reports/*`
## 5. Skema Tes RBAC - WAJIB LULUS SEMUA
Ikutin ini 1x buat mastiin backend kamu 100% aman sebelum sambung frontend.

#### *Langkah 1: Login & Ambil Token*
`POST /api/auth/login` pake 3 user di atas. Simpan 3 `token` berbeda.

#### *Langkah 2: Tes Akses*
Ganti `Bearer Token` di Thunder Client sesuai role yang dites.
# | Endpoint | Method | Token `owner` | Token `gudang` | Token `kasir` | Catatan
1 | `/api/products` | GET | 200 OK | 200 OK | 200 OK | Semua boleh lihat
2 | `/api/products` | POST | 201 Created | 201 Created | **403** | Cuma gudang+owner
3 | `/api/products/1` | DELETE | 200 OK | **403** | **403** | Cuma owner
4 | `/api/transactions` | POST | 201 Created | **403** | 201 Created | Cuma kasir+owner
5 | `/api/reports/today` | GET | 200 OK | **403** | **403** | Cuma owner
*Aturan Lulus*: Kalau hasil kolom `owner/gudang/kasir` sama persis sama tabel di atas, berarti RBAC kamu lolos.

## 6. Daftar Endpoint API
`Auth: /api/auth/login`  
`Produk: /api/products [GET, POST, PUT, DELETE]`  
`Transaksi: /api/transactions [POST, GET]`  
`Laporan: /api/reports/today, /api/reports/best-sellers`
---
Gudang login -> fitur Muncul + Tambah, Edit, Hapus. Buka Kasir & Laporan hilang ✅
Kasir login -> fitur Muncul + Tambah, Hapus, Buka Kasir. Edit & Laporan hilang ✅
Owner login -> fitur Muncul semua ✅

#### **APA YANG BARU DI README INI:**

1.  **Bagian 4. Aturan RBAC**: Tabel simpel biar kamu gak lupa jobdesc tiap role.
2.  **Bagian 5. Skema Tes RBAC**: Ini copy-an langsung dari skema tes tadi. Jadi SOP kamu. 5 baris tes doang, tapi udah nge-cover semua pintu.

Dengan ini kamu punya 1 sumber kebenaran. Backend, Role, sama Cara Tes udah 1 file.
