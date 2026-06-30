-- File: database/schema.sql
-- Tujuan: Cetakan untuk membuat 4 tabel utama Sisko versi PostgreSQL

-- Di Neon, database nya udah dibikin otomatis pas create project.
-- Jadi baris CREATE DATABASE & USE dihapus.

-- 1. Tabel users: buat nyimpen akun login
CREATE TABLE users (
    id SERIAL PRIMARY KEY, -- SERIAL = AUTO_INCREMENT versi Postgres
    name VARCHAR(100) NOT NULL, -- COMMENT dihapus, Postgres gak support
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'kasir', 'gudang')), -- Ganti ENUM
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP -- TIMESTAMPZ = ada timezone
);

-- 2. Tabel products: daftar barang jualan
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    price INTEGER NOT NULL DEFAULT 0, -- INT -> INTEGER
    stock INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger buat auto update updated_at. MySQL pake ON UPDATE, Postgres pake trigger.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE
ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Tabel transactions: nota utama
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id), -- FK langsung di sini lebih rapi
    total_amount INTEGER NOT NULL,
    paid_amount INTEGER NOT NULL,
    change_amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel transaction_items: rincian isi nota
CREATE TABLE transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_sale INTEGER NOT NULL
);