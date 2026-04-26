import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import jobService from "../../services/jobService";

export default function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const titleOptions = [
    "Backend Developer",
    "Frontend Developer",
    "Fullstack Developer",
    "QA Engineer",
    "Product Manager",
  ];

  const locationOptions = [
    "Hà Nội",
    "TP.HCM",
    "Đà Nẵng",
    "Remote",
    "Hybrid",
  ];

  const salaryOptions = [
    "10-15 triệu VND",
    "15-20 triệu VND",
    "20-30 triệu VND",
    "30-40 triệu VND",
    "Thỏa thuận",
  ];

  const experienceOptions = [
    "Chưa có kinh nghiệm",
    "1-2 năm",
    "2-4 năm",
    "4-6 năm",
    "> 6 năm",
  ];

  const educationOptions = [
    "Cao đẳng",
    "Đại học",
    "Thạc sĩ",
    "Tiến sĩ",
    "Không yêu cầu",
  ];

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    salary_range: "",
    description: "",
    hardSkills: "",
    softSkills: "",
    experience: "",
    education: "",
    benefits: "",
    maxApplicants: 10,
  });

  const parseRequirements = (requirements = "") => {
    const getSection = (label, nextLabels = []) => {
      const escapedNextLabels = nextLabels
        .map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
      const endPattern = escapedNextLabels
        ? `(?=\\n\\n(?:${escapedNextLabels})|$)`
        : "$";
      const match = requirements.match(
        new RegExp(`${label}:\\s*\\n?([\\s\\S]*?)${endPattern}`, "i"),
      );
      return match?.[1]?.trim() || "";
    };

    return {
      hardSkills: getSection("Kỹ năng kỹ thuật", [
        "Kỹ năng mềm",
        "Kinh nghiệm",
        "Học vấn",
        "Lợi ích & Phúc lợi",
      ]),
      softSkills: getSection("Kỹ năng mềm", [
        "Kinh nghiệm",
        "Học vấn",
        "Lợi ích & Phúc lợi",
      ]),
      experience: getSection("Kinh nghiệm", [
        "Học vấn",
        "Lợi ích & Phúc lợi",
      ]),
      education: getSection("Học vấn", ["Lợi ích & Phúc lợi"]),
      benefits: getSection("Lợi ích & Phúc lợi"),
    };
  };

  const buildRequirements = () =>
    [
      formData.hardSkills && `Kỹ năng kỹ thuật:\n${formData.hardSkills}`,
      formData.softSkills && `Kỹ năng mềm:\n${formData.softSkills}`,
      formData.experience && `Kinh nghiệm: ${formData.experience}`,
      formData.education && `Học vấn: ${formData.education}`,
      formData.benefits && `Lợi ích & Phúc lợi:\n${formData.benefits}`,
    ]
      .filter(Boolean)
      .join("\n\n");

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await jobService.getJobById(id);
        if (!data) {
          setMessage({ type: "error", text: "Không tìm thấy công việc." });
          return;
        }
        const parsedRequirements = parseRequirements(data.requirements || "");
        setFormData({
          title: data.title || "",
          location: data.location || "",
          salary_range: data.salary_range || "",
          description: data.description || "",
          hardSkills: parsedRequirements.hardSkills || data.requirements || "",
          softSkills: parsedRequirements.softSkills,
          experience: parsedRequirements.experience,
          education: parsedRequirements.education,
          benefits: parsedRequirements.benefits,
          maxApplicants: data.maxApplicants || 10,
        });
      } catch (error) {
        console.error("Error loading job:", error);
        setMessage({ type: "error", text: "Không thể tải thông tin công việc." });
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxApplicants" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "title",
      "location",
      "salary_range",
      "description",
      "hardSkills",
      "experience",
    ];
    for (const field of requiredFields) {
      if (!String(formData[field]).trim()) {
        setMessage({ type: "error", text: `Vui lòng điền đầy đủ: ${getFieldLabel(field)}` });
        return false;
      }
    }
    if (!Number.isInteger(formData.maxApplicants) || formData.maxApplicants < 1) {
      setMessage({ type: "error", text: "Số lượng tối đa ứng viên phải là số nguyên lớn hơn 0." });
      return false;
    }
    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      title: "Tên vị trí",
      location: "Địa điểm",
      salary_range: "Mức lương",
      description: "Mô tả công việc",
      hardSkills: "Kỹ năng kỹ thuật",
      experience: "Kinh nghiệm",
    };
    return labels[field] || field;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await jobService.updateJob(id, {
        title: formData.title,
        location: formData.location,
        salary_range: formData.salary_range,
        description: formData.description,
        requirements: buildRequirements(),
        maxApplicants: formData.maxApplicants,
      });

      setMessage({ type: "success", text: "Cập nhật công việc thành công." });
      setTimeout(() => navigate(`/employer/jobs/${id}`), 1500);
    } catch (error) {
      console.error("Update job error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "Lỗi khi cập nhật công việc. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="panel-surface max-w-4xl rounded-[34px] p-8">
        <div className="text-center text-slate-500">Đang tải thông tin công việc...</div>
      </div>
    );
  }

  return (
    <div className="panel-surface max-w-4xl rounded-[34px] p-6 lg:p-8">
      <h1 className="mt-3 text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
        Chỉnh sửa công việc
      </h1>

      {message.text && (
        <div
          className={`mt-6 flex items-center gap-3 rounded-2xl px-4 py-3 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mt-8 grid grid-cols-1 gap-5">
          <label className="field-shell block rounded-2xl px-4 py-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Tên vị trí *
            </span>
            <input
              type="text"
              list="edit-title-suggestions"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-3 w-full bg-transparent text-slate-900 font-medium outline-none"
              placeholder="ví dụ: Backend Developer, Frontend Developer"
            />
            <datalist id="edit-title-suggestions">
              {titleOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="field-shell block rounded-2xl px-4 py-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Địa điểm *
              </span>
              <input
                type="text"
                list="edit-location-suggestions"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-3 w-full bg-transparent text-slate-900 font-medium outline-none"
                placeholder="ví dụ: Hà Nội, TP.HCM, Remote"
              />
              <datalist id="edit-location-suggestions">
                {locationOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>
            <label className="field-shell block rounded-2xl px-4 py-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Mức lương *
              </span>
              <input
                type="text"
                list="edit-salary-suggestions"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                className="mt-3 w-full bg-transparent text-slate-900 font-medium outline-none"
                placeholder="ví dụ: 20-35 triệu VND"
              />
              <datalist id="edit-salary-suggestions">
                {salaryOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="field-shell block rounded-2xl px-4 py-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Số lượng tối đa ứng viên
              </span>
              <input
                type="number"
                min="1"
                name="maxApplicants"
                value={formData.maxApplicants}
                onChange={handleChange}
                className="mt-3 w-full bg-transparent text-slate-900 font-medium outline-none"
              />
            </label>
          </div>

          <label className="field-shell block rounded-2xl px-4 py-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Mô tả công việc chi tiết *
            </span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-3 h-24 w-full resize-none bg-transparent text-slate-900 font-medium outline-none"
              placeholder="Mô tả chi tiết nhiệm vụ, trách nhiệm và yêu cầu công việc."
            />
          </label>

          <label className="field-shell block rounded-2xl px-4 py-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Kỹ năng bắt buộc (Hard Skills) *
            </span>
            <textarea
              name="hardSkills"
              value={formData.hardSkills}
              onChange={handleChange}
              className="mt-3 h-24 w-full resize-none bg-transparent text-slate-900 font-medium outline-none"
              placeholder="Liệt kê kỹ năng kỹ thuật cần thiết, mỗi kỹ năng trên một dòng&#10;ví dụ:&#10;React.js&#10;JavaScript ES6+&#10;REST API"
            />
          </label>

          <label className="field-shell block rounded-2xl px-4 py-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Kỹ năng mềm (Soft Skills)
            </span>
            <textarea
              name="softSkills"
              value={formData.softSkills}
              onChange={handleChange}
              className="mt-3 h-20 w-full resize-none bg-transparent text-slate-900 font-medium outline-none"
              placeholder="Kỹ năng mềm mong muốn, mỗi kỹ năng trên một dòng&#10;ví dụ:&#10;Làm việc nhóm&#10;Giao tiếp tốt"
            />
          </label>

          <label className="field-shell block rounded-2xl px-4 py-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Kinh nghiệm yêu cầu *
            </span>
            <input
              type="text"
              list="edit-experience-suggestions"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="mt-3 w-full bg-transparent text-slate-900 font-medium outline-none"
              placeholder="ví dụ: 3+ năm, 2-3 năm"
            />
            <datalist id="edit-experience-suggestions">
              {experienceOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>

          <label className="field-shell block rounded-2xl px-4 py-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Yêu cầu học vấn
            </span>
            <input
              type="text"
              list="edit-education-suggestions"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="mt-3 w-full bg-transparent text-slate-900 font-medium outline-none"
              placeholder="ví dụ: Tốt nghiệp Đại học chuyên ngành Công nghệ Thông tin"
            />
            <datalist id="edit-education-suggestions">
              {educationOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>

          <label className="field-shell block rounded-2xl px-4 py-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Lợi ích & Phúc lợi
            </span>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              className="mt-3 h-24 w-full resize-none bg-transparent text-slate-900 font-medium outline-none"
              placeholder="Liệt kê các lợi ích, mỗi lợi ích trên một dòng&#10;ví dụ:&#10;Mức lương cạnh tranh&#10;BHXH, BHYT đầy đủ&#10;Môi trường làm việc pháp lý"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2 pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-2xl bg-slate-700 text-white font-bold hover:bg-slate-800 hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader size={18} className="animate-spin" />}
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/employer/jobs/${id}`)}
              className="px-6 py-3 rounded-2xl border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
            >
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
