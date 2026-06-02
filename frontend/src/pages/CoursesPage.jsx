import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../api/courses";
import { useAuth } from "../hooks/useAuth";
import { CourseCard } from "../components/courses/CourseCard";
import { CourseSearchBar } from "../components/courses/CourseSearchBar";
import { DashboardHeader } from "../components/layout/DashboardHeader";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export default function CoursesPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function fetchCourses() {
      setIsLoading(true);
      setError("");
      try {
        const params = { page: 1, limit: 50 };
        if (debouncedSearch) params.search = debouncedSearch;
        const response = await getCourses(params);
        setItems(response?.data?.items || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Không thể tải danh sách môn học");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourses();
  }, [debouncedSearch]);

  const addButton = useMemo(
    () =>
      isAuthenticated ? (
        <Link to="/courses/new" className="btn btn-primary btn-add-course">
          <span aria-hidden="true">+</span> Thêm môn học
        </Link>
      ) : null,
    [isAuthenticated]
  );

  return (
    <div className="dashboard-page">
      <DashboardHeader action={addButton} />
      {!isAuthenticated && (
        <p className="guest-hint-banner">
          Bạn đang xem với tư cách <strong>khách</strong> — có thể xem môn học và review.{" "}
          <Link to="/login">Đăng nhập</Link> để viết review, thêm môn hoặc quản lý hồ sơ.
        </p>
      )}
      <div className="dashboard-content">
        <CourseSearchBar value={search} onChange={setSearch} />

        {isLoading ? (
          <LoadingSpinner label="Đang tải môn học..." />
        ) : (
          <>
            {error && <p className="error">{error}</p>}
            {items.length === 0 ? (
              <p className="muted courses-empty">
                {debouncedSearch
                  ? "Không tìm thấy môn học phù hợp."
                  : isAuthenticated
                    ? "Chưa có môn học nào. Hãy thêm môn học đầu tiên."
                    : "Chưa có môn học nào."}
              </p>
            ) : (
              <div className="course-grid">
                {items.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
