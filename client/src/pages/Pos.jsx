import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StrukPrint from '../components/StrukPrint';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function POS() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState('');
  const [showStruk, setShowStruk] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Helper: Paksa jadi angka biar gak NaN
  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num)? 0 : num;
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setPayErr('');
    const exist = cart.find(item => item.id === product.id);
    if (exist) {
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

  // FIX 1: Total keranjang pakai safeNumber biar anti NaN
  const total = cart.reduce((sum, item) => {
    return sum + (safeNumber(item.price) * safeNumber(item.qty));
  }, 0);

  // FUNGSI DOWNLOAD PDF BARU
  const downloadPDF = async () => {
    const element = document.getElementById('struk-capture');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, canvas.height * 80 / canvas.width] // ukuran struk 80mm
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Struk-${String(lastTransaction.data.transaction_id).padStart(6, '0')}.pdf`);
  };

  const handleBayar = async () => {
    if (cart.length === 0) return;
    setPaying(true);
    setPayErr('');

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const payload = {
      items: cart.map(item => ({ product_id: item.id, qty: item.qty })),
      payment_method: 'cash'
    };

    try {
      const res = await api.post('/transactions', payload);

      // FIX 2: total_amount bukan total_price
      const strukData = {
        transaction_id: res.data.transaction_id,
        total_price: res.data.total_amount, // <- INI YG DIBENERIN
        items: cart.map(i => ({
         ...i, 
          price: safeNumber(i.price), // <- Kunci angka
          qty: safeNumber(i.qty)
        }))
      };
      setLastTransaction({ data: strukData, user });

      setCart([]);
      fetchProducts();
      setShowStruk(true);

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
                  <p className="text-sm text-blue-600 dark:text-blue-400">Rp {safeNumber(p.price).toLocaleString('id-ID')}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* KAN: KERANJANG */}
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
                    {/* FIX 3: Subtotal item juga pakai safeNumber */}
                    <span>Rp {(safeNumber(item.price) * safeNumber(item.qty)).toLocaleString('id-ID')}</span>
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

      {/* MODAL PREVIEW STRUK + PDF */}
      {showStruk && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowStruk(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white">Preview Struk</h3>
              <button
                onClick={() => setShowStruk(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-900 flex justify-center overflow-auto max-h-[70vh]">
              <div id="struk-capture" className="bg-white shadow-md">
                <StrukPrint transaction={lastTransaction?.data} user={lastTransaction?.user} />
              </div>
            </div>

            <div className="p-4 border-t dark:border-gray-700 flex gap-2">
              <button
                onClick={() => setShowStruk(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                Tutup
              </button>
              <button
                onClick={downloadPDF}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}