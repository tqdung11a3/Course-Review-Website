import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CoursesPage from "../pages/CoursesPage";
import AddCoursePage from "../pages/AddCoursePage";
import CourseDetailPage from "../pages/CourseDetailPage";
import WriteReviewPage from "../pages/WriteReviewPage";
import ProfilePage from "../pages/ProfilePage";
import AdminModerationPage from "../pages/AdminModerationPage";
import NotFoundPage from "../pages/NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

export function AppRouter() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/new" element={<AddCoursePage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/courses/:id/reviews/new" element={<WriteReviewPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin", "moderator"]} />}>
          <Route path="/admin" element={<AdminModerationPage />} />
        </Route>

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
}
