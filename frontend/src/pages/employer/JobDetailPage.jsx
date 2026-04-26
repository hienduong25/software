import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2, Users, Calendar } from "lucide-react";
import jobService from "../../services/jobService";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobService.getJobById(id);
        setJob(data);
      } catch (err) {
        console.error("Error loading job:", err);
        setError("Không thể tải thông tin công việc");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa bài đăng này?")) {
      return;
    }

    try {
      await jobService.deleteJob(id);
      alert("Đã xóa bài đăng thành công");
      navigate("/employer/manage-jobs");
    } catch (err) {
      alert("Lỗi khi xóa bài đăng: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl rounded-[34px] bg-white p-8">
        <div className="text-center text-slate-500">Đang tải...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl rounded-[34px] bg-white p-8">
        <button
          onClick={() => navigate("/employer/manage-jobs")}
          className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <div className="text-center text-rose-600">
          {error || "Không tìm thấy công việc"}
        </div>
      </div>
    );
  }

  const requirementsArray = job.requirements
    ? job.requirements.split("\n\n").filter((item) => item.trim())
    : [];

  const status =
    job.status === "Active"
      ? "Active"
      : job.currentApplicants >= (job.maxApplicants || 0)
        ? "Closed"
        : "Active";

  return (
    <div className="max-w-4xl rounded-[34px] bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/employer/manage-jobs")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/employer/manage-jobs/${id}/edit`)}
            className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-blue-600 hover:bg-blue-100 transition"
          >
            <Edit2 size={18} />
            Chỉnh sửa
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-rose-600 hover:bg-rose-100 transition"
          >
            <Trash2 size={18} />
            Xóa
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-bold text-slate-900">{job.title}</h1>
        <p className="mt-2 text-slate-500">
          {job.companyName || "Công ty tuyển dụng"}
        </p>

        <div className="mt-4 flex gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={18} />
            <span>
              Đăng ngày {new Date(job.created_at).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Users size={18} />
            <span>{job.currentApplicants || 0} Ứng viên</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Location & Salary */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Địa điểm
            </h3>
            <p className="mt-2 text-lg font-medium text-slate-900">
              {job.location || "Không xác định"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Mức lương
            </h3>
            <p className="mt-2 text-lg font-medium text-slate-900">
              {job.salary_range || "Thỏa thuận"}
            </p>
          </div>
        </div>

        {/* Job Description */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Mô tả công việc
          </h3>
          <div className="mt-3 text-slate-700 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </div>
        </div>

        {/* Requirements */}
        {requirementsArray.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Yêu cầu
            </h3>
            <div className="mt-3 space-y-4">
              {requirementsArray.map((req, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-50 p-4 border border-slate-200"
                >
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {req}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3 border-t border-slate-200 pt-8">
          <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
            <p className="text-sm text-blue-600 font-bold">Tổng ứng viên</p>
            <p className="mt-2 text-3xl font-bold text-blue-900">
              {job.currentApplicants || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <p className="text-sm text-slate-600 font-bold">Tối đa ứng viên</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {job.maxApplicants || 10}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <p className="text-sm text-slate-600 font-bold">Trạng thái</p>
            <div className="mt-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${
                  status === "Active"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {status === "Active" ? "Đang hiển thị" : "Đã đóng"}
              </span>
            </div>
          </div>
        </div>

        {/* Applicants Button */}
        <button
          type="button"
          onClick={() => navigate("/employer/applicants")}
          className="mt-6 w-full rounded-2xl bg-slate-900 py-3 font-bold text-white transition hover:bg-slate-800"
        >
          Xem danh sách ứng viên ({job.currentApplicants || 0})
        </button>
      </div>
    </div>
  );
}
