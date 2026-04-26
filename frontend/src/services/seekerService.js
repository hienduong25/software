import axiosClient from "../api/axiosClient";

export const getSeekerProfile = (id) =>
  axiosClient.get(`/seeker/profile/${id}`);
export const updateSeekerProfile = (id, data) =>
  axiosClient.put(`/seeker/profile/${id}`, data);
export const uploadSeekerAvatar = (id, file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return axiosClient.post(`/seeker/profile/${id}/avatar`, formData);
};
export const getApplications = () => axiosClient.get("/seeker/applications");
