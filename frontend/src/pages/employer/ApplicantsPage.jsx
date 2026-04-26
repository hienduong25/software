import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import jobService from "../../services/jobService";
import { AuthContext } from "../../context/AuthContext";
import { updateApplicationStatus as syncSeekerApplicationStatus } from "../../utils/applicationStorage";
import { addNotification } from "../../utils/notificationStorage";

const STATUS_LABELS = {
  Pending: "Đang chờ",
  Accepted: "Đã chấp nhận",
  Rejected: "Đã từ chối",
};

const STATUS_STYLES = {
  Pending: "border border-amber-200 bg-amber-50 text-amber-700",
  Accepted: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border border-rose-200 bg-rose-50 text-rose-700",
};

const STATUS_CONFIRM_MESSAGES = {
  Accepted: "Bạn có chắc muốn chấp nhận hồ sơ ứng viên này không?",
  Rejected:
    "Bạn có chắc muốn từ chối hồ sơ ứng viên này không? Slot sẽ được trả lại cho ứng viên khác.",
};

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [updatingId, setUpdatingId] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!user?.id) {
        setApplicants([]);
        setLoading(false);
        return;
      }

      try {
        const data = await jobService.getCandidates(user.id);
        setApplicants(data || []);
      } catch (error) {
        console.error("Load applicants error:", error);
        setFeedback({
          type: "error",
          message: "Không thể tải danh sách ứng viên. Vui lòng thử lại.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [user]);

  const handleUpdateStatus = async (applicationId, status) => {
    if (!user?.id || !applicationId) {
      return;
    }

    if (STATUS_CONFIRM_MESSAGES[status]) {
      const isConfirmed = window.confirm(STATUS_CONFIRM_MESSAGES[status]);
      if (!isConfirmed) {
        return;
      }
    }

    setUpdatingId(applicationId);
    setFeedback({ type: "", message: "" });

    try {
      const response = await jobService.updateApplicationStatus(applicationId, {
        employerId: user.id,
        status,
      });
      const updatedApplication = response?.application || response;

      setApplicants((prevApplicants) =>
        prevApplicants.map((applicant) =>
          applicant.applicationId === applicationId
            ? {
                ...applicant,
                ...updatedApplication,
                status: updatedApplication?.status || status,
              }
            : applicant,
        ),
      );

      if (updatedApplication?.jobId && updatedApplication?.jobSeekerId) {
        syncSeekerApplicationStatus(
          updatedApplication.jobId,
          updatedApplication.status || status,
          {
            id: updatedApplication.jobSeekerId,
            role: "seeker",
          },
        );

        addNotification(
          {
            title: "Cập nhật hồ sơ ứng tuyển",
            message: `Hồ sơ cho vị trí ${updatedApplication.jobTitle || "ứng tuyển"} đã được cập nhật sang trạng thái "${STATUS_LABELS[updatedApplication.status || status] || updatedApplication.status || status}".`,
            type:
              updatedApplication.status === "Accepted"
                ? "success"
                : updatedApplication.status === "Rejected"
                  ? "error"
                  : "info",
          },
          {
            id: updatedApplication.jobSeekerId,
            role: "seeker",
          },
        );
      }

      setFeedback({
        type: "success",
        message:
          status === "Rejected"
            ? `Đã từ chối hồ sơ. Slot đã được trả lại để ứng viên khác có thể ứng tuyển.`
            : `Đã cập nhật trạng thái ứng tuyển thành "${STATUS_LABELS[status] || status}".`,
      });
    } catch (error) {
      console.error("Update application status error:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.detail ||
          "Cập nhật trạng thái thất bại. Vui lòng thử lại.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStatusBadge = (status) => {
    const normalizedStatus = status || "Pending";
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[normalizedStatus] || "border border-slate-200 bg-slate-100 text-slate-600"}`}
      >
        {STATUS_LABELS[normalizedStatus] || normalizedStatus}
      </span>
    );
  };


  return (
    <div className="space-y-4">
      <div className="panel-surface rounded-[34px] px-6 py-7">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
          Candidates
        </p>
        <h1 className="mt-3 text-4xl text-slate-900">Danh Sách Ứng Viên</h1>
      </div>

      {feedback.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
          Đang tải danh sách ứng viên...
        </div>
      ) : applicants.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
          Chưa có ứng viên nào trong hệ thống.
        </div>
      ) : (
        applicants.map((applicant) => {
          const currentStatus = applicant.status || "Pending";
          const isUpdating = updatingId === applicant.applicationId;

          return (
            <div
              key={
                applicant.applicationId ||
                `${applicant.jobSeekerId}-${applicant.jobId || "job"}`
              }
              className="card-surface flex flex-col justify-between gap-5 rounded-[28px] p-5"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-200">
                    <span className="text-xl font-semibold text-slate-600">
                      {applicant.full_name
                        ? applicant.full_name.charAt(0)
                        : "U"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl text-slate-900">
                      {applicant.full_name || "Ứng viên"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {applicant.email || "Chưa cập nhật email"}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {renderStatusBadge(currentStatus)}
                      {applicant.jobTitle ? (
                        <span className="text-sm text-slate-500">
                          Công việc:{" "}
                          <span className="font-medium text-slate-700">
                            {applicant.jobTitle}
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/employer/candidate/${applicant.applicationId}`}
                    className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 hover:shadow-md"
                  >
                    Xem Chi Tiết
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateStatus(applicant.applicationId, "Accepted")
                  }
                  disabled={isUpdating || currentStatus === "Accepted"}
                  className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdating && currentStatus !== "Accepted"
                    ? "Đang cập nhật..."
                    : "Chấp nhận"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateStatus(applicant.applicationId, "Rejected")
                  }
                  disabled={isUpdating || currentStatus === "Rejected"}
                  className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdating && currentStatus !== "Rejected"
                    ? "Đang cập nhật..."
                    : "Từ chối"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateStatus(applicant.applicationId, "Pending")
                  }
                  disabled={isUpdating || currentStatus === "Pending"}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdating && currentStatus !== "Pending"
                    ? "Đang cập nhật..."
                    : "Đặt lại chờ duyệt"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
