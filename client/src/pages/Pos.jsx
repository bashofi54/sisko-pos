import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function POS() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState('');

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setPayErr(''); // Hapus error lama
    const exist = cart.find(item => item.id === product.id);
    if (exist) {
      // Cek stok dulu sebelum nambah qty
      if (exist.qty >= product.stock) {
        alert(`Stok ${product.name} cuma ${product.stock}`);
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id? {...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, {...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id!== id));
  };

  const updateQty = (id, newQty) => {
    const product = products.find(p => p.id === id);
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    if (newQty > product.stock) {
      alert(`Stok ${product.name} cuma ${product.stock}`);
      return;
    }
    setCart(cart.map(item => item.id === id? {...item, qty: newQty } : item));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleBayar = async () => {
    if (cart.length === 0) return;
    setPaying(true);
    setPayErr('');

    const payload = {
      items: cart.map(item => ({ product_id: item.id, qty: item.qty })),
      payment_method: 'cash' // default dulu, nanti bisa dibikin pilih
    };

    try {
      const res = await api.post('/transactions', payload);
      alert(`Transaksi sukses! ID: ${res.data.transaction_id}\nTotal: Rp ${res.data.total_price.toLocaleString('id-ID')}`);
      setCart([]); // Kosongin keranjang
      fetchProducts(); // Refresh stok produk
    } catch (error) {
      setPayErr(error.response?.data?.message || 'Transaksi gagal');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
        >
          ← Kembali ke Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KIRI: LIST PRODUK */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg">
          <input
            type="text"
            placeholder="Scan barcode / cari nama produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 mb-4 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
            autoFocus
          />

          {loading? <p>Loading...</p> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[70vh] overflow-y-auto">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0}
                  className="p-3 border dark:border-gray-600 rounded text-left hover:bg-blue-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Stok: {p.stock}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Rp {p.price?.toLocaleString('id-ID')}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* KANAN: KERANJANG */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Keranjang</h2>

          {cart.length === 0? (
            <p className="text-gray-500 dark:text-gray-400">Keranjang kosong</p>
          ) : (
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="text-sm text-gray-900 dark:text-white">
                  <div className="flex justify-between font-semibold">
                    <span className="truncate">{item.name}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs">Hapus</button>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="bg-gray-300 dark:bg-gray-600 px-2 rounded">-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="bg-gray-300 dark:bg-gray-600 px-2 rounded">+</button>
                    </div>
                    <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t dark:border-gray-600 pt-4">
            {payErr && <p className="text-red-500 bg-red-100 dark:bg-red-900 p-2 rounded mb-2 text-sm">{payErr}</p>}
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Total:</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={handleBayar}
              disabled={cart.length === 0 || paying}
              className="w-full mt-4 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 disabled:bg-gray-400"
            >
              {paying? 'Memproses...' : 'BAYAR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}