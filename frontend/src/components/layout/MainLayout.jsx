import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function MainLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const isDashboard =
    path.startsWith("/courses") ||
    (isAuthenticated && (path.startsWith("/profile") || path.startsWith("/admin")));

  if (isDashboard) {
    return <>{children}</>;
  }

  return <main className="container">{children}</main>;
}
