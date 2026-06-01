import { Link } from "react-router-dom";
import { RatingStatCard } from "./RatingStatCard";

function formatScore(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Number(value).toFixed(1)}/5`;
}

export function CourseDetailHeader({ course, stats, courseId }) {
  const ratings = stats?.averageRatings || {};
  const retake =
    stats?.retakeRate != null ? `${stats.retakeRate}%` : "—";

  return (
    <section className="course-detail-header">
      <div className="course-detail-top">
        <div>
          <div className="course-detail-meta">
            <span className="course-code-badge">{course.courseCode}</span>
            <span className="course-credits-label">
              {course.credits ? `${course.credits} tín chỉ` : ""}
            </span>
          </div>
          <h1 className="course-detail-title">{course.courseName}</h1>
          {course.faculty && <p className="course-detail-faculty">{course.faculty}</p>}
          <p className="course-detail-desc">
            {course.description || "Chưa có mô tả cho môn học này."}
          </p>
        </div>
        <Link to={`/courses/${courseId}/reviews/new`} className="btn btn-primary btn-write-review">
          Viết Review
        </Link>
      </div>

      <div className="rating-stats-row">
        <RatingStatCard
          variant="overall"
          label="Tổng thể"
          value={formatScore(ratings.overall)}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3l2.4 6.2H21l-5 4 2 6.2L12 16.8 6 19.4l2-6.2-5-4h6.6L12 3z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <RatingStatCard
          variant="difficulty"
          label="Độ khó"
          value={formatScore(ratings.difficulty)}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 18V6M10 18V10M16 18V4M22 18v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
        <RatingStatCard
          variant="workload"
          label="Khối lượng"
          value={formatScore(ratings.workload)}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 4h12v14H5V4zm6 3v8M9 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
        <RatingStatCard
          variant="teaching"
          label="Giảng dạy"
          value={formatScore(ratings.teachingQuality)}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 10l8-4 8 4-8 4-8-4zm0 4l8 4 8-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          }
        />
        <RatingStatCard
          variant="retake"
          label="Học lại"
          value={retake}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 19c0-3 2.2-5 5-5s5 2 5 5M17 11h4M17 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
      </div>
    </section>
  );
}
