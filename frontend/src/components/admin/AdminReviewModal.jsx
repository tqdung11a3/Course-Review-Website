import { useState } from "react";
import { publishReview, rejectReview } from "../../api/reviews";
import { ReviewDetailModal } from "../reviews/ReviewDetailModal";

export function AdminReviewModal({ reviewId, onClose, onActionDone }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  async function handleApprove() {
    setIsSubmitting(true);
    setError("");
    try {
      await publishReview(reviewId);
      onActionDone();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể phê duyệt");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReject() {
    setIsSubmitting(true);
    setError("");
    try {
      await rejectReview(reviewId, rejectNote.trim() || "Review không đáp ứng tiêu chí.");
      onActionDone();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể từ chối");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (showRejectForm) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-panel modal-panel--small" onClick={(e) => e.stopPropagation()}>
          <h3>Từ chối review</h3>
          <textarea
            className="form-control form-textarea"
            rows={3}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Lý do từ chối (gửi thông báo cho sinh viên)..."
          />
          {error && <p className="error">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowRejectForm(false)}>
              Hủy
            </button>
            <button type="button" className="btn btn-danger" disabled={isSubmitting} onClick={handleReject}>
              {isSubmitting ? "Đang gửi..." : "Xác nhận từ chối"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReviewDetailModal
      reviewId={reviewId}
      onClose={onClose}
      footer={
        <>
          {error && <p className="error" style={{ marginRight: "auto" }}>{error}</p>}
          <button type="button" className="btn btn-danger" disabled={isSubmitting} onClick={() => setShowRejectForm(true)}>
            Từ chối
          </button>
          <button type="button" className="btn btn-success" disabled={isSubmitting} onClick={handleApprove}>
            {isSubmitting ? "Đang xử lý..." : "Phê duyệt"}
          </button>
        </>
      }
    />
  );
}
