import { useState, useContext } from "react";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import jobService from "../../services/jobService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function PostJobPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
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
    "Hà Giang",
    "Cao Bằng",
    "Bắc Kạn",
    "Tuyên Quang",
    "Lào Cai",
    "Điện Biên",
    "Lai Châu",
    "Sơn La",
    "Yên Bái",
    "Hòa Bình",
    "Thái Nguyên",
    "Lạng Sơn",
    "Quảng Ninh",
    "Bắc Giang",
    "Phú Thọ",
    "Vĩnh Phúc",
    "Bắc Ninh",
    "Hải Dương",
    "Hải Phòng",
    "Hưng Yên",
    "Thái Bình",
    "Hà Nam",
    "Nam Định",
    "Ninh Bình",
    "Thanh Hóa",
    "Nghệ An",
    "Hà Tĩnh",
    "Quảng Bình",
    "Quảng Trị",
    "Thừa Thiên Huế",
    "Đà Nẵng",
    "Quảng Nam",
    "Quảng Ngãi",
    "Bình Định",
    "Phú Yên",
    "Khánh Hòa",
    "Ninh Thuận",
    "Bình Thuận",
    "Kon Tum",
    "Gia Lai",
    "Đắk Lắk",
    "Đắk Nông",
    "Lâm Đồng",
    "Bình Phước",
    "Tây Ninh",
    "Bình Dương",
    "Đồng Nai",
    "Bà Rịa - Vũng Tàu",
    "Thành phố Hồ Chí Minh",
    "Long An",
    "Tiền Giang",
    "Bến Tre",
    "Trà Vinh",
    "Vĩnh Long",
    "Đồng Tháp",
    "An Giang",
    "Kiên Giang",
    "Cần Thơ",
    "Hậu Giang",
    "Sóc Trăng",
    "Bạc Liêu",
    "Cà Mau",
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

  // Form state
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
      if (!formData[field].trim()) {
        setMessage({
          type: "error",
          text: `Vui lòng điền đầy đủ: ${getFieldLabel(field)}`,
        });
        return false;
      }
    }

    if (
      !Number.isInteger(formData.maxApplicants) ||
      formData.maxApplicants < 1
    ) {
      setMessage({
        type: "error",
        text: "Số lượng tối đa ứng viên phải là số nguyên lớn hơn 0.",
      });
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

    if (!user || !user.id) {
      setMessage({
        type: "error",
        text: "Lỗi: Không tìm thấy thông tin nhà tuyển dụng. Vui lòng đăng nhập lại.",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Combine hard skills, soft skills, experience, education, and benefits into requirements
      const requirements = [
        formData.hardSkills && `Kỹ năng kỹ thuật:\n${formData.hardSkills}`,
        formData.softSkills && `Kỹ năng mềm:\n${formData.softSkills}`,
        formData.experience && `Kinh nghiệm: ${formData.experience}`,
        formData.education && `Học vấn: ${formData.education}`,
        formData.benefits && `Lợi ích & Phúc lợi:\n${formData.benefits}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const jobPayload = {
        title: formData.title,
        location: formData.location,
        salary_range: formData.salary_range,
        description: formData.description,
        requirements: requirements,
        employer: user.id,
        maxApplicants: formData.maxApplicants,
      };

      const result = await jobService.createJob(jobPayload);

      setMessage({
        type: "success",
        text: "Đăng tin thành công! Chuyển hướng...",
      });

      // Reset form
      setFormData({
        title: "",
        location: "",
        salary_range: "",
        description: "",
        hardSkills: "",
        softSkills: "",
        experience: "",
        education: "",
        benefits: "",
      });

      // Redirect sau 2 giây
      setTimeout(() => {
        navigate("/employer/manage-jobs");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.detail || "Lỗi khi đăng tin. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="panel-surface max-w-4xl rounded-[34px] p-6 lg:p-8">
      <h1 className="mt-3 text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
        Đăng Tin Tuyển Dụng
      </h1>

      {/* Message Alert */}
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
              list="title-suggestions"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-3 w-full bg-transparent text-slate-900 font-medium outline-none"
              placeholder="Ví dụ: Backend Developer, Frontend Developer,..."
            />
            <datalist id="title-suggestions">
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
                list="location-suggestions"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-3 w-full bg-transparent text-slate-900 font-medium outline-none"
                placeholder="Ví dụ: Hà Nội, TP.HCM, Đà Nẵng,..."
              />
              <datalist id="location-suggestions">
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
                list="salary-suggestions"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                className="mt-3 w-full bg-transparent text-slate-900 font-medium outline-none"
                placeholder="ví dụ: 10-15 triệu VND"
              />
              <datalist id="salary-suggestions">
                {salaryOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>
          </div>

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

          <label className="field-shell block rounded-2xl px-4 py-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Mô tả công việc chi tiết *
            </span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-3 h-28 w-full resize-none bg-transparent text-slate-900 font-medium outline-none"
              placeholder="Mô tả rõ ràng về công việc, trách nhiệm chính, và môi trường làm việc để AI có đủ dữ liệu cho matching..."
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
              list="experience-suggestions"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="mt-3 w-full bg-transparent text-slate-900 font-medium outline-none"
              placeholder="ví dụ: 3+ năm, 2-3 năm"
            />
            <datalist id="experience-suggestions">
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
              list="education-suggestions"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="mt-3 w-full bg-transparent text-slate-900 font-medium outline-none"
              placeholder="ví dụ: Tốt nghiệp Đại học chuyên ngành Công nghệ Thông tin"
            />
            <datalist id="education-suggestions">
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
              {isLoading ? "Đang xử lý..." : "Đăng Tin"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/employer/manage-jobs")}
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
