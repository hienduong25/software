import {
  BriefcaseBusiness,
  ChevronRight,
  UserRoundSearch,
  Loader2,
  Eye,
  EyeOff,
  PanelsTopLeft,
} from "lucide-react";
import { useState, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";
import { AuthContext } from "../../context/AuthContext"; // Quan trọng để đẩy dữ liệu lên toàn App

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 16;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext); // Lấy hàm login từ Wi-Fi chung (Context)

  const initialRole =
    searchParams.get("role") === "employer" ? "employer" : "seeker";
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State để hứng dữ liệu nhập vào
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const roleOptions = [
    {
      id: "seeker",
      label: "Người tìm việc",
      icon: UserRoundSearch,
      description:
        "Đăng nhập để quản lý hồ sơ, tìm việc và theo dõi ứng tuyển.",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-300",
      accentBg: "bg-gradient-to-br from-blue-100 to-cyan-100",
      accentText: "text-blue-700",
      activeShadow: "shadow-blue-100",
    },
    {
      id: "employer",
      label: "Nhà tuyển dụng",
      icon: BriefcaseBusiness,
      description: "Đăng nhập để đăng tin và quản lý ứng viên.",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-300",
      accentBg: "bg-gradient-to-br from-emerald-100 to-teal-100",
      accentText: "text-emerald-700",
      activeShadow: "shadow-emerald-100",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "password" ? value.slice(0, PASSWORD_MAX_LENGTH) : value;

    setCredentials({ ...credentials, [name]: nextValue });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (
      credentials.password.length < PASSWORD_MIN_LENGTH ||
      credentials.password.length > PASSWORD_MAX_LENGTH
    ) {
      return alert(
        `Mật khẩu phải từ ${PASSWORD_MIN_LENGTH} đến ${PASSWORD_MAX_LENGTH} ký tự!`,
      );
    }

    setLoading(true);

    try {
      // 1. Gọi Backend để kiểm tra email/password
      const response = await authService.login({
        email: credentials.email,
        password: credentials.password,
        role: role,
      });

      // 2. Nếu đăng nhập thành công
      if (response && response.user) {
        if (response.user.role !== role) {
          alert(
            `Tài khoản này không thuộc nhóm ${
              role === "seeker" ? "Người tìm việc" : "Nhà tuyển dụng"
            }. Vui lòng đăng nhập đúng nhóm.`,
          );
          return;
        }

        // Lưu user (ví dụ: duong the hien) vào Context để các trang khác dùng
        login(response.user);

        alert(
          `Chào mừng, ${response.user.full_name || response.user.companyName}!`,
        );

        // 3. Chuyển hướng đúng theo vai trò
        navigate(role === "seeker" ? "/seeker" : "/employer");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const msg =
        error.response?.data?.detail || "Email hoặc mật khẩu không đúng!";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-10 lg:px-10">
      <div className="mesh-orb -left-25 top-5.5 h-72 w-72 bg-blue-300/50" />
      <div className="mesh-orb -bottom-20 -right-[17.5px] h-80 w-80 bg-emerald-200/60" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-md">
            <PanelsTopLeft size={28} />
          </div>
          <div>
            <Link
              to="/"
              className="text-2xl font-black text-slate-900 hover:text-slate-700 transition"
            >
              Job Portal System
            </Link>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Hệ thống tuyển dụng và tìm việc trực tuyến
            </p>
          </div>
        </div>

        <div className="grid min-h-[calc(100vh-9rem)] gap-8 lg:grid-cols-[1fr_1.05fr]">
          <div className="panel-surface flex flex-col justify-between rounded-3xl px-8 py-10 hover:shadow-lg transition bg-white/40 backdrop-blur-md border border-white/20">
            <div>
              <h1 className="mt-6 text-5xl leading-tight font-bold text-slate-900">
                Đăng nhập hệ thống
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 font-medium">
                Chọn đúng nhóm người dùng trước khi tiếp tục đăng nhập.
              </p>
            </div>

            <div className="space-y-3 mt-8">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                const isActive = role === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRole(option.id)}
                    className={`w-full rounded-3xl border-2 px-5 py-5 text-left transition duration-200 ${
                      isActive
                        ? `${option.borderColor} bg-linear-to-r ${option.bgGradient} shadow-lg ${option.activeShadow}`
                        : "border-slate-200 bg-white/80 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-2xl p-3 ${option.accentBg}`}>
                        <Icon size={26} className={option.accentText} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-xl font-bold text-slate-900">
                            {option.label}
                          </h3>
                          {isActive && (
                            <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white">
                              ✓ Đang chọn
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-5 text-slate-600 font-medium">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="panel-surface rounded-3xl px-8 py-10 lg:px-10 hover:shadow-lg transition bg-white/60 backdrop-blur-lg border border-white/20"
          >
            <div className="inline-flex rounded-full border-2 border-slate-200 bg-white/90 p-1">
              <span className="rounded-full bg-slate-700 px-4 py-2 text-sm font-bold text-white shadow-sm">
                Đăng nhập
              </span>
              <Link
                to={`/register?role=${role}`}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-700"
              >
                Đăng ký
              </Link>
            </div>

            <div className="mt-8">
              <h2 className="text-4xl font-bold text-slate-900">
                {role === "seeker" ? "Người tìm việc" : "Nhà tuyển dụng"}
              </h2>
            </div>

            <div className="mt-8 space-y-4">
              <label className="field-shell block rounded-2xl px-4 py-4 border border-slate-100 bg-white/50 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition-all">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  className="mt-3 w-full bg-transparent text-slate-900 outline-none font-medium"
                  placeholder="you@example.com"
                />
              </label>

              <label className="field-shell block rounded-2xl px-4 py-4 border border-slate-100 bg-white/50 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition-all">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mật khẩu
                </span>
                <div className="relative mt-3">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    maxLength={PASSWORD_MAX_LENGTH}
                    value={credentials.password}
                    onChange={handleChange}
                    className="w-full bg-transparent pr-10 text-slate-900 outline-none font-medium"
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex items-center text-slate-400 transition hover:text-slate-700"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
              <p className="px-1 text-xs text-slate-400">
                Mật khẩu phải từ {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} ký
                tự.
              </p>
            </div>

            <button
              disabled={loading}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Đăng nhập"
              )}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
