import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import AIAnalysisPanel from "../../components/ai/AIAnalysisPanel";
import { AuthContext } from "../../context/AuthContext";
import jobService from "../../services/jobService";

const STATUS_LABELS = {
  Pending: "Đang chờ",
  Accepted: "Đã chấp nhận",
  Rejected: "Đã từ chối",
  Withdrawn: "Đã rút",
};

const STATUS_STYLES = {
  Pending: "border border-amber-200 bg-amber-50 text-amber-700",
  Accepted: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border border-rose-200 bg-rose-50 text-rose-700",
  Withdrawn: "border border-slate-200 bg-slate-100 text-slate-600",
};

const formatDateTime = (value) => {
  if (!value) return "Chưa cập nhật";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const normalizeMultilineText = (value) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return value || "";
};

function InfoField({ label, value, breakAll = false }) {
  return (
    <div className="rounded-2xl bg-white/75 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-2 whitespace-pre-wrap leading-7 text-slate-700 ${breakAll ? "break-all" : ""}`}
      >
        {value || "Chưa cập nhật"}
      </p>
    </div>
  );
}

export default function CandidateDetailPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchCandidateDetail = async () => {
      if (!user?.id || !id) {
        setCandidate(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setFeedback({ type: "", message: "" });

      try {
        const applicants = await jobService.getCandidates(user.id);
        const matchedCandidate = (applicants || []).find(
          (item) => String(item.applicationId) === String(id),
        );

        if (!matchedCandidate) {
          setCandidate(null);
          setFeedback({
            type: "error",
            message: "Không tìm thấy hồ sơ ứng viên này.",
          });
          return;
        }

        setCandidate(matchedCandidate);
      } catch (error) {
        console.error("Load candidate detail error:", error);
        setCandidate(null);
        setFeedback({
          type: "error",
          message: "Không thể tải chi tiết ứng viên. Vui lòng thử lại.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateDetail();
  }, [id, user]);

  const currentStatus = candidate?.status || "Pending";

  const displayData = useMemo(() => {
    if (!candidate) return null;

    return {
      cvName: candidate.cvName || candidate.submitted_cv_name || "CV đã nộp",
      fullName: candidate.full_name || candidate.fullName || "Ứng viên",
      email: candidate.email || "",
      phone: candidate.phone || "",
      title: candidate.title || "",
      jobTitle: candidate.jobTitle || "",
      companyName: candidate.companyName || candidate.company || "",
      appliedAt: candidate.applied_at || candidate.appliedAt || "",
      location: candidate.location || "",
      salary: candidate.salary_range || candidate.salary || "",
      skills: normalizeMultilineText(candidate.skills),
      experience: normalizeMultilineText(candidate.experience),
      cvContent: normalizeMultilineText(candidate.cv_content),
      cvUrl: candidate.cv_url || "",
      avatar: candidate.avatar || "",
      aiSummary: candidate.ai_summary || "",
      matchScore: candidate.match_score ?? 0,
      strengths: Array.isArray(candidate.strengths) ? candidate.strengths : [],
      weaknesses: Array.isArray(candidate.weaknesses) ? candidate.weaknesses : [],
    };
  }, [candidate]);

  const handleAnalyzeApplication = async () => {
    if (!user?.id || user.role !== "employer") {
      setFeedback({
        type: "error",
        message: "Vui lòng đăng nhập bằng tài khoản employer để đánh giá hồ sơ.",
      });
      return;
    }

    if (!candidate?.applicationId) {
      setFeedback({
        type: "error",
        message: "Không tìm thấy hồ sơ ứng tuyển để đánh giá.",
      });
      return;
    }

    setAnalysisLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      const response = await jobService.recalculateApplicationMatch(
        candidate.applicationId,
        { employerId: user.id },
      );

      const analysisResult = response?.analysis || response || {};
      const nextScore =
        analysisResult.score ?? response?.match_score ?? response?.score ?? 0;
      const nextSummary =
        analysisResult.summary || response?.ai_summary || "";
      const nextStrengths = analysisResult.strengths || response?.strengths || [];
      const nextWeaknesses = analysisResult.weaknesses || response?.weaknesses || [];

      setCandidate((currentCandidate) => {
        if (!currentCandidate) return currentCandidate;
        return {
          ...currentCandidate,
          match_score: nextScore,
          ai_summary: nextSummary,
          strengths: nextStrengths,
          weaknesses: nextWeaknesses,
        };
      });

      setFeedback({
        type: "success",
        message: "Đã đánh giá lại hồ sơ bằng AI thành công.",
      });
    } catch (error) {
      console.error("Recalculate application match error:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.detail ||
          "Không thể đánh giá hồ sơ lúc này. Vui lòng thử lại.",
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
        Đang tải chi tiết ứng viên...
      </div>
    );
  }

  if (!candidate || !displayData) {
    return (
      <div className="space-y-4">
        {feedback.message ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {feedback.message}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="panel-surface rounded-[34px] p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-slate-200">
              {displayData.avatar ? (
                <img
                  src={displayData.avatar}
                  alt={displayData.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-slate-600">
                  {(displayData.fullName || "U").charAt(0)}
                </span>
              )}
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                Candidate detail
              </p>
              <h1 className="mt-2 text-4xl text-slate-900">
                {displayData.fullName}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                CV đã nộp:{" "}
                <span className="font-medium text-slate-700">
                  {displayData.cvName}
                </span>
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[currentStatus] || "border border-slate-200 bg-slate-100 text-slate-600"}`}
                >
                  {STATUS_LABELS[currentStatus] || currentStatus}
                </span>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Ứng tuyển:</span>
                  <span>{displayData.jobTitle || "Chưa cập nhật"}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Nộp lúc:</span>
                  <span>{formatDateTime(displayData.appliedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Quay lại
            </button>
          </div>
        </div>

        {feedback.message ? (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel-surface rounded-[34px] p-6 lg:p-8">
          <h2 className="text-3xl text-slate-900">Snapshot CV đã nộp</h2>
          <p className="mt-2 text-sm text-slate-500">
            Đây là dữ liệu CV tại thời điểm ứng tuyển, dùng để chấm AI và đối
            chiếu về sau.
          </p>

          <div className="mt-5 grid gap-4">
            <InfoField label="Họ và tên" value={displayData.fullName} />
            <InfoField label="Email" value={displayData.email} />
            <InfoField label="Số điện thoại" value={displayData.phone} />
            <InfoField label="Vị trí mong muốn" value={displayData.title} />
            <InfoField label="Công ty" value={displayData.companyName} />
            <InfoField
              label="Địa điểm công việc"
              value={displayData.location}
            />
            <InfoField label="Mức lương" value={displayData.salary} />
            <InfoField label="Kỹ năng" value={displayData.skills} />
            <InfoField label="Kinh nghiệm" value={displayData.experience} />
            <InfoField label="Nội dung CV" value={displayData.cvContent} />
            <InfoField
              label="Link CV / Portfolio"
              value={displayData.cvUrl}
              breakAll
            />
          </div>
        </section>

        <section className="space-y-4">
          <AIAnalysisPanel
            summary={displayData.aiSummary}
            strengths={displayData.strengths}
            missingSkills={displayData.weaknesses}
            score={displayData.matchScore}
            actionLabel="Đánh giá hồ sơ"
            onAnalyze={handleAnalyzeApplication}
            loading={analysisLoading}
            helperText="Bấm nút đánh giá để AI chấm lại độ phù hợp của hồ sơ ứng viên với bài đăng hiện tại."
            emptyState="Chưa có kết quả đánh giá AI cho hồ sơ này."
          />
        </section>
      </div>
    </div>
  );
}
