import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner label="Đang tải..." />;
  if (isAuthenticated) return <Navigate to="/courses" replace />;
  return <Navigate to="/login" replace />;
}
