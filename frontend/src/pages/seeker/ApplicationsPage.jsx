import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import jobService from "../../services/jobService";

const STATUS_CONFIG = {
  Pending: {
    label: "Đang chờ duyệt",
    className: "bg-amber-50 text-amber-700",
    description: "Nhà tuyển dụng đã nhận hồ sơ và đang xem xét.",
  },
  Accepted: {
    label: "Đã được chấp nhận",
    className: "bg-emerald-50 text-emerald-700",
    description: "Chúc mừng! Hồ sơ của bạn đã được nhà tuyển dụng chấp nhận.",
  },
  Rejected: {
    label: "Đã bị từ chối",
    className: "bg-rose-50 text-rose-700",
    description: "Nhà tuyển dụng đã từ chối hồ sơ này.",
  },
};

function getStatusMeta(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Chưa rõ",
      className: "bg-slate-100 text-slate-700",
      description: "Trạng thái hồ sơ sẽ được cập nhật khi có phản hồi mới.",
    }
  );
}

function formatAppliedDate(value) {
  if (!value) return "Chưa có thời gian cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có thời gian cập nhật";

  return date.toLocaleString("vi-VN");
}

export default function ApplicationsPage() {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingWithdrawId, setPendingWithdrawId] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id || user.role !== "seeker") {
        setApplications([]);
        setLoading(false);
        return;
      }

      try {
        const data = await jobService.getApplicationsBySeeker(user.id);
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Load applications error:", error);
        setFeedback("Không thể tải danh sách đơn ứng tuyển. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user?.id, user?.role]);

  const sortedApplications = useMemo(
    () =>
      [...applications].sort(
        (a, b) =>
          new Date(b.appliedAt || 0).getTime() -
          new Date(a.appliedAt || 0).getTime(),
      ),
    [applications],
  );

  const handleWithdraw = async (jobId) => {
    if (!user?.id) return;

    try {
      await jobService.withdrawApplication(jobId, {
        jobSeekerId: user.id,
      });

      setApplications((currentApplications) =>
        currentApplications.filter(
          (application) => String(application.jobId) !== String(jobId),
        ),
      );
      setFeedback(
        "Đã rút hồ sơ thành công. Bạn có thể ứng tuyển lại vị trí này.",
      );
    } catch (error) {
      console.error("Withdraw application error:", error);
      setFeedback(
        error.response?.data?.detail || "Rút hồ sơ thất bại. Vui lòng thử lại.",
      );
    } finally {
      setPendingWithdrawId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="panel-surface rounded-[34px] px-6 py-7">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
          Applications
        </p>
        <h1 className="mt-3 text-4xl text-slate-900">Đơn Ứng Tuyển</h1>
        <p className="mt-3 text-sm text-slate-500">
          Theo dõi trạng thái mới nhất của từng hồ sơ bạn đã gửi.
        </p>
      </div>

      {feedback ? (
        <div className="card-surface rounded-[28px] border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          {feedback}
        </div>
      ) : null}

      {loading ? (
        <div className="card-surface rounded-[28px] p-6 text-slate-600">
          Đang tải danh sách đơn ứng tuyển...
        </div>
      ) : sortedApplications.length === 0 ? (
        <div className="card-surface rounded-[28px] p-6 text-slate-600">
          Bạn chưa có đơn ứng tuyển nào. Hãy chọn công việc trong Job Board để
          bắt đầu.
        </div>
      ) : (
        sortedApplications.map((item) => {
          const statusMeta = getStatusMeta(item.status);

          return (
            <div key={item.jobId} className="card-surface rounded-[28px] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-2xl text-slate-900">{item.jobTitle}</h3>
                  <p className="text-slate-500">{item.company}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {item.location} • {item.salary}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    CV nộp: {item.cvName || "CV đã nộp"} • Hình thức:{" "}
                    {item.cvMethod || "CV đã nộp"}
                  </p>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Trạng thái mới nhất
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {statusMeta.description}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Cập nhật hồ sơ: {formatAppliedDate(item.appliedAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusMeta.className}`}
                  >
                    {statusMeta.label}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    Match: {item.score ?? item.match_score ?? 0}%
                  </p>
                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <Link
                      to={`/seeker/jobs/${item.jobId}`}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Xem Chi Tiết
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingWithdrawId(item.jobId)}
                      className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Rút Hồ Sơ
                    </button>
                  </div>
                </div>
              </div>

              {pendingWithdrawId === item.jobId ? (
                <div className="mt-5 rounded-[3xl] border border-rose-200 bg-rose-50 px-4 py-4">
                  <p className="text-sm font-semibold text-rose-800">
                    Bạn đã chắc khi rút hồ sơ chưa?
                  </p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleWithdraw(item.jobId)}
                      className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 hover:shadow-md"
                    >
                      Xác Nhận Rút
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingWithdrawId(null)}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}
