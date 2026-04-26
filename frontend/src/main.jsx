import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
// 1. Import cái AuthProvider mà bạn đã tạo (đảm bảo đúng đường dẫn file)
import { AuthProvider } from "./context/AuthContext"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 2. Bọc App bên trong AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);