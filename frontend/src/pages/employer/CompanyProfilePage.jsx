import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  getEmployerProfile,
  updateCompanyProfile,
  uploadEmployerAvatar,
} from "../../services/employerService";

const defaultEmployerForm = {
  companyName: "",
  title: "Employer",
  avatar: "",
  industry: "",
  address: "",
  description: "",
  emailUpdates: true,
};

export default function CompanyProfilePage() {
  const { user, updateUser } = useContext(AuthContext);
  const [form, setForm] = useState(defaultEmployerForm);
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadEmployerProfile = async () => {
      try {
        const profile = await getEmployerProfile(user.id);
        setForm({
          companyName: profile.companyName || "",
          title: profile.title || "Employer",
          avatar: profile.avatar || "",
          industry: profile.industry || "",
          address: profile.address || "",
          description: profile.description || "",
          emailUpdates: profile.emailUpdates ?? true,
        });
      } catch (error) {
        console.error("Load employer profile error:", error);
      }
    };

    loadEmployerProfile();
  }, [user]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setForm((current) => ({ ...current, avatar: previewUrl }));
    setMessage("Logo đã được cập nhật. Hãy bấm Cập nhật để lưu.");
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      let avatarUrl = form.avatar;
      if (avatarFile) {
        const uploadResult = await uploadEmployerAvatar(user.id, avatarFile);
        avatarUrl = uploadResult.avatar;
      }

      const updated = await updateCompanyProfile(user.id, {
        companyName: form.companyName,
        title: form.title,
        avatar: avatarUrl,
        industry: form.industry,
        address: form.address,
        description: form.description,
        emailUpdates: form.emailUpdates,
      });
      setAvatarFile(null);
      setForm((current) => ({ ...current, avatar: updated.avatar }));
      updateUser({ companyName: updated.companyName, title: updated.title, avatar: updated.avatar });
      setMessage("Đã cập nhật hồ sơ công ty.");
    } catch (error) {
      console.error("Save employer profile error:", error);
      setMessage("Lưu thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="panel-surface max-w-4xl rounded-[34px] p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Hồ Sơ Công Ty</h1>

      {message ? (
        <div className="mb-5 rounded-[3xl] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="rounded-[28px] bg-linear-to-br from-cyan-50 via-white to-emerald-50 p-5 text-center shadow-sm">
          <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-[28px] bg-linear-to-br from-cyan-500 to-emerald-400">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt={form.companyName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-semibold text-white">
                {(form.companyName || "C").charAt(0)}
              </span>
            )}
          </div>
          <div className="mt-4 rounded-2xl bg-white/85 px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Doanh nghiệp
            </p>
            <p className="mt-2 text-lg font-semibold text-cyan-800">
              {form.companyName || "Công ty"}
            </p>
            <p className="text-sm text-slate-500">{form.industry || "Chưa cập nhật lĩnh vực"}</p>
          </div>
          <label className="mt-4 inline-flex cursor-pointer rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Tải logo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <label className="field-shell block rounded-2xl px-4 py-3">
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Tên công ty
            </span>
            <input
              className="mt-2 w-full bg-transparent outline-none"
              placeholder="Tên công ty"
              value={form.companyName || ""}
              onChange={handleChange("companyName")}
            />
          </label>
          <label className="field-shell block rounded-2xl px-4 py-3">
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Lĩnh vực
            </span>
            <input
              className="mt-2 w-full bg-transparent outline-none"
              placeholder="Lĩnh vực"
              value={form.industry || ""}
              onChange={handleChange("industry")}
            />
          </label>
          <label className="field-shell block rounded-2xl px-4 py-3">
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Địa chỉ
            </span>
            <input
              className="mt-2 w-full bg-transparent outline-none"
              placeholder="Địa chỉ"
              value={form.address || ""}
              onChange={handleChange("address")}
            />
          </label>
          <label className="field-shell block rounded-2xl px-4 py-3">
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Mô tả công ty
            </span>
            <textarea
              className="mt-2 h-32 w-full resize-none bg-transparent outline-none"
              placeholder="Mô tả công ty"
              value={form.description || ""}
              onChange={handleChange("description")}
            />
          </label>

          <button
            type="button"
            onClick={handleSave}
            className="primary-button px-6 py-3 rounded-2xl font-semibold transition"
          >
            Cập Nhật
          </button>
        </div>
      </div>
    </div>
  );
}
