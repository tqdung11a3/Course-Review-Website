function InfoRow({ label, children }) {
  if (!children) return null;
  return (
    <div className="course-info-row">
      <span className="course-info-label">{label}</span>
      <div className="course-info-value">{children}</div>
    </div>
  );
}

function ChipList({ items }) {
  if (!items?.length) return null;
  return (
    <div className="course-info-chips">
      {items.map((item) => (
        <span key={item} className="course-tag">
          {item}
        </span>
      ))}
    </div>
  );
}

export function CourseDetailMeta({ course }) {
  if (!course) return null;

  const prerequisites = (course.prerequisiteCourseIds || [])
    .map((p) => {
      if (typeof p === "object" && p?.courseCode) {
        return `${p.courseCode} — ${p.courseName}`;
      }
      return null;
    })
    .filter(Boolean);

  const syllabusFiles = course.syllabusFiles || [];
  const hasMeta =
    course.courseType ||
    course.offeredSemesters?.length ||
    course.teachingLanguage ||
    course.learningMode ||
    course.tags?.length ||
    prerequisites.length ||
    course.assessmentMethods?.length ||
    syllabusFiles.length;

  if (!hasMeta) {
    return (
      <div className="course-detail-info">
        <p className="muted course-detail-info-empty">
          Chưa có thêm thông tin phân loại / đánh giá / tài liệu từ form tạo môn.
        </p>
      </div>
    );
  }

  return (
    <div className="course-detail-info">
      <h3 className="course-detail-info-title">Thông tin môn học</h3>
      <div className="course-detail-info-grid">
        <InfoRow label="Loại môn học">{course.courseType || null}</InfoRow>
        <InfoRow label="Học kỳ thường mở">
          <ChipList items={course.offeredSemesters} />
        </InfoRow>
        <InfoRow label="Ngôn ngữ giảng dạy">{course.teachingLanguage || null}</InfoRow>
        <InfoRow label="Hình thức học">{course.learningMode || null}</InfoRow>
        <InfoRow label="Thẻ (tags)">
          <ChipList items={course.tags} />
        </InfoRow>
        <InfoRow label="Môn tiên quyết">
          {prerequisites.length > 0 ? (
            <ul className="course-info-list">
              {prerequisites.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          ) : null}
        </InfoRow>
        <InfoRow label="Hình thức đánh giá">
          <ChipList items={course.assessmentMethods} />
        </InfoRow>
        <InfoRow label="Tài liệu / Syllabus">
          {syllabusFiles.length > 0 ? (
            <ul className="course-syllabus-list">
              {syllabusFiles.map((file, index) => (
                <li key={file.fileUrl || index}>
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="course-syllabus-link"
                  >
                    📄 {file.fileName || "Tải syllabus"}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </InfoRow>
      </div>
    </div>
  );
}
