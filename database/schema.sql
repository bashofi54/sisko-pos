-- File: database/schema.sql
-- Tujuan: Cetakan untuk membuat 4 tabel utama Sisko

CREATE DATABASE IF NOT EXISTS sisko_pos_db;
USE sisko_pos_db;

-- 1. Tabel users: buat nyimpen akun login
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Nama asli user',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT 'Buat login',
    password VARCHAR(255) NOT NULL COMMENT 'Wajib di-hash',
    role ENUM('owner', 'kasir', 'gudang') NOT NULL COMMENT 'Hak akses',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel products: daftar barang jualan
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    price INT NOT NULL DEFAULT 0 COMMENT 'Harga dalam rupiah',
    stock INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE COMMENT 'False = barang dihapus',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabel transactions: nota utama
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount INT NOT NULL,
    paid_amount INT NOT NULL,
    change_amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Tabel transaction_items: rincian isi nota
CREATE TABLE transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_sale INT NOT NULL COMMENT 'Harga saat transaksi',
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);