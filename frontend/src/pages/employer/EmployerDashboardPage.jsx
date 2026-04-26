import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import StatsCard from "../../components/common/StatsCard";
import jobService from "../../services/jobService";
import { AuthContext } from "../../context/AuthContext";

export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const [jobsData, applicantData] = await Promise.all([
          jobService.getAllJobs(),
          jobService.getCandidates(user.id),
        ]);
        setJobs(
          (jobsData || []).filter(
            (job) => Number(job.employerId || job.employer) === Number(user.id),
          ),
        );
        setApplicants(applicantData || []);
      } catch (error) {
        console.error("Load dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const latestApplicants = [...applicants]
    .sort((left, right) => {
      const rightTime = new Date(right.applied_at || right.appliedAt || 0).getTime();
      const leftTime = new Date(left.applied_at || left.appliedAt || 0).getTime();
      return rightTime - leftTime;
    })
    .slice(0, 3);

  const latestApplicant = latestApplicants[0] || null;

  return (
    <div className="space-y-6">
      <section className="panel-surface rounded-[34px] px-6 py-7 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Overview
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-slate-900 lg:text-5xl">
              Khu vực nhà tuyển dụng
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Quản lý tin tuyển dụng, theo dõi ứng viên và xem kết quả hồ sơ.
            </p>
          </div>
          <div className="rounded-[3xl] bg-white/80 px-5 py-4 text-sm leading-6 text-slate-600">
            {latestApplicants.length > 0
              ? `Đang có ${latestApplicants.length} hồ sơ gần đây để xem nhanh.`
              : "Chưa có hồ sơ ứng tuyển để xem nhanh."}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsCard
          title="Tin Tuyển Dụng"
          value={String(jobs.length)}
          subtitle="Vị trí đang mở trên hệ thống."
        />
        <StatsCard
          title="Ứng Viên"
          value={String(applicants.length)}
          subtitle="Tổng số ứng viên đang có trong danh sách."
        />
        <StatsCard
          title="Hồ Sơ Mới Nhất"
          value={latestApplicant ? latestApplicant.full_name : "-"}
          subtitle={
            latestApplicant
              ? "Ứng viên mới gửi hồ sơ gần đây nhất."
              : "Chưa có hồ sơ ứng tuyển."
          }
        />
      </div>

      <section className="panel-surface rounded-[34px] p-6 lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Quick Review
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Hồ sơ mới nhất
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Xem nhanh các ứng viên vừa ứng tuyển gần đây.
            </p>
          </div>
          <Link
            to="/employer/applicants"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-600"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {latestApplicants.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 lg:col-span-3">
              Chưa có hồ sơ nào để hiển thị nhanh.
            </div>
          ) : (
            latestApplicants.map((candidate) => (
              <div
                key={candidate.applicationId}
                className="rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-200">
                    {candidate.avatar ? (
                      <img
                        src={candidate.avatar}
                        alt={candidate.full_name || "Ứng viên"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-slate-600">
                        {candidate.full_name ? candidate.full_name.charAt(0) : "U"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xl font-bold text-slate-900">
                      {candidate.full_name || "Ứng viên"}
                    </h3>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {candidate.title || "Chưa cập nhật vị trí mong muốn"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    {candidate.jobTitle || "Ứng tuyển"}
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Mới nộp
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {candidate.experience ||
                    candidate.skills ||
                    "Chưa có mô tả hồ sơ."}
                </p>

                <div className="mt-5">
                  <Link
                    to={`/employer/candidate/${candidate.applicationId}`}
                    className="inline-flex rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 hover:shadow-md"
                  >
                    Xem nhanh hồ sơ
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
