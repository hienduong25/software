import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar đơn giản */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold gradient-text">JobPortal AI</Link>
          <div className="flex gap-4">
            <Link to="/login" className="secondary-button px-4 py-2 rounded-xl text-sm">Đăng nhập</Link>
            <Link to="/register" className="primary-button px-4 py-2 rounded-xl text-sm">Bắt đầu ngay</Link>
          </div>
        </div>
      </nav>

      {/* Nội dung trang */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}