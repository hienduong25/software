import { useMemo, useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  getSeekerProfile,
  updateSeekerProfile,
  uploadSeekerAvatar,
} from "../../services/seekerService";
import {
  getEmployerProfile,
  updateCompanyProfile,
  uploadEmployerAvatar,
} from "../../services/employerService";

const defaultSeekerForm = {
  fullName: "",
  title: "Job Seeker",
  avatar: "",
  emailUpdates: true,
  phone: "",
};

const defaultEmployerForm = {
  companyName: "",
  title: "Employer",
  avatar: "",
  industry: "",
  address: "",
  description: "",
  emailUpdates: true,
};

const cacheBust = (url) => {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
};

export default function SettingsPage({ role }) {
  const { user, updateUser } = useContext(AuthContext);
  const initialSettings = useMemo(
    () => (role === "seeker" ? defaultSeekerForm : defaultEmployerForm),
    [role],
  );
  const [form, setForm] = useState(initialSettings);
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const title =
    role === "seeker" ? "Cài đặt người tìm việc" : "Cài đặt nhà tuyển dụng";
  const nameLabel = role === "seeker" ? "Họ và tên" : "Tên công ty";

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("Selected avatar file:", file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setForm((current) => ({ ...current, avatar: previewUrl }));
    setMessage("Ảnh đại diện đã được cập nhật, nhớ bấm Lưu thay đổi.");
  };

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        if (role === "seeker") {
          const profile = await getSeekerProfile(user.id);
          setForm({
            fullName: profile.full_name || "",
            title: profile.title || "Job Seeker",
            avatar: cacheBust(profile.avatar || ""),
            emailUpdates: profile.emailUpdates ?? true,
            phone: profile.phone || "",
          });
        } else {
          const profile = await getEmployerProfile(user.id);
          setForm({
            companyName: profile.companyName || "",
            title: profile.title || "Employer",
            avatar: cacheBust(profile.avatar || ""),
            industry: profile.industry || "",
            address: profile.address || "",
            description: profile.description || "",
            emailUpdates: profile.emailUpdates ?? true,
          });
        }
      } catch (error) {
        console.error("Load profile error:", error);
      }
    };

    loadProfile();
  }, [role, user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      let avatarUrl = form.avatar;
      if (avatarFile) {
        console.log("Uploading avatar file", avatarFile);
        const uploadResult =
          role === "seeker"
            ? await uploadSeekerAvatar(user.id, avatarFile)
            : await uploadEmployerAvatar(user.id, avatarFile);
        console.log("Upload result:", uploadResult);
        avatarUrl = uploadResult.avatar;
      }
      console.log("Saving with avatarUrl", avatarUrl);

      if (role === "seeker") {
        const updated = await updateSeekerProfile(user.id, {
          full_name: form.fullName,
          title: form.title,
          avatar: avatarUrl,
          emailUpdates: form.emailUpdates,
          phone: form.phone,
        });
        updateUser({ full_name: updated.full_name, title: updated.title, avatar: updated.avatar });
        setForm((current) => ({ ...current, avatar: cacheBust(updated.avatar) }));
      } else {
        const updated = await updateCompanyProfile(user.id, {
          title: form.title,
          avatar: avatarUrl,
          emailUpdates: form.emailUpdates,
        });
        updateUser({ title: updated.title, avatar: updated.avatar });
        setForm((current) => ({ ...current, avatar: cacheBust(updated.avatar) }));
      }
      setAvatarFile(null);
      setMessage("Đã lưu cài đặt.");
    } catch (error) {
      console.error("Save profile error:", error);
      setMessage("Lưu thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel-surface rounded-[34px] px-6 py-7 lg:px-8">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
          Settings
        </p>
        <h1 className="mt-3 text-4xl text-slate-900">{title}</h1>
      </div>

      <div className="panel-surface max-w-4xl rounded-[34px] p-6 lg:p-8">
        {message ? (
          <div className="mb-5 rounded-[3xl] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="rounded-[28px] bg-linear-to-br from-sky-50 via-white to-emerald-50 p-5 text-center shadow-sm">
            <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-sky-500 to-emerald-400">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  onLoad={() => console.log("Avatar loaded", form.avatar)}
                  onError={(e) => {
                    console.error("Avatar load error", e, form.avatar);
                    if (!e.target.src.includes("default-avatar.png")) {
                      e.target.src = "/path/to/default-avatar.png"; // Replace with the actual path to your default avatar image
                    }
                  }}
                />
              ) : (
                <span className="text-4xl font-semibold text-white">
                  {(form.fullName || form.companyName || "U").charAt(0)}
                </span>
              )}
            </div>

            <div className="mt-4 rounded-2xl bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Đang hiển thị
              </p>
              <p className="mt-2 text-lg font-semibold text-sky-800">
                {form.fullName || form.companyName || "Người dùng"}
              </p>
              <p className="text-sm text-slate-500">{form.title || "Tài khoản"}</p>
            </div>

            <label className="mt-4 inline-flex cursor-pointer rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Chọn ảnh
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="grid gap-4">
            {role === "seeker" ? (
              <label className="field-shell block rounded-2xl px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {nameLabel}
                </span>
                <input
                  className="mt-2 w-full bg-transparent outline-none"
                  value={form.fullName || ""}
                  onChange={handleChange("fullName")}
                />
              </label>
            ) : (
              <div className="field-shell block rounded-2xl px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {nameLabel}
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 outline-none"
                  value={form.companyName || ""}
                  readOnly
                />
                <p className="mt-2 text-xs text-slate-500">
                  Tên công ty chỉ có thể thay đổi trong trang Hồ Sơ Công Ty.
                </p>
              </div>
            )}

            <label className="field-shell block rounded-2xl px-4 py-3">
              <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Chức danh hiển thị
              </span>
              <input
                className="mt-2 w-full bg-transparent outline-none"
                value={form.title || ""}
                onChange={handleChange("title")}
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
              <div>
                <p className="font-semibold text-slate-900">Email thông báo</p>
                <p className="text-sm text-slate-500">
                  Nhận cập nhật về hồ sơ và hoạt động mới.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(form.emailUpdates)}
                onChange={handleChange("emailUpdates")}
                className="h-5 w-5"
              />
            </label>

            <button
              type="button"
              onClick={handleSave}
              className="primary-button mt-2 w-fit rounded-2xl px-6 py-3 text-sm font-semibold transition"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
