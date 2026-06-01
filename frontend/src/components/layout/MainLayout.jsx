import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const DASHBOARD_PATHS = ["/courses", "/profile"];

export function MainLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isDashboard =
    isAuthenticated &&
    (DASHBOARD_PATHS.some((p) => location.pathname.startsWith(p)) ||
      location.pathname.startsWith("/admin"));

  if (isDashboard) {
    return <>{children}</>;
  }

  return <main className="container">{children}</main>;
}
