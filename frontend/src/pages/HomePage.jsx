import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export default function HomePage() {
  const { isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner label="Đang tải..." />;
  return <Navigate to="/courses" replace />;
}
