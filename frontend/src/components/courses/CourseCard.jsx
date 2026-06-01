import { Link } from "react-router-dom";

export function CourseCard({ course }) {
  const rating = course.avgRating != null ? Number(course.avgRating).toFixed(1) : "—";
  const reviewCount = course.reviewCount ?? 0;
  const tags = course.tags?.length ? course.tags : [];

  return (
    <Link to={`/courses/${course._id}`} className="course-card">
      <span className="course-card-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 4h12a2 2 0 012 2v14l-4-3-4 3-4-3-4 3V6a2 2 0 012-2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h3 className="course-card-title">{course.courseName}</h3>
      <p className="course-card-code">{course.courseCode}</p>
      <div className="course-card-stats">
        <span className="course-card-rating">
          <span className="star" aria-hidden="true">
            ★
          </span>
          {rating}
        </span>
        <span className="course-card-reviews">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M4 19c0-3 2.2-5 5-5s5 2 5 5M16 11h4M16 15h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {reviewCount} reviews
        </span>
      </div>
      {tags.length > 0 && (
        <div className="course-card-tags">
          {tags.slice(0, 4).map((tag) => (
            <span key={tag} className="course-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
