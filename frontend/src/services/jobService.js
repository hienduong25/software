import axiosClient from "../api/axiosClient";

const jobService = {
  // Lấy danh sách công việc
  getAllJobs: () => {
    return axiosClient.get("/jobs");
  },

  // Xem chi tiết một công việc
  getJobById: (id) => {
    return axiosClient.get(`/jobs/${id}`);
  },

  previewJobMatch: (jobId, applicationData) => {
    return axiosClient.post(`/jobs/${jobId}/preview-match`, applicationData);
  },

  // Ứng viên nộp đơn (Gửi kèm hồ sơ)
  applyJob: (jobId, applicationData) => {
    // applicationData có thể chứa cv_content hoặc file
    return axiosClient.post(`/jobs/${jobId}/apply`, applicationData);
  },

  withdrawApplication: (jobId, applicationData) => {
    return axiosClient.delete(`/jobs/${jobId}/apply`, {
      data: applicationData,
      params: {
        jobSeekerId: applicationData?.jobSeekerId,
      },
    });
  },

  getApplicationsBySeeker: (seekerId) => {
    return axiosClient.get(`/seeker/profile/${seekerId}/applications`);
  },

  // Lấy danh sách ứng viên của nhà tuyển dụng hiện tại
  // Nhớ dùng đúng tên trường match_score từ Backend trả về
  getCandidates: (employerId) => {
    return axiosClient.get(`/employer/profile/${employerId}/applicants`);
  },

  updateApplicationStatus: (applicationId, payload) => {
    return axiosClient.put(
      `/jobs/applications/${applicationId}/status`,
      payload,
    );
  },

  recalculateApplicationMatch: (applicationId, payload) => {
    return axiosClient.put(
      `/jobs/applications/${applicationId}/match-score`,
      payload,
    );
  },

  // Tạo bài đăng công việc mới (Dành cho Employer)
  createJob: (jobData) => {
    return axiosClient.post("/jobs", jobData);
  },

  // Cập nhật thông tin bài đăng công việc
  updateJob: (jobId, jobData) => {
    return axiosClient.put(`/jobs/${jobId}`, jobData);
  },

  // Xóa bài đăng công việc
  deleteJob: (jobId) => {
    return axiosClient.delete(`/jobs/${jobId}`);
  },
};

export default jobService;
