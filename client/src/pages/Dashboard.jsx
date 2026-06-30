import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // <- 1. TAMBAH INI
import api from "../api/axios";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role; // 'owner' | 'gudang' | 'kasir'

  // RULE ROLE BARU: SEMUA BOLEH TAMBAH, EDIT, HAPUS. CUMA OWNER YG LIAT LAPORAN
  const canAddProducts = role === 'owner' || role === 'gudang' || role === 'kasir'; // Semua boleh tambah
  const canEditProducts = role === 'owner' || role === 'gudang' || role === 'kasir'; // <- 2. KASIR DITAMBAHIN BOLEH EDIT
  const canDeleteProducts = role === 'owner' || role === 'gudang' || role === 'kasir'; // <- 3. KASIR & GUDANG DITAMBAHIN BOLEH HAPUS
  const canSeeReports = role === 'owner'; // Cuma Owner
  const canOpenKasir = role === 'owner' || role === 'kasir'; // Owner & Kasir
  const canManageProducts = canAddProducts || canEditProducts || canDeleteProducts; // Ada kolom aksi atau enggak

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "", barcode: "", price: "", stock: "",
  });
  const [formErr, setFormErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data);
      setErr("");
    } catch (error) {
      setErr(error.response?.data?.message || "Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const openAddModal = () => {
    setIsEdit(false);
    setFormData({ name: "", barcode: "", price: "", stock: "" });
    setFormErr("");
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEdit(true);
    setEditId(product.id);
    setFormData({
      name: product.name,
      barcode: product.barcode || "",
      price: product.price,
      stock: product.stock,
    });
    setFormErr("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr("");
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        barcode: formData.barcode || null,
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
      };
      if (isEdit) {
        await api.put(`/products/${editId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      setFormErr(error.response?.data?.message || "Gagal simpan produk");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus produk ini?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal hapus produk");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Halo, {user?.username}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              Role: {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Data Produk
            </h2>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Cari nama / barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-1 px-2 border dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
              />
              {canAddProducts && ( // <- Owner, Gudang, Kasir
                <button
                  onClick={openAddModal}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  + Tambah Produk
                </button>
              )}
              <button
                onClick={fetchProducts}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Refresh
              </button>
              {canOpenKasir && ( // <- CUMA Owner & Kasir
                <Link // <- 4. GANTI DARI <a> KE <Link>
                  to="/pos" // <- 5. href -> to
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                >
                  Buka Kasir
                </Link>
              )}
              {canSeeReports && ( // <- Cuma Owner
                <Link // <- 6. GANTI DARI <a> KE <Link>
                  to="/reports" // <- 7. href -> to
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  Laporan
                </Link>
              )}
            </div>
          </div>

          {loading && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}
          {err && <p className="text-red-500 bg-red-100 dark:bg-red-900 p-2 rounded">{err}</p>}

          {!loading && !err && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="border dark:border-gray-600 p-2 text-left text-gray-900 dark:text-white">Nama</th>
                    <th className="border dark:border-gray-600 p-2 text-left text-gray-900 dark:text-white">Barcode</th>
                    <th className="border dark:border-gray-600 p-2 text-left text-gray-900 dark:text-white">Harga</th>
                    <th className="border dark:border-gray-600 p-2 text-left text-gray-900 dark:text-white">Stok</th>
                    {canManageProducts && (
                      <th className="border dark:border-gray-600 p-2 text-center text-gray-900 dark:text-white">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={canManageProducts ? 5 : 4}
                        className="border dark:border-gray-600 p-4 text-center text-gray-500 dark:text-gray-400">
                        Belum ada produk
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="border dark:border-gray-600 p-2 text-gray-900 dark:text-white">{p.name}</td>
                        <td className="border dark:border-gray-600 p-2 text-gray-900 dark:text-white">{p.barcode || "-"}</td>
                        <td className="border dark:border-gray-600 p-2 text-gray-900 dark:text-white">Rp {p.price?.toLocaleString("id-ID")}</td>
                        <td className="border dark:border-gray-600 p-2 text-gray-900 dark:text-white">{p.stock}</td>
                        {canManageProducts && (
                          <td className="border dark:border-gray-600 p-2 text-center space-x-1">
                            {canEditProducts && ( // <- Owner, Gudang, Kasir
                              <button
                                onClick={() => openEditModal(p)}
                                className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                              >
                                Edit
                              </button>
                            )}
                            {canDeleteProducts && ( // <- Owner, Gudang, Kasir
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                              >
                                Hapus
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT PRODUK */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
            </h3>
            {formErr && <p className="text-red-500 bg-red-100 dark:bg-red-900 p-2 rounded mb-4 text-sm">{formErr}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Nama Produk *" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" required />
              <input type="text" placeholder="Barcode" value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full p-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
              <input type="number" placeholder="Harga *" value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" required />
              <input type="number" placeholder="Stok" value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full p-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400">Batal</button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400">
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}