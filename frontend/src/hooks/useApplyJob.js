import { useState } from "react";
import jobService from "../services/jobService";
import { addNotification } from "../utils/notificationStorage";

/**
 * Hook quản lý toàn bộ flow ứng tuyển:
 * - Mở/đóng panel
 * - Phân tích AI (preview match)
 * - Nộp đơn chính thức
 */
export function useApplyJob({ user, savedCvs, onSuccess }) {
  const [applyTarget, setApplyTarget] = useState(null); // jobId đang mở panel
  const [selectedCvId, setSelectedCvId] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const openPanel = (job) => {
    setApplyTarget(String(job.jobId));
    setSelectedCvId(savedCvs[0]?.id ? String(savedCvs[0].id) : "");
    setAnalysisResult(null);
    setFeedback(
      savedCvs.length === 0
        ? "Bạn chưa có CV nào. Hãy tạo CV trước khi ứng tuyển."
        : "",
    );
  };

  const closePanel = () => {
    setApplyTarget(null);
    setAnalysisResult(null);
    setFeedback("");
  };

  const getSelectedCv = () =>
    savedCvs.find((item) => String(item.id) === String(selectedCvId));

  const buildCvPayload = (cv) => ({
    jobSeekerId: user.id,
    ...(cv
      ? {
          name: cv.name,
          fullName: cv.fullName,
          email: cv.email,
          phone: cv.phone,
          title: cv.title,
          avatar: cv.avatar,
          skills: cv.skills,
          experience: cv.experience,
          cv_content: cv.summary,
          cv_url: cv.cvUrl,
        }
      : {}),
  });

  const handleAnalyze = async (job) => {
    if (!selectedCvId) {
      setFeedback("Hãy chọn một CV trước khi phân tích.");
      return;
    }
    const cv = getSelectedCv();
    setAnalysisLoading(true);
    setAnalysisResult(null);
    try {
      const response = await jobService.previewJobMatch(
        job.jobId,
        buildCvPayload(cv),
      );
      const data = response?.analysis || response || {};
      setAnalysisResult({
        score: data.score ?? response?.match_score ?? 0,
        summary: data.summary || response?.ai_summary || "",
        strengths: data.strengths || response?.strengths || [],
        weaknesses: data.weaknesses || response?.weaknesses || [],
      });
    } catch (err) {
      setFeedback(
        err.response?.data?.detail ||
          "Không thể phân tích lúc này. Thử lại sau.",
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleApply = async (job) => {
    if (!selectedCvId) {
      setFeedback("Hãy chọn một CV đã có trước khi nộp.");
      return;
    }
    if (!user || user.role !== "seeker") {
      setFeedback("Vui lòng đăng nhập bằng tài khoản người tìm việc.");
      return;
    }

    const cv = getSelectedCv();
    setApplyLoading(true);
    try {
      const response = await jobService.applyJob(job.jobId, buildCvPayload(cv));

      // Gửi notification cho employer
      const employerId = Number(job.employerId || job.employer);
      if (Number.isFinite(employerId) && employerId > 0) {
        addNotification(
          {
            title: "Ứng viên mới ứng tuyển",
            message: `${cv?.fullName || "Ứng viên"} vừa ứng tuyển vào vị trí ${job.title}.`,
          },
          { id: employerId, role: "employer" },
        );
      }

      // Gửi notification cho seeker
      addNotification(
        {
          title: "Ứng tuyển thành công",
          message: `Bạn đã gửi hồ sơ vào vị trí ${job.title} tại ${job.companyName || job.company || "công ty"}.`,
          type: "success",
        },
        { id: user.id, role: "seeker" },
      );

      closePanel();
      onSuccess?.(job);
      return response;
    } catch (error) {
      setFeedback(
        error.response?.data?.detail ||
          "Lỗi khi gửi hồ sơ. Vui lòng thử lại sau.",
      );
    } finally {
      setApplyLoading(false);
    }
  };

  return {
    applyTarget,
    selectedCvId,
    setSelectedCvId,
    analysisResult,
    analysisLoading,
    applyLoading,
    feedback,
    setFeedback,
    openPanel,
    closePanel,
    handleAnalyze,
    handleApply,
  };
}
