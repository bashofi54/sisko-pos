export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Halo, {user?.username}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Role: {user?.role}</p>
        <button onClick={logout} className="mt-6 bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
        <p className="mt-8 text-gray-500 dark:text-gray-400">Langkah 12: Tabel produk muncul di sini</p>
      </div>
    </div>
  );
}