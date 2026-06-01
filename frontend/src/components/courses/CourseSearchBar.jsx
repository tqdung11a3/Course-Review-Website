export function CourseSearchBar({ value, onChange }) {
  return (
    <div className="course-search">
      <span className="course-search-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="search"
        className="course-search-input"
        placeholder="Tìm kiếm môn học theo tên hoặc mã môn..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
