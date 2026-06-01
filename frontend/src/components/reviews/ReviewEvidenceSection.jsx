export function ReviewEvidenceSection({ review }) {
  const files = review?.evidenceFiles || [];
  if (!files.length) {
    return (
      <section className="review-evidence-section">
        <h4 className="review-subsection-title">Minh chứng / Bảng điểm</h4>
        <p className="muted">Sinh viên chưa tải file minh chứng.</p>
      </section>
    );
  }

  return (
    <section className="review-evidence-section">
      <h4 className="review-subsection-title">Minh chứng / Bảng điểm</h4>
      {review.grade && (
        <p className="review-evidence-grade">
          <strong>Điểm số (tự khai):</strong> {review.grade}
        </p>
      )}
      <ul className="review-evidence-list">
        {files.map((file, index) => (
          <li key={file.fileUrl || index} className="review-evidence-item">
            <span className="review-evidence-icon" aria-hidden="true">
              📄
            </span>
            <div className="review-evidence-info">
              <a href={file.fileUrl} target="_blank" rel="noreferrer" className="review-evidence-link">
                {file.fileName || "Xem file minh chứng"}
              </a>
              {file.fileSize > 0 && (
                <span className="muted review-evidence-size">
                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
