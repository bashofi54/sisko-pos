-- File: database/seeds.sql VERSI FIX
INSERT INTO users (name, username, password, role) VALUES
('Bu Sari', 'owner', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner'),
('Mas Agus', 'kasir1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kasir'),
('Mba Rina', 'gudang1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'gudang');

INSERT INTO products (name, barcode, price, stock) VALUES
('Indomie Goreng', '8992388123456', 3500, 100),
('Aqua 600ml', '8992388654321', 3000, 50),
('Beras 5kg Premium', '8992388987654', 65000, 20),
('Gula Pasir 1kg', '8992388111222', 16000, 75),
('Minyak Goreng 2L', '8992388333444', 32000, 40);