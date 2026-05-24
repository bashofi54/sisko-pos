-- File: database/seeds.sql
-- Tujuan: Isi data awal biar bisa langsung tes login & jualan
USE sisko_pos_db;

-- Password untuk semua user: "123456"
-- Ini udah di-hash pake bcrypt. Jangan pake 123456 asli di production ya.
INSERT INTO users (name, username, password, role) VALUES
('Bu Sari', 'owner', '$2b$10$fW4y.pO5e.tYcS9aY9z3.uQ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT', 'owner'),
('Mas Agus', 'kasir1', '$2b$10$fW4y.pO5e.tYcS9aY9z3.uQ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT', 'kasir'),
('Mba Rina', 'gudang1', '$2b$10$fW4y.pO5e.tYcS9aY9z3.uQ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT', 'gudang');

INSERT INTO products (name, barcode, price, stock) VALUES
('Indomie Goreng', '8992388123456', 3500, 100),
('Aqua 600ml', '8992388654321', 3000, 50),
('Beras 5kg Premium', '8992388987654', 65000, 20),
('Gula Pasir 1kg', '8992388111222', 16000, 75),
('Minyak Goreng 2L', '8992388333444', 32000, 40);