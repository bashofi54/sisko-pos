import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
      setErr('');
    } catch (error) {
      setErr(error.response?.data?.message || 'Gagal ambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Halo, {user?.username}</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">Role: {user?.role}</p>
          </div>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Produk</h2>
            <button onClick={fetchProducts} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
              Refresh
            </button>
          </div>

          {loading && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}
          {err && <p className="text-red-500 bg-red-100 dark:bg-red-900 p-2 rounded">{err}</p>}
          
          {!loading && !err && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="border dark:border-gray-600 p-2 text-left text-gray-900 dark:text-white">Nama</th>
                    <th className="border dark:border-gray-600 p-2 text-left text-gray-900 dark:text-white">Harga</th>
                    <th className="border dark:border-gray-600 p-2 text-left text-gray-900 dark:text-white">Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="border dark:border-gray-600 p-4 text-center text-gray-500 dark:text-gray-400">
                        Belum ada produk
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="border dark:border-gray-600 p-2 text-gray-900 dark:text-white">{p.name}</td>
                        <td className="border dark:border-gray-600 p-2 text-gray-900 dark:text-white">Rp {p.price?.toLocaleString('id-ID')}</td>
                        <td className="border dark:border-gray-600 p-2 text-gray-900 dark:text-white">{p.stock}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}