import {
  BriefcaseBusiness,
  ChevronRight,
  UserRoundSearch,
  Loader2,
  Eye,
  EyeOff,
  PanelsTopLeft,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 16;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)\S{8,16}$/;
const GMAIL_REGEX = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole =
    searchParams.get("role") === "employer" ? "employer" : "seeker";

  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    company_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const roleOptions = [
    {
      id: "seeker",
      label: "Người tìm việc",
      icon: UserRoundSearch,
      description: "Tạo tài khoản để quản lý hồ sơ và tìm kiếm việc làm.",
      tone: "sky",
    },
    {
      id: "employer",
      label: "Nhà tuyển dụng",
      icon: BriefcaseBusiness,
      description: "Tạo tài khoản để đăng tin tuyển dụng và quản lý ứng viên.",
      tone: "emerald",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "password" || name === "confirmPassword"
        ? value.slice(0, PASSWORD_MAX_LENGTH)
        : value;

    setFormData({ ...formData, [name]: nextValue });
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!GMAIL_REGEX.test(formData.email.trim())) {
      return alert(
        "Email phải đúng định dạng và bắt buộc sử dụng đuôi @gmail.com!",
      );
    }

    if (!PASSWORD_REGEX.test(formData.password)) {
      return alert(
        "Mật khẩu phải từ 8 đến 16 ký tự, có ít nhất 1 chữ cái viết hoa, 1 chữ số và không chứa khoảng trắng!",
      );
    }

    if (formData.password !== formData.confirmPassword) {
      return alert("Mật khẩu xác nhận không khớp!");
    }

    setLoading(true);
    try {
      // 2. Định dạng dữ liệu khớp với RegisterRequest của FastAPI
      const submitData = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: role,
        company_name: formData.company_name, // Thêm company_name cho employer
      };

      // 3. Gọi API thật qua authService
      const result = await authService.register(submitData);

      if (result) {
        alert("Đăng ký thành công! Hãy đăng nhập để bắt đầu.");
        // Chỉ navigate khi Backend đã xác nhận lưu dữ liệu thành công
        navigate(`/login?role=${role}`);
      }
    } catch (error) {
      // 4. Bắt lỗi từ Backend (Ví dụ: Email đã tồn tại)
      console.error("Register Error:", error);
      const errorDetail =
        error.response?.data?.detail || "Đăng ký thất bại. Vui lòng thử lại!";
      alert(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden px-6 py-10 lg:px-10 bg-slate-50/50">
      {/* Hiệu ứng nền */}
      <div className="mesh-orb left-[-6.25px] top-[-22.5px] h-72 w-72 bg-sky-300/60" />
      <div className="mesh-orb bottom-[-1.25px] right-[-17.5px] h-80 w-80 bg-amber-200/70" />

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

        <div className="grid min-h-[calc(100vh-9rem)] gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          {/* Left Side: Role Selection */}
          <div className="panel-surface flex flex-col justify-between rounded-[34px] px-6 py-8 shadow-sm border border-slate-200/60 bg-white/80 backdrop-blur-xl">
            <div>
              <h1 className="mt-2 text-4xl font-medium leading-[1.1] text-slate-900">
                Bắt đầu hành trình <br /> của bạn.
              </h1>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-500">
                Chọn đúng loại tài khoản để đăng ký và sử dụng các chức năng phù
                hợp với nhu cầu của bạn.
              </p>
            </div>

            <div className="space-y-3 mt-6 lg:mt-0">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                const isActive = role === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRole(option.id)}
                    className={`w-full rounded-[24px] border p-4 text-left transition-all duration-300 ${
                      isActive
                        ? option.tone === "sky"
                          ? "border-sky-300 bg-sky-50 shadow-md shadow-sky-100"
                          : "border-emerald-300 bg-emerald-50 shadow-md shadow-emerald-100"
                        : "border-slate-100 bg-white/50 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-2xl p-3 ${
                          option.tone === "sky"
                            ? "bg-sky-500 text-white"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        <Icon size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {option.label}
                          </h3>
                          {isActive && (
                            <div className="h-2 w-2 rounded-full bg-slate-900 animate-pulse" />
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-snug text-slate-500">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Registration Form */}
          <form
            onSubmit={handleRegister}
            className="panel-surface rounded-[34px] px-8 py-10 lg:px-12 shadow-sm border border-slate-200/60 bg-white/90 backdrop-blur-xl"
          >
            <div className="flex justify-between items-center">
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                <Link
                  to={`/login?role=${role}`}
                  className="rounded-full px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-all"
                >
                  Đăng nhập
                </Link>
                <span className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white shadow-sm">
                  Đăng ký
                </span>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-3xl font-bold text-slate-900">
                {role === "seeker"
                  ? "Tạo tài khoản Ứng viên"
                  : "Tạo tài khoản Tuyển dụng"}
              </h2>
              <p className="mt-2 text-slate-500">
                Vui lòng điền thông tin thật để thuật toán AI hoạt động chính
                xác.
              </p>
            </div>

            <div className="mt-8 grid gap-5">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                  {role === "seeker" ? "Họ và tên" : "Tên công ty / Tổ chức"}
                </label>
                <input
                  name={role === "seeker" ? "full_name" : "company_name"}
                  required
                  value={
                    role === "seeker"
                      ? formData.full_name
                      : formData.company_name
                  }
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                  placeholder={
                    role === "seeker"
                      ? "Ví dụ: Dương Thế Hiển"
                      : "Tên doanh nghiệp của bạn"
                  }
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Email liên hệ
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                  placeholder="example@gmail.com"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={PASSWORD_MIN_LENGTH}
                      maxLength={PASSWORD_MAX_LENGTH}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 pr-14 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700"
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="ml-1 text-xs text-slate-400">
                    8-16 ký tự, có ít nhất 1 chữ cái viết hoa, 1 chữ số và không
                    chứa khoảng trắng.
                  </p>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={PASSWORD_MIN_LENGTH}
                      maxLength={PASSWORD_MAX_LENGTH}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 pr-14 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700"
                      aria-label={
                        showConfirmPassword
                          ? "Ẩn xác nhận mật khẩu"
                          : "Hiện xác nhận mật khẩu"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <p className="ml-1 text-xs text-slate-400">
                    Xác nhận mật khẩu từ {PASSWORD_MIN_LENGTH}-
                    {PASSWORD_MAX_LENGTH} ký tự và phải trùng khớp với mật khẩu.
                  </p>
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-8 py-5 text-base font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang xử lý dữ liệu...
                </>
              ) : (
                <>
                  Hoàn tất đăng ký <ChevronRight size={20} />
                </>
              )}
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              Bằng việc đăng ký, bạn đồng ý với các Điều khoản & Chính sách của
              Job Portal System.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
