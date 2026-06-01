import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function DashboardHeader({ action }) {
  const { user, logout } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "moderator";
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">
        <Link to="/courses" className="brand">
          <span className="brand-icon">R</span>
          <span className="brand-name">ReviewMon</span>
        </Link>
        <nav className="dashboard-nav">
          <NavLink to="/courses" className="dashboard-nav-link">
            Môn học
          </NavLink>
          {isStaff && (
            <NavLink to="/admin" className="dashboard-nav-link">
              Quản trị
            </NavLink>
          )}
          <NavLink to="/profile" className="dashboard-nav-link">
            Hồ sơ
          </NavLink>
        </nav>
        <div className="dashboard-header-actions">
          {action}
          <div className="dashboard-user">
            <span className="dashboard-user-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span>{user?.fullName || "Người dùng"}</span>
          </div>
          <button type="button" className="dashboard-logout" onClick={handleLogout} title="Đăng xuất">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
