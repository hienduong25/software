import { useContext } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import { AuthContext } from "../context/AuthContext";

export default function SeekerLayout() {
  const { user, authLoading } = useContext(AuthContext);
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-400">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?role=seeker" state={{ from: location }} replace />;
  }

  if (user.role !== "seeker") {
    return <Navigate to="/employer" replace />;
  }

  return (
    <div className="min-h-screen">
      <Sidebar role="seeker" />
      <div className="flex flex-col lg:ml-80">
        <Topbar title="Seeker Portal" role="seeker" />
        <main className="px-4 pb-6 pt-4 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
