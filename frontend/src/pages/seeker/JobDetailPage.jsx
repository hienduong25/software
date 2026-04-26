import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import jobService from "../../services/jobService";
import { getSavedCVs } from "../../utils/cvStorage";
import { addNotification } from "../../utils/notificationStorage";

const splitContentToList = (value) => {
  if (!value) return [];

  const rawItems = value
    .split(/\n|•|- /)
    .map((item) => item.trim())
    .filter(Boolean);

  const mergedItems = [];

  rawItems.forEach((item) => {
    const previousItem = mergedItems[mergedItems.length - 1];

    if (previousItem?.endsWith(":")) {
      mergedItems[mergedItems.length - 1] = `${previousItem} ${item}`;
      return;
    }

    mergedItems.push(item);
  });

  return mergedItems;
};

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCvId, setSelectedCvId] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState("");

  const savedCvs = useMemo(() => getSavedCVs(user), [user?.id, user?.role]);
  const selectedCv = useMemo(
    () =>
      savedCvs.find((cvItem) => String(cvItem.id) === String(selectedCvId)) ||
      null,
    [savedCvs, selectedCvId],
  );

  useEffect(() => {
    if (!savedCvs.length) {
      setSelectedCvId("");
      return;
    }

    setSelectedCvId((currentValue) => {
      const currentExists = savedCvs.some(
        (cvItem) => String(cvItem.id) === String(currentValue),
      );
      return currentExists ? currentValue : String(savedCvs[0].id);
    });
  }, [savedCvs]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobService.getJobById(Number(id));
        setJob(data || null);
        if (!data) setError("Không tìm thấy công việc.");
      } catch (err) {
        console.error("Load job error:", err);
        setError("Lỗi khi tải thông tin công việc.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Kiểm tra đã ứng tuyển chưa
  useEffect(() => {
    const checkApplied = async () => {
      if (!user?.id || user.role !== "seeker" || !id) return;
      try {
        const applications = await jobService.getApplicationsBySeeker(user.id);
        const applied = Array.isArray(applications)
          ? applications.some((item) => String(item.jobId) === String(id))
          : false;
        setHasApplied(applied);
      } catch {
        // ignore
      }
    };
    checkApplied();
  }, [user?.id, id]);

  const handleApply = async () => {
    if (!user?.id || user.role !== "seeker") {
      setApplyFeedback("Vui lòng đăng nhập bằng tài khoản seeker để ứng tuyển.");
      return;
    }
    if (!selectedCv) {
      setApplyFeedback("Hãy chọn một CV đã lưu trước khi ứng tuyển.");
      return;
    }
    if (!job?.jobId) return;

    setApplyLoading(true);
    setApplyFeedback("");
    try {
      await jobService.applyJob(job.jobId, {
        jobSeekerId: user.id,
        name: selectedCv.name,
        fullName: selectedCv.fullName,
        email: selectedCv.email,
        phone: selectedCv.phone,
        title: selectedCv.title,
        avatar: selectedCv.avatar,
        skills: selectedCv.skills,
        experience: selectedCv.experience,
        cv_content: selectedCv.summary,
        cv_url: selectedCv.cvUrl,
      });
      setHasApplied(true);
      setApplyFeedback(`Đã ứng tuyển thành công vào vị trí ${job.title}!`);

      const employerId = Number(job.employerId || job.employer);
      if (Number.isFinite(employerId) && employerId > 0) {
        addNotification(
          {
            title: "Ứng viên mới ứng tuyển",
            message: `${selectedCv?.fullName || "Ứng viên"} vừa ứng tuyển vào vị trí ${job.title}.`,
          },
          { id: employerId, role: "employer" },
        );
      }
      addNotification(
        {
          title: "Ứng tuyển thành công",
          message: `Bạn đã gửi hồ sơ vào vị trí ${job.title} tại ${job.companyName || "công ty"}.`,
          type: "success",
        },
        { id: user.id, role: "seeker" },
      );
    } catch (err) {
      console.error("Apply error:", err);
      setApplyFeedback(
        err.response?.data?.detail || "Lỗi khi gửi hồ sơ. Vui lòng thử lại.",
      );
    } finally {
      setApplyLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
        Đang tải thông tin công việc...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-700">
        {error || "Không tìm thấy công việc."}
      </div>
    );
  }

  const requirementItems = splitContentToList(job.requirements);
  const descriptionItems = splitContentToList(job.description);
  const isFull = job.currentApplicants >= (job.maxApplicants || 0);
  const remainingSlots = Math.max(
    (job.maxApplicants || 0) - (job.currentApplicants || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="panel-surface rounded-3xl p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              ← Quay lại
            </button>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Chi tiết công việc
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 lg:text-4xl">
                {job.title}
              </h1>
              <p className="mt-2 text-lg font-medium text-slate-600">
                {job.companyName || "Công ty tuyển dụng"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isFull
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {isFull ? "Đã đủ ứng viên" : "Đang tuyển"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {remainingSlots} slot còn lại
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                ID việc làm #{job.jobId}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-3 flex-wrap">
            {user?.role === "seeker" && (
              hasApplied ? (
                <span className="rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700">
                  ✓ Đã ứng tuyển
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applyLoading || isFull}
                  className="rounded-full bg-slate-800 px-5 py-2 text-sm font-bold text-white transition hover:bg-slate-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {applyLoading ? "Đang nộp..." : isFull ? "Đã đủ ứng viên" : "Ứng Tuyển"}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Địa điểm
            </p>
            <p className="mt-2 text-base font-semibold text-slate-800">
              {job.location || "Chưa cập nhật"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mức lương
            </p>
            <p className="mt-2 text-base font-semibold text-slate-800">
              {job.salary_range || "Chưa cập nhật"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Số ứng viên hiện tại
            </p>
            <p className="mt-2 text-base font-semibold text-slate-800">
              {job.currentApplicants || 0}/{job.maxApplicants || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Trạng thái
            </p>
            <p className="mt-2 text-base font-semibold text-slate-800">
              {job.status || (isFull ? "Closed" : "Active")}
            </p>
          </div>
        </div>
      </div>

      {applyFeedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            applyFeedback.includes("thành công")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {applyFeedback}
        </div>
      ) : null}

      <div className="space-y-6">
        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
              Mô tả công việc
            </p>

            {descriptionItems.length > 1 ? (
              <ul className="mt-4 space-y-3 text-slate-700">
                {descriptionItems.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <span className="leading-7">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 leading-7 text-slate-700">
                {job.description || "Không có mô tả công việc."}
              </p>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
              Yêu cầu ứng tuyển
            </p>

            {requirementItems.length > 0 ? (
              <ul className="mt-4 space-y-3 text-slate-700">
                {requirementItems.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <span className="leading-7">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-slate-700">
                {job.requirements || "Chưa có yêu cầu chi tiết cho vị trí này."}
              </div>
            )}

            <div className="mt-6 rounded-2xl bg-linear-to-br from-slate-50 to-slate-100 p-4">
              <p className="text-sm font-semibold text-slate-800">Gợi ý nhanh</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Hãy chuẩn bị CV nhấn mạnh kinh nghiệm phù hợp với vị trí{" "}
                <span className="font-semibold text-slate-800">{job.title}</span>,
                đặc biệt là các kỹ năng và kết quả công việc liên quan đến{" "}
                <span className="font-semibold text-slate-800">
                  {job.companyName || "nhà tuyển dụng"}
                </span>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
