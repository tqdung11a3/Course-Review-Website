import { useState } from "react";
import { Link } from "react-router-dom";
import { removeReviewVote, voteReview } from "../../api/reviews";
import { useAuth } from "../../hooks/useAuth";
import {
  REVIEW_DETAIL_SECTIONS,
  formatReviewDate,
  formatReviewSemester,
  getUserInitial,
} from "../../utils/reviewDisplay";
import { ReviewEvidenceSection } from "../reviews/ReviewEvidenceSection";
import { ReviewDetailSection } from "./ReviewDetailSection";
import { ReviewMaterialCard } from "./ReviewMaterialCard";

export function ReviewCard({ review, onVoteChange }) {
  const { user, isAuthenticated } = useAuth();
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.notHelpfulCount || 0);
  const [userVote, setUserVote] = useState(review.userVote || null);
  const [voteError, setVoteError] = useState("");
  const [isVoting, setIsVoting] = useState(false);

  const userName = review.userId?.fullName || "Ẩn danh";
  const details = review.details || {};
  const ratings = review.ratings || {};
  const authorId = review.userId?._id || review.userId;
  const isOwnReview =
    isAuthenticated && authorId && String(authorId) === String(user?._id);

  async function handleVote(voteType) {
    if (!isAuthenticated) {
      setVoteError("Vui lòng đăng nhập để đánh giá review");
      return;
    }
    if (isOwnReview) {
      setVoteError("Bạn không thể đánh giá review của chính mình");
      return;
    }

    setIsVoting(true);
    setVoteError("");
    try {
      const res =
        userVote === voteType
          ? await removeReviewVote(review._id)
          : await voteReview(review._id, voteType);

      const updated = res?.data?.review;
      const nextVote = res?.data?.userVote ?? null;
      if (updated) {
        setHelpfulCount(updated.helpfulCount ?? 0);
        setNotHelpfulCount(updated.notHelpfulCount ?? 0);
      }
      setUserVote(nextVote);
      onVoteChange?.(review._id, {
        helpfulCount: updated?.helpfulCount,
        notHelpfulCount: updated?.notHelpfulCount,
        userVote: nextVote,
      });
    } catch (err) {
      setVoteError(err?.response?.data?.message || "Không thể ghi nhận đánh giá");
    } finally {
      setIsVoting(false);
    }
  }

  const hasDetailContent = REVIEW_DETAIL_SECTIONS.some((s) => details[s.key]?.trim());
  const hasEvidence =
    (review.evidenceFiles?.length || 0) > 0 || Boolean(review.grade?.trim());

  return (
    <article className="review-card">
      <div className="review-card-header">
        <div className="review-author">
          <span className="review-avatar">{getUserInitial(review.userId)}</span>
          <div>
            <div className="review-author-name">
              <strong>{userName}</strong>
              {review.enrollmentProofId && (
                <span className="review-verified" title="Đã xác minh">
                  ✓
                </span>
              )}
              {review.grade && <span className="review-grade-badge">{review.grade}</span>}
            </div>
            <p className="review-author-meta">
              {review.lecturerName && `${review.lecturerName} • `}
              {formatReviewSemester(review.semester, review.academicYear)}
            </p>
          </div>
        </div>
        <div className="review-overall-rating">
          <span className="star">★</span>
          {Number(ratings.overall || 0).toFixed(1)}
        </div>
      </div>

      <div className="review-ratings-panel">
        <h4 className="review-subsection-title">Đánh giá chung</h4>
        <div className="review-metrics review-metrics--grid">
          <span>Độ khó: {ratings.difficulty}/5</span>
          <span>Khối lượng: {ratings.workload}/5</span>
          <span>Giảng dạy: {ratings.teachingQuality}/5</span>
          <span>Hữu ích: {ratings.usefulness}/5</span>
          <span>Chấm điểm: {ratings.gradingFairness}/5</span>
          <span>Điểm danh: {review.hasMandatoryAttendance ? "Có" : "Không"}</span>
        </div>
      </div>

      {hasDetailContent && (
        <div className="review-details-panel">
          <h4 className="review-subsection-title">Chi tiết review</h4>
          {REVIEW_DETAIL_SECTIONS.map((section) => (
            <ReviewDetailSection
              key={section.key}
              icon={section.icon}
              title={section.label}
              content={details[section.key]}
            />
          ))}
        </div>
      )}

      {review.wouldTakeAgain && (
        <p className="review-recommend">
          <span className="review-recommend-icon">✓</span>
          Sẽ học lại môn này nếu có cơ hội
        </p>
      )}

      {hasEvidence && <ReviewEvidenceSection review={review} />}

      {review.materials?.length > 0 && (
        <div className="review-materials">
          <h4 className="review-subsection-title">Tài liệu học tập ({review.materials.length})</h4>
          {review.materials.map((material) => (
            <ReviewMaterialCard key={material._id} material={material} />
          ))}
        </div>
      )}

      <div className="review-card-footer">
        <div className="review-votes">
          <button
            type="button"
            className={`review-vote-btn ${userVote === "helpful" ? "review-vote-btn--active" : ""}`}
            disabled={isVoting || isOwnReview}
            onClick={() => handleVote("helpful")}
          >
            👍 Hữu ích ({helpfulCount})
          </button>
          <button
            type="button"
            className={`review-vote-btn ${
              userVote === "not_helpful" ? "review-vote-btn--active-not" : ""
            }`}
            disabled={isVoting || isOwnReview}
            onClick={() => handleVote("not_helpful")}
          >
            👎 Không hữu ích ({notHelpfulCount})
          </button>
          {!isAuthenticated && (
            <Link to="/login" className="review-vote-login">
              Đăng nhập để đánh giá
            </Link>
          )}
        </div>
        <time className="review-date">{formatReviewDate(review.createdAt)}</time>
      </div>
      {voteError && <p className="auth-field-error">{voteError}</p>}
    </article>
  );
}
