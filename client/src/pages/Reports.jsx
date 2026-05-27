import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Reports() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [todayData, setTodayData] = useState({
    total_omzet: 0,
    total_transaksi: 0,
  });
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    // Cek role dulu, kalo bukan admin tendang balik
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchReports();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [todayRes, bestRes] = await Promise.all([
        api.get("/reports/today"),
        api.get("/reports/best-sellers"),
      ]);
      setTodayData(todayRes.data);
      setBestSellers(bestRes.data);
      setErr("");
    } catch (error) {
      setErr(error.response?.data?.message || "Gagal ambil laporan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
        >
          ← Kembali ke Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Laporan Penjualan
        </h1>
        <button
          onClick={fetchReports}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <p className="text-gray-500 dark:text-gray-400">Loading laporan...</p>
      )}
      {err && (
        <p className="text-red-500 bg-red-100 dark:bg-red-900 p-2 rounded">
          {err}
        </p>
      )}

      {!loading && !err && (
        <>
          {/* KARTU OMZET HARI INI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Omzet Hari Ini
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                Rp {todayData.total_omzet.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Transaksi Hari Ini
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {todayData.total_transaksi} Transaksi
              </p>
            </div>
          </div>

          {/* TABEL BARANG TERLARIS */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              5 Barang Terlaris
            </h2>
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-600">
                  <th className="text-left p-2 text-gray-900 dark:text-white">
                    Rank
                  </th>
                  <th className="text-left p-2 text-gray-900 dark:text-white">
                    Nama Produk
                  </th>
                  <th className="text-right p-2 text-gray-900 dark:text-white">
                    Total Terjual
                  </th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center p-4 text-gray-500 dark:text-gray-400"
                    >
                      Belum ada penjualan
                    </td>
                  </tr>
                ) : (
                  bestSellers.map((item, index) => (
                    <tr key={index} className="border-b dark:border-gray-700">
                      <td className="p-2 text-gray-900 dark:text-white">
                        #{index + 1}
                      </td>
                      <td className="p-2 text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="p-2 text-right font-bold text-gray-900 dark:text-white">
                        {item.total_terjual} pcs
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
