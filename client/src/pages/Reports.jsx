import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const [todayRes, bestRes] = await Promise.all([
        api.get("/transactions/reports/today"), // -> BE: /api/reports/today
        api.get("/transactions/reports/best-sellers"), // -> BE: /api/reports/best-sellers
      ]);
      setTodayData(todayRes.data);
      setBestSellers(bestRes.data);
      setErr("");
    } catch (error) {
      setErr(error.response?.data?.message || "Gagal ambil laporan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Blokir kalau bukan owner
    if (user?.role!== "owner") {
      navigate("/dashboard");
      return;
    }
    fetchReports();
  }, [user?.role, navigate, fetchReports]);

  const handleExportExcel = async () => {
    try {
      const res = await api.get("/transactions"); // -> BE: /api/transactions
      const today = new Date().toISOString().split("T")[0];
      const todayTrans = res.data.filter((t) => t.created_at.startsWith(today));

      const ws1 = XLSX.utils.json_to_sheet(
        todayTrans.map((t) => ({
          ID: t.id,
          Kasir: t.kasir, // <- BE ngirimnya 'kasir' ✅
          Total: t.total_amount, // <- FIX: BE ngirimnya 'total_amount' ✅ bukan 'total_price'
          Waktu: new Date(t.created_at).toLocaleString("id-ID"),
        })),
      );

      const ws2 = XLSX.utils.json_to_sheet(
        bestSellers.map((item, i) => ({
          Rank: i + 1,
          "Nama Produk": item.name,
          "Total Terjual": item.total_terjual, // <- BE ngirimnya 'total_terjual' ✅
        })),
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws1, "Transaksi Hari Ini");
      XLSX.utils.book_append_sheet(wb, ws2, "Best Seller");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(data, `Laporan-SISKO-${today}.xlsx`);
    } catch (error) {
      alert("Gagal export: " + (error.response?.data?.message || error.message));
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
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            Export Excel
          </button>
          <button
            onClick={fetchReports}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-gray-500 dark:text-gray-400">Loading laporan...</p>
      )}
      {err && (
        <p className="text-red-500 bg-red-100 dark:bg-red-900 p-2 rounded">
          {err}
        </p>
      )}

      {!loading &&!err && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Omzet Hari Ini
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                Rp {Number(todayData.total_omzet).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Transaksi Hari Ini
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Number(todayData.total_transaksi)} Transaksi
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              5 Barang Terlaris
            </h2>
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-600">
                  <th className="text-left p-2 text-gray-900 dark:text-white">Rank</th>
                  <th className="text-left p-2 text-gray-900 dark:text-white">Nama Produk</th>
                  <th className="text-right p-2 text-gray-900 dark:text-white">Total Terjual</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.length === 0? (
                  <tr>
                    <td colSpan="3" className="text-center p-4 text-gray-500 dark:text-gray-400">
                      Belum ada penjualan
                    </td>
                  </tr>
                ) : (
                  bestSellers.map((item, index) => (
                    <tr key={index} className="border-b dark:border-gray-700">
                      <td className="p-2 text-gray-900 dark:text-white">#{index + 1}</td>
                      <td className="p-2 text-gray-900 dark:text-white">{item.name}</td>
                      <td className="p-2 text-right font-bold text-gray-900 dark:text-white">
                        {Number(item.total_terjual)} pcs
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