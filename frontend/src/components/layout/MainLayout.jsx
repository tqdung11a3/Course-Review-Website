import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function MainLayout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <>
      <header className="topnav">
        <div className="topnav-inner">
          <Link to="/">Course Review</Link>
          <nav className="topnav-links">
            <NavLink to="/courses">Courses</NavLink>
            {isAuthenticated && <NavLink to="/profile">Profile</NavLink>}
            {isAuthenticated && (user?.role === "admin" || user?.role === "moderator") && (
              <NavLink to="/admin/proofs">Proof Moderation</NavLink>
            )}
            {!isAuthenticated ? (
              <NavLink to="/login">Login</NavLink>
            ) : (
              <button type="button" onClick={logout}>
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
