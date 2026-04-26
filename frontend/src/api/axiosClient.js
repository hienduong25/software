import axios from "axios";

const rawApiUrl = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).trim();
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "");
const baseURL = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

const axiosClient = axios.create({
  baseURL,
});

// Interceptor cho Request: Tự động đính kèm Token JWT nếu có
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers?.common?.["Content-Type"];
      delete config.headers?.post?.["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor cho Response: Xử lý lỗi tập trung (ví dụ lỗi 401)
axiosClient.interceptors.response.use(
  (response) => response.data, // Trả về thẳng data để FE dùng cho gọn
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
