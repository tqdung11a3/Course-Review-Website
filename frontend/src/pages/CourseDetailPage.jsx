import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getCourseById, getCourseReviews, getCourseStats } from "../api/courses";
import { CourseDetailHeader } from "../components/courses/CourseDetailHeader";
import { ReviewCard } from "../components/courses/ReviewCard";
import { ReviewFilters } from "../components/courses/ReviewFilters";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { DashboardHeader } from "../components/layout/DashboardHeader";
import { useAuth } from "../hooks/useAuth";
import { EMPTY_REVIEW_FILTERS } from "../utils/reviewFilterConstants";

export default function CourseDetailPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [facets, setFacets] = useState({
    semesters: [],
    academicYears: [],
    lecturerNames: [],
  });
  const [filters, setFilters] = useState(EMPTY_REVIEW_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    setIsReviewsLoading(true);
    try {
      const params = { page: 1, limit: 50, sort: filters.sort };
      if (filters.overall) params.overall = filters.overall;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.semester) params.semester = filters.semester;
      if (filters.academicYear) params.academicYear = filters.academicYear;
      if (filters.lecturerName) params.lecturerName = filters.lecturerName;

      const reviewsRes = await getCourseReviews(id, params);
      setReviews(reviewsRes?.data?.items || []);
      if (reviewsRes?.data?.facets) {
        setFacets((prev) => ({
          semesters: reviewsRes.data.facets.semesters?.length
            ? reviewsRes.data.facets.semesters
            : prev.semesters,
          academicYears: reviewsRes.data.facets.academicYears?.length
            ? reviewsRes.data.facets.academicYears
            : prev.academicYears,
          lecturerNames: reviewsRes.data.facets.lecturerNames?.length
            ? reviewsRes.data.facets.lecturerNames
            : prev.lecturerNames,
        }));
      }
    } finally {
      setIsReviewsLoading(false);
    }
  }, [id, filters]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const [courseRes, statsRes] = await Promise.all([
          getCourseById(id),
          getCourseStats(id),
        ]);
        setCourse(courseRes?.data?.course || null);
        setStats(statsRes?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Không thể tải chi tiết môn học");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!isLoading && course) {
      loadReviews();
    }
  }, [loadReviews, isLoading, course]);

  function updateFilters(patch) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function handleVoteChange(reviewId, voteData) {
    setReviews((prev) =>
      prev.map((r) => (r._id === reviewId ? { ...r, ...voteData } : r))
    );
    if (filters.sort === "-helpfulCount") {
      setReviews((prev) =>
        [...prev].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
      );
    }
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <div className="dashboard-content">
        <Link to="/courses" className="back-link">
          ← Quay lại danh sách
        </Link>

        {isLoading ? (
          <LoadingSpinner label="Đang tải môn học..." />
        ) : error ? (
          <p className="error">{error}</p>
        ) : !course ? (
          <p className="muted">Không tìm thấy môn học.</p>
        ) : (
          <>
            <CourseDetailHeader course={course} stats={stats} courseId={id} />

            <section className="course-reviews-section">
              <h2 className="course-reviews-title">
                Đánh giá từ sinh viên ({stats?.totalReviews ?? reviews.length})
              </h2>

              <ReviewFilters
                filters={filters}
                facets={facets}
                onChange={updateFilters}
                onReset={() => setFilters(EMPTY_REVIEW_FILTERS)}
              />

              {isReviewsLoading ? (
                <LoadingSpinner label="Đang tải review..." />
              ) : reviews.length === 0 ? (
                <p className="muted courses-empty">
                  Không có review phù hợp bộ lọc.{" "}
                  {isAuthenticated ? (
                    <Link to={`/courses/${id}/reviews/new`}>Viết review</Link>
                  ) : (
                    <>
                      <Link to="/login" state={{ from: location }}>
                        Đăng nhập
                      </Link>{" "}
                      để viết review.
                    </>
                  )}
                </p>
              ) : (
                <div className="review-list">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      onVoteChange={handleVoteChange}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
