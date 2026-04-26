import { useContext, useEffect, useState } from "react";
import StatsCard from "../../components/common/StatsCard";
import { hasSavedCV } from "../../utils/cvStorage";
import { AuthContext } from "../../context/AuthContext";
import jobService from "../../services/jobService";

export default function SeekerDashboardPage() {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id || user.role !== "seeker") {
        setApplications([]);
        return;
      }

      try {
        const data = await jobService.getApplicationsBySeeker(user.id);
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Load dashboard applications error:", error);
        setApplications([]);
      }
    };

    fetchApplications();
  }, [user?.id, user?.role]);


  return (
    <div className="space-y-6">
      <section className="panel-surface rounded-[34px] px-6 py-7 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Overview
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-slate-900 lg:text-5xl">
              Khu vực người tìm việc
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Theo dõi hồ sơ, xem việc đang tuyển và cập nhật trạng thái ứng tuyển.
            </p>
          </div>
          <div className="rounded-[3xl] bg-white/80 px-5 py-4 text-sm leading-6 text-slate-600">
            Hoàn thiện CV trước khi ứng tuyển.
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatsCard
          title="Đã Ứng Tuyển"
          value={String(applications.length)}
          subtitle="Tổng số đơn ứng tuyển hiện có của bạn trong hệ thống."
        />
        <StatsCard
          title="CV Đã Lưu"
          value={hasSavedCV(user) ? "1" : "0"}
          subtitle="Hoàn thiện hồ sơ trước khi ứng tuyển."
        />
      </div>
    </div>
  );
}
