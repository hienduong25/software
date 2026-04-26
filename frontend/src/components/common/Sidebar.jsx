import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getSavedNotifications } from "../../utils/notificationStorage";
import {
  LayoutDashboard,
  Briefcase,
  User,
  ClipboardList,
  Building2,
  Users,
  PlusSquare,
  Search,
  Settings,
  LogOut,
} from "lucide-react";

const SEEKER_LINKS = [
  { to: "/seeker", label: "Tổng Quan", icon: LayoutDashboard },
  { to: "/seeker/jobs", label: "Job Board", icon: Search },
  { to: "/seeker/profile", label: "Hồ Sơ / CV", icon: User },
  { to: "/seeker/applications", label: "Đơn Ứng Tuyển", icon: ClipboardList },
  { to: "/seeker/settings", label: "Cài Đặt", icon: Settings },
];

const EMPLOYER_LINKS = [
  { to: "/employer", label: "Tổng Quan", icon: LayoutDashboard },
  { to: "/employer/post-job", label: "Đăng Tin", icon: PlusSquare },
  { to: "/employer/manage-jobs", label: "Quản Lý Job", icon: Briefcase },
  { to: "/employer/applicants", label: "Ứng Viên", icon: Users },
  { to: "/employer/company-profile", label: "Hồ Sơ Công Ty", icon: Building2 },
  { to: "/employer/settings", label: "Cài Đặt", icon: Settings },
];

export default function Sidebar({ role }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(getSavedNotifications());
  }, []);

  const handleLogout = () => {
    logout(); // Dùng context logout — dọn sạch CV, applications, notifications
    navigate("/login");
  };

  const links = role === "seeker" ? SEEKER_LINKS : EMPLOYER_LINKS;
  const bgGradient =
    role === "seeker"
      ? "from-blue-500 to-blue-600"
      : "from-emerald-500 to-emerald-600";
  const activeStyles =
    role === "seeker"
      ? "bg-blue-50 text-blue-600 shadow-sm"
      : "bg-emerald-50 text-emerald-600 shadow-sm";

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <aside className="fixed left-4 top-4 hidden h-[calc(100vh-2rem)] w-80 rounded-3xl lg:block overflow-y-auto scrollbar-hide">
      <div className="panel-surface h-full flex flex-col justify-between rounded-3xl p-6 shadow-sm border border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="space-y-6">
          {/* Logo */}
          <div className={`rounded-2xl bg-linear-to-br ${bgGradient} px-5 py-6 text-white shadow-lg`}>
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">Workspace</p>
            <h1 className="mt-2 text-2xl font-black text-white italic">JOB PORTAL SYSTEM</h1>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === `/${role}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? activeStyles
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={20} strokeWidth={2.5} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom: Logout */}
        <div className="border-t border-slate-100 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition"
          >
            <LogOut size={20} />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
