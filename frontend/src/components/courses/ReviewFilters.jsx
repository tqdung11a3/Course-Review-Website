import {
  DIFFICULTY_FILTER_OPTIONS,
  OVERALL_FILTER_OPTIONS,
  REVIEW_SORT_OPTIONS,
} from "../../utils/reviewFilterConstants";

export function ReviewFilters({ filters, facets, onChange, onReset }) {
  const semesters = facets?.semesters || [];
  const academicYears = facets?.academicYears || [];
  const lecturerNames = facets?.lecturerNames || [];

  return (
    <div className="review-filters">
      <div className="review-filters-row">
        <label className="review-filter-field">
          <span>Sắp xếp</span>
          <select
            className="form-control"
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value })}
          >
            {REVIEW_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="review-filter-field">
          <span>Giảng viên</span>
          <select
            className="form-control"
            value={filters.lecturerName}
            onChange={(e) => onChange({ lecturerName: e.target.value })}
          >
            <option value="">Tất cả giảng viên</option>
            {lecturerNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="review-filter-field">
          <span>Năm học</span>
          <select
            className="form-control"
            value={filters.academicYear}
            onChange={(e) => onChange({ academicYear: e.target.value })}
          >
            <option value="">Tất cả năm học</option>
            {academicYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="review-filter-field">
          <span>Học kỳ</span>
          <select
            className="form-control"
            value={filters.semester}
            onChange={(e) => onChange({ semester: e.target.value })}
          >
            <option value="">Tất cả học kỳ</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="review-filter-field">
          <span>Độ khó</span>
          <select
            className="form-control"
            value={filters.difficulty}
            onChange={(e) => onChange({ difficulty: e.target.value })}
          >
            {DIFFICULTY_FILTER_OPTIONS.map((o) => (
              <option key={o.value || "all-diff"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="review-filter-field">
          <span>Điểm tổng thể</span>
          <select
            className="form-control"
            value={filters.overall}
            onChange={(e) => onChange({ overall: e.target.value })}
          >
            {OVERALL_FILTER_OPTIONS.map((o) => (
              <option key={o.value || "all-overall"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button type="button" className="btn btn-outline btn-sm review-filter-reset" onClick={onReset}>
        Xóa bộ lọc
      </button>
    </div>
  );
}
