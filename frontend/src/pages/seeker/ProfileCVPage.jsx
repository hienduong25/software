import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { deleteCV, getSavedCVs, saveCV } from "../../utils/cvStorage";
import { readImageFile } from "../../utils/profileStorage";
import { getSeekerProfile, updateSeekerProfile } from "../../services/seekerService";

const VIETNAM_PHONE_REGEX = /^0(?:2\d{8,9}|[35789]\d{8})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Kéo ra ngoài component để tránh re-create mỗi render
const EMPTY_FORM = {
  id: "",
  name: "",
  fullName: "",
  email: "",
  phone: "",
  title: "",
  skills: "",
  experience: "",
  cvUrl: "",
  summary: "",
  avatar: "",
};

const normalizePhone = (phone) => (phone || "").replace(/\D/g, "");
const validatePhone = (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) return "";
  return VIETNAM_PHONE_REGEX.test(normalized) ? normalized : false;
};
const validateEmail = (email) => {
  const normalized = (email || "").trim();
  if (!normalized) return "";
  return EMAIL_REGEX.test(normalized) ? normalized : false;
};

export default function ProfileCVPage() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [message, setMessage] = useState("");
  const [savedCvs, setSavedCvs] = useState([]);
  const [previewCv, setPreviewCv] = useState(null);
  const previewRef = useRef(null);

  // Reset khi đổi user
  useEffect(() => {
    setSavedCvs(getSavedCVs(user));
    setPreviewCv(null);
    setMessage("");
    setForm({ ...EMPTY_FORM });
  }, [user]);

  // Load profile từ backend
  useEffect(() => {
    if (!user?.id) return;

    getSeekerProfile(user.id)
      .then((profile) => {
        setForm((current) => ({
          ...current,
          fullName: profile.full_name || user.full_name || "",
          email: profile.email || user.email || "",
          phone: profile.phone || "",
          title: profile.title || "",
          skills: profile.skills || "",
          experience: profile.experience || "",
          cvUrl: profile.cv_url || "",
          summary: profile.cv_content || "",
          avatar: profile.avatar || "",
        }));
      })
      .catch(() => {
        setForm((current) => ({
          ...current,
          fullName: user.full_name || "",
          email: user.email || "",
        }));
      });
  }, [user]);

  // Scroll đến preview khi chọn xem CV
  useEffect(() => {
    if (previewCv && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [previewCv]);

  const handleChange = (field) => (e) =>
    setForm((current) => ({ ...current, [field]: e.target.value }));

  const handlePhoneChange = (e) => {
    const val = normalizePhone(e.target.value).slice(0, 11);
    setForm((current) => ({ ...current, phone: val }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const avatar = await readImageFile(file);
    setForm((current) => ({ ...current, avatar }));
    setMessage("Ảnh CV đã được cập nhật. Hãy bấm Lưu CV để ghi lại.");
  };

  const handleCreateNew = () => {
    setForm({ ...EMPTY_FORM });
    setPreviewCv(null);
    setMessage("Biểu mẫu đã được làm mới. Lần lưu tiếp theo sẽ tạo một CV mới.");
  };

  const handleSave = async () => {
    const normalizedEmail = validateEmail(form.email);
    const normalizedPhone = validatePhone(form.phone);

    if (normalizedEmail === false) { setMessage("Email không đúng định dạng."); return; }
    if (normalizedPhone === false) { setMessage("Chỉ chấp nhận số điện thoại Việt Nam 10-11 số."); return; }

    const nextForm = { ...form, email: normalizedEmail || "", phone: normalizedPhone || "" };
    const saved = saveCV(nextForm, user);

    try {
      if (user?.id) {
        await updateSeekerProfile(user.id, {
          full_name: nextForm.fullName,
          phone: nextForm.phone,
          title: nextForm.title,
          avatar: nextForm.avatar,
          skills: nextForm.skills,
          experience: nextForm.experience,
          cv_content: nextForm.summary,
          cv_url: nextForm.cvUrl,
        });
      }

      setSavedCvs(getSavedCVs(user));
      setPreviewCv(form.id ? saved : null);
      setForm(
        form.id
          ? { ...form, id: saved.id, phone: nextForm.phone }
          : { ...EMPTY_FORM, fullName: nextForm.fullName, email: nextForm.email },
      );
      setMessage(form.id ? "CV đã được cập nhật và đồng bộ vào hồ sơ ứng viên." : "CV đã được lưu và đồng bộ vào hồ sơ ứng viên.");
    } catch {
      setMessage("Đã lưu CV cục bộ nhưng đồng bộ hồ sơ ứng viên thất bại.");
    }
  };

  const handleEdit = (cv) => {
    setForm({
      id: cv.id, name: cv.name || "", fullName: cv.fullName || "",
      email: cv.email || "", phone: cv.phone || "", title: cv.title || "",
      skills: cv.skills || "", experience: cv.experience || "",
      cvUrl: cv.cvUrl || "", summary: cv.summary || "", avatar: cv.avatar || "",
    });
    setPreviewCv(cv);
    setMessage(`Đã nạp CV "${cv.name}" vào biểu mẫu để chỉnh sửa.`);
  };

  const handleDelete = (cvId) => {
    const updated = deleteCV(cvId, user);
    setSavedCvs(updated);
    if (previewCv?.id === cvId) setPreviewCv(null);
    if (form.id === cvId) setForm({ ...EMPTY_FORM });
    setMessage("Đã xóa CV khỏi danh sách.");
  };

  const phoneError =
    form.phone && (form.phone.length < 10 || validatePhone(form.phone) === false)
      ? "Chỉ chấp nhận số điện thoại Việt Nam 10-11 số."
      : "";
  const emailError =
    form.email && validateEmail(form.email) === false
      ? "Email không đúng định dạng."
      : "";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Form CV */}
        <div className="panel-surface rounded-[34px] p-6 space-y-5 lg:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Profile</p>
            <h1 className="mt-3 text-4xl text-slate-900">Hồ Sơ / CV</h1>
          </div>

          {message && (
            <div className="rounded-[3xl] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            {/* Avatar */}
            <div className="rounded-[28px] bg-linear-to-br from-sky-50 via-white to-cyan-50 p-5 text-center shadow-sm">
              <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-sky-500 to-cyan-500">
                {form.avatar ? (
                  <img src={form.avatar} alt={form.fullName || "CV avatar"} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-semibold text-white">{(form.fullName || "U").charAt(0)}</span>
                )}
              </div>
              <label className="mt-4 inline-flex cursor-pointer rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Tải ảnh
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            {/* Fields */}
            <div className="grid gap-4">
              {[
                { label: "Tên CV", field: "name", placeholder: "CV Frontend Developer" },
                { label: "Họ và tên", field: "fullName", placeholder: "Nguyễn Văn A" },
                { label: "Vị trí mong muốn", field: "title", placeholder: "Frontend Developer" },
                { label: "Link CV / Portfolio", field: "cvUrl", placeholder: "https://..." },
              ].map(({ label, field, placeholder }) => (
                <label key={field} className="field-shell block rounded-2xl px-4 py-3">
                  <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</span>
                  <input
                    className="mt-2 w-full bg-transparent outline-none"
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={handleChange(field)}
                  />
                </label>
              ))}

              <label className="field-shell block rounded-2xl px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Email</span>
                <input
                  className="mt-2 w-full bg-transparent outline-none"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange("email")}
                />
                {emailError && <span className="mt-1 block text-xs text-rose-600">{emailError}</span>}
              </label>

              <label className="field-shell block rounded-2xl px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Số điện thoại</span>
                <input
                  className="mt-2 w-full bg-transparent outline-none"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  inputMode="numeric"
                  minLength={10}
                  maxLength={11}
                />
                {phoneError && <span className="mt-1 block text-xs text-rose-600">{phoneError}</span>}
              </label>

              {[
                { label: "Kỹ năng", field: "skills", placeholder: "React, JavaScript, SQL...", rows: "h-24" },
                { label: "Kinh nghiệm", field: "experience", placeholder: "Mô tả kinh nghiệm làm việc, dự án đã làm...", rows: "h-28" },
                { label: "Tóm tắt năng lực", field: "summary", placeholder: "Kỹ năng, kinh nghiệm, mô tả bản thân...", rows: "h-36" },
              ].map(({ label, field, placeholder, rows }) => (
                <label key={field} className="field-shell block rounded-2xl px-4 py-3">
                  <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</span>
                  <textarea
                    className={`mt-2 ${rows} w-full resize-none bg-transparent outline-none`}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={handleChange(field)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleCreateNew} className="primary-button px-6 py-3 rounded-2xl font-semibold transition">
              Tạo CV Mới
            </button>
            <button type="button" onClick={handleSave} className="px-6 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition">
              {form.id ? "Cập Nhật CV" : "Lưu CV"}
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách CV đã lưu */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel-surface rounded-[34px] p-6 lg:p-8">
          <h2 className="text-3xl text-slate-900">CV đã tạo</h2>
          <p className="mt-2 text-sm text-slate-500">Nơi lưu các CV đã tạo để dùng lại cho nhiều công việc khác nhau.</p>

          <div className="mt-5 space-y-3">
            {savedCvs.length === 0 ? (
              <div className="rounded-2xl bg-white/70 px-4 py-4 text-sm text-slate-500">Chưa có CV nào được lưu.</div>
            ) : (
              savedCvs.map((cv) => (
                <div key={cv.id} className="rounded-2xl border border-slate-200 bg-white/75 px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{cv.name}</p>
                      <p className="text-sm text-slate-500">{cv.fullName}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => { setPreviewCv(cv); setMessage(`Đang xem CV "${cv.name}".`); }} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Xem nội dung
                    </button>
                    <button type="button" onClick={() => handleEdit(cv)} className="rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100">
                      Chỉnh sửa
                    </button>
                    <button type="button" onClick={() => handleDelete(cv.id)} className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Preview CV */}
      {previewCv && (
        <section ref={previewRef} className="panel-surface rounded-[34px] p-6 lg:p-8">
          <h2 className="text-3xl text-slate-900">Nội dung CV đang xem</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-[180px_1fr]">
            <div className="rounded-[28px] bg-white/75 p-5 text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                {previewCv.avatar ? (
                  <img src={previewCv.avatar} alt={previewCv.fullName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-semibold text-slate-600">{(previewCv.fullName || "U").charAt(0)}</span>
                )}
              </div>
            </div>
            <div className="grid gap-4">
              {[
                { label: "Tên CV", value: previewCv.name },
                { label: "Họ và tên", value: previewCv.fullName },
                { label: "Email", value: previewCv.email },
                { label: "Số điện thoại", value: previewCv.phone },
                { label: "Vị trí mong muốn", value: previewCv.title },
                { label: "Kỹ năng", value: previewCv.skills },
                { label: "Kinh nghiệm", value: previewCv.experience },
                { label: "Link CV / Portfolio", value: previewCv.cvUrl, breakAll: true },
                { label: "Nội dung CV", value: previewCv.summary },
              ].map(({ label, value, breakAll }) => (
                <div key={label} className="rounded-2xl bg-white/75 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
                  <p className={`mt-2 whitespace-pre-wrap leading-7 text-slate-700 ${breakAll ? "break-all font-semibold" : ""}`}>
                    {value || "Chưa cập nhật"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
