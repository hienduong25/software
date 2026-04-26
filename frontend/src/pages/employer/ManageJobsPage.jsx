import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import jobService from "../../services/jobService";
import { AuthContext } from "../../context/AuthContext";

export default function ManageJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await jobService.getAllJobs();
        const filteredJobs = (data || []).filter(
          (job) => Number(job.employerId || job.employer) === Number(user.id),
        );
        setJobs(filteredJobs);
      } catch (error) {
        console.error("Load jobs error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleViewDetails = (jobId) => {
    navigate(`/employer/jobs/${jobId}`);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài đăng này?")) {
      return;
    }

    try {
      await jobService.deleteJob(jobId);
      setJobs(jobs.filter(job => job.jobId !== jobId));
      alert("Đã xóa bài đăng thành công");
    } catch (error) {
      alert("Lỗi khi xóa bài đăng: " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Quản Lý Tin Tuyển Dụng</h1>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
          Đang tải danh sách công việc...
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
          Chưa có công việc nào trong hệ thống.
        </div>
      ) : (
        jobs.map((job) => (
          <div
            key={job.jobId}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{job.title}</h3>
              <p className="text-sm text-slate-500">
                {job.companyName || "Công ty tuyển dụng"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {job.location} • {job.salary_range || "Thỏa thuận"}
              </p>
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleViewDetails(job.jobId)}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium transition"
              >
                Chi tiết
              </button>
              <button
                onClick={() => navigate(`/employer/manage-jobs/${job.jobId}/edit`)}
                className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium transition"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => handleDelete(job.jobId)}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium transition"
              >
                Xóa
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
