import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/shared/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFoundPage from "../pages/shared/NotFoundPage";

import SeekerDashboardPage from "../pages/seeker/SeekerDashboardPage";
import JobBoardPage from "../pages/seeker/JobBoardPage";
import JobDetailPage from "../pages/seeker/JobDetailPage";
import ProfileCVPage from "../pages/seeker/ProfileCVPage";
import ApplicationsPage from "../pages/seeker/ApplicationsPage";

import EmployerDashboardPage from "../pages/employer/EmployerDashboardPage";
import PostJobPage from "../pages/employer/PostJobPage";
import EditJobPage from "../pages/employer/EditJobPage";
import ManageJobsPage from "../pages/employer/ManageJobsPage";
import EmployerJobDetailPage from "../pages/employer/JobDetailPage";
import ApplicantsPage from "../pages/employer/ApplicantsPage";
import CandidateDetailPage from "../pages/employer/CandidateDetailPage";
import CompanyProfilePage from "../pages/employer/CompanyProfilePage";
import NotificationsPage from "../pages/employer/NotificationsPage";
import SettingsPage from "../pages/shared/SettingsPage";

import SeekerLayout from "../layouts/SeekerLayout";
import EmployerLayout from "../layouts/EmployerLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Shared */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Seeker */}
        <Route path="/seeker" element={<SeekerLayout />}>
          <Route index element={<SeekerDashboardPage />} />
          <Route path="jobs" element={<JobBoardPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="profile" element={<ProfileCVPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="settings" element={<SettingsPage role="seeker" />} />
        </Route>

        {/* Employer */}
        <Route path="/employer" element={<EmployerLayout />}>
          <Route index element={<EmployerDashboardPage />} />
          <Route path="post-job" element={<PostJobPage />} />
          <Route path="manage-jobs" element={<ManageJobsPage />} />
          <Route path="manage-jobs/:id/edit" element={<EditJobPage />} />
          <Route path="jobs/:id" element={<EmployerJobDetailPage />} />
          <Route path="applicants" element={<ApplicantsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="candidate/:id" element={<CandidateDetailPage />} />
          <Route path="company-profile" element={<CompanyProfilePage />} />
          <Route path="settings" element={<SettingsPage role="employer" />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
