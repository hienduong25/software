import axiosClient from "../api/axiosClient";

export const getEmployerProfile = (id) =>
  axiosClient.get(`/employer/profile/${id}`);
export const getApplicants = () => axiosClient.get("/employer/applicants");
export const updateCompanyProfile = (id, data) =>
  axiosClient.put(`/employer/profile/${id}`, data);
export const uploadEmployerAvatar = (id, file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return axiosClient.post(`/employer/profile/${id}/avatar`, formData);
};
