import axiosClient from "../api/axiosClient";

const authService = {
  // Đăng ký tài khoản mới
  register: async (userData) => {
    // userData sẽ bao gồm { email, password, full_name, role }
    // Trả về data từ Backend để RegisterPage xử lý logic tiếp theo
    return await axiosClient.post("/auth/register", userData);
  },

  // Đăng nhập
  login: async (credentials) => {
    // FastAPI trả về: { access_token: "...", token_type: "bearer", user: {...} }
    const data = await axiosClient.post("/auth/login", credentials);
    
    if (data && data.access_token) {
      // Lưu token để dùng cho các request sau trong axiosClient interceptor
      localStorage.setItem("token", data.access_token);
      
      // Lưu thông tin user để hiển thị tên, role (Xóa sổ ông Nguyễn Văn A)
      // Lưu ý: data.user phải chứa full_name từ MySQL Aiven
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Có thể dùng window.location.href = "/login" để reset sạch trạng thái app
  },

  // Hàm bổ trợ: Lấy thông tin user hiện tại từ bộ nhớ máy
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
};

export default authService;