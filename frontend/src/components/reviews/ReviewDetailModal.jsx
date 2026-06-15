import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReviewById } from "../../api/reviews";
import { ReviewCard } from "../courses/ReviewCard";
import { ReviewEvidenceSection } from "./ReviewEvidenceSection";
import { LoadingSpinner } from "../common/LoadingSpinner";

const STATUS_LABELS = {
  pending: { text: "Chờ duyệt", className: "status-pending" },
  published: { text: "Đã duyệt", className: "status-published" },
  rejected: { text: "Bị từ chối", className: "status-rejected" },
  hidden: { text: "Đã ẩn", className: "status-rejected" },
};

export function ReviewDetailModal({ reviewId, onClose, footer, showVoting = true }) {
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const res = await getReviewById(reviewId);
        setReview(res?.data?.review || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Không tải được review");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [reviewId]);

  const st = review ? STATUS_LABELS[review.status] || STATUS_LABELS.pending : null;
  const courseId = review?.courseId?._id || review?.courseId;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-header">
          <h2>Chi tiết review</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <LoadingSpinner label="Đang tải..." />
          ) : error && !review ? (
            <p className="error">{error}</p>
          ) : review ? (
            <>
              {st && (
                <div className="review-detail-status">
                  <span className={`review-status-badge ${st.className}`}>{st.text}</span>
                  {review.status === "pending" && (
                    <p className="muted">Review đang chờ quản trị phê duyệt.</p>
                  )}
                  {review.status === "rejected" && review.moderationNote && (
                    <p className="review-reject-reason">
                      <strong>Lý do từ chối:</strong> {review.moderationNote}
                    </p>
                  )}
                </div>
              )}
              <ReviewEvidenceSection review={review} />
              <ReviewCard review={review} showVoting={showVoting} />
            </>
          ) : null}
          {error && review && <p className="error">{error}</p>}
        </div>

        <div className="modal-footer">
          {footer}
          {review?.status === "published" && courseId && (
            <Link to={`/courses/${courseId}`} className="btn btn-outline" onClick={onClose}>
              Xem trên trang môn
            </Link>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
