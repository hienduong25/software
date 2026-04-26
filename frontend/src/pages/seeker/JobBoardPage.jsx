import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import jobService from "../../services/jobService";
import { getSavedCVs } from "../../utils/cvStorage";
import SearchBar from "../../components/common/SearchBar";
import JobFilters from "../../components/seeker/JobFilters";
import ApplyPanel from "../../components/seeker/ApplyPanel";
import { useApplyJob } from "../../hooks/useApplyJob";
import { useJobFilters } from "../../hooks/useJobFilters";

export default function JobBoardPage() {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const savedCvs = getSavedCVs(user);

  // Hooks
  const filters = useJobFilters(jobs, appliedJobs);
  const apply = useApplyJob({
    user,
    savedCvs,
    onSuccess: (job) => {
      setAppliedJobs((prev) => {
        const id = String(job.jobId);
        return prev.includes(id) ? prev : [id, ...prev];
      });
      apply.setFeedback(
        `Đã ứng tuyển vào vị trí ${job.title} tại ${job.companyName || job.company || "công ty"}.`,
      );
    },
  });

  // Fetch jobs
  useEffect(() => {
    jobService
      .getAllJobs()
      .then((data) => setJobs(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch applied jobs
  useEffect(() => {
    if (!user?.id || user.role !== "seeker") return;
    jobService
      .getApplicationsBySeeker(user.id)
      .then((data) =>
        setAppliedJobs(
          Array.isArray(data) ? data.map((item) => String(item.jobId)) : [],
        ),
      )
      .catch(console.error);
  }, [user?.id, user?.role]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="panel-surface space-y-3 rounded-3xl px-6 py-7 lg:px-8 hover:shadow-lg transition">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Job Board</p>
        <h1 className="text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent lg:text-5xl">
          Danh sách công việc
        </h1>
      </div>

      <SearchBar
        placeholder="Tìm kiếm công việc, công ty, kỹ năng..."
        onSearch={filters.setSearchTerm}
      />

      <JobFilters
        {...filters}
        filteredCount={filters.filteredJobs.length}
        onReset={filters.resetFilters}
      />

      {apply.feedback && (
        <div className="rounded-2xl border-2 border-blue-200 bg-linear-to-br from-blue-50 to-cyan-50 px-4 py-4 text-sm font-medium text-blue-700 shadow-md">
          ✓ {apply.feedback}
        </div>
      )}

      {/* Job List */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {loading ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
            Đang tải danh sách công việc...
          </div>
        ) : filters.filteredJobs.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-slate-700">Không tìm thấy công việc phù hợp</p>
            <p className="mt-2 text-slate-500">
              {jobs.length > 0
                ? "Hãy thử đổi từ khóa, địa điểm hoặc đặt lại bộ lọc."
                : "Hiện không có công việc nào được đăng tuyển."}
            </p>
          </div>
        ) : (
          filters.filteredJobs.map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              hasApplied={appliedJobs.includes(String(job.jobId))}
              applyState={apply}
              savedCvs={savedCvs}
            />
          ))
        )}
      </div>
    </div>
  );
}

function JobCard({ job, hasApplied, applyState, savedCvs }) {
  const isFull = job.currentApplicants >= (job.maxApplicants || 0);
  const isOpenPanel = applyState.applyTarget === String(job.jobId) && !hasApplied;

  return (
    <div className="card-surface rounded-3xl p-6 transition group hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 transition group-hover:text-blue-600">
            {job.title}
          </h3>
          <p className="mt-1 font-medium text-slate-600">
            {job.companyName || job.company || "Công ty tuyển dụng"}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="mt-6 grid gap-3 text-sm text-slate-600 lg:grid-cols-3">
        {[
          { label: "Địa điểm", value: job.location },
          { label: "Mức lương", value: job.salary_range || job.salary },
          { label: "Mô tả", value: job.description },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-2 font-semibold text-slate-700">{value || "Chưa cập nhật"}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isFull ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
          {isFull ? "Đã đủ ứng viên" : "Đang tuyển"}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {Math.max((job.maxApplicants || 0) - (job.currentApplicants || 0), 0)} slot còn lại
        </span>
        {hasApplied && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
            Đã ứng tuyển
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-600">
          {hasApplied ? "✓ Đơn ứng tuyển đã được lưu" : "Có thể xem chi tiết trước khi ứng tuyển"}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/seeker/jobs/${job.jobId}`}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Xem chi tiết
          </Link>
          <button
            type="button"
            onClick={() => applyState.openPanel(job)}
            disabled={hasApplied || isFull}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition duration-200 ${
              hasApplied || isFull
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "bg-slate-700 text-white hover:bg-slate-800 hover:shadow-md"
            }`}
          >
            {hasApplied ? "Đã Ứng Tuyển" : isFull ? "Đã đủ ứng viên" : "Ứng Tuyển"}
          </button>
        </div>
      </div>

      {/* Apply Panel */}
      {isOpenPanel && (
        <ApplyPanel
          savedCvs={savedCvs}
          selectedCvId={applyState.selectedCvId}
          onSelectCv={(id) => {
            applyState.setSelectedCvId(id);
          }}
          analysisResult={applyState.analysisResult}
          analysisLoading={applyState.analysisLoading}
          applyLoading={applyState.applyLoading}
          onAnalyze={() => applyState.handleAnalyze(job)}
          onApply={() => applyState.handleApply(job)}
          onCancel={applyState.closePanel}
        />
      )}
    </div>
  );
}
