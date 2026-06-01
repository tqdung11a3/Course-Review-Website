import { useState } from "react";
import {
  formatMaterialRating,
  getMaterialTypeLabel,
  getRecommendationLabel,
  getSourceLabel,
  getSuitableForLabel,
  getUsagePurposeLabel,
  isHighlyRecommended,
} from "../../utils/reviewDisplay";

export function ReviewMaterialCard({ material }) {
  const [open, setOpen] = useState(false);
  const ratings = material.ratings || {};

  const ratingItems = [
    { label: "Hữu ích", value: ratings.usefulness },
    { label: "Dễ hiểu", value: ratings.readability },
    { label: "Bám sát môn", value: ratings.courseRelevance },
    { label: "Cần thiết", value: ratings.necessity },
  ].filter((r) => r.value != null);

  const hasExtra =
    material.contentSummary ||
    material.strengths ||
    material.limitations ||
    material.effectiveUsageGuide ||
    material.usagePurposes?.length ||
    material.suitableFor?.length ||
    ratingItems.length ||
    material.versionOrYear ||
    material.linkUrl ||
    material.attachmentFiles?.length;

  return (
    <div className="review-material-item">
      <button type="button" className="review-material-head" onClick={() => setOpen((v) => !v)}>
        <span>
          {material.title}
          {isHighlyRecommended(material.recommendationLevel) && (
            <span className="material-badge">★ Khuyên dùng</span>
          )}
          {!isHighlyRecommended(material.recommendationLevel) && material.recommendationLevel && (
            <span className="material-badge material-badge--muted">
              {getRecommendationLabel(material.recommendationLevel)}
            </span>
          )}
        </span>
        <span className="review-material-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="review-material-body">
          <div className="review-material-tags">
            <span className="tag-blue">{getMaterialTypeLabel(material.materialType)}</span>
            {material.source && (
              <span className="tag-green">{getSourceLabel(material.source)}</span>
            )}
            {material.authorOrPublisher && (
              <span className="tag-purple">{material.authorOrPublisher}</span>
            )}
            {material.versionOrYear && (
              <span className="tag-gray">{material.versionOrYear}</span>
            )}
          </div>

          {ratingItems.length > 0 && (
            <div className="review-material-ratings">
              {ratingItems.map((r) => (
                <span key={r.label}>
                  {r.label}: {formatMaterialRating(r.value)}
                </span>
              ))}
            </div>
          )}

          {material.usagePurposes?.length > 0 && (
            <div className="review-material-meta-row">
              <strong>Phù hợp để:</strong>
              {material.usagePurposes.map((p) => (
                <span key={p} className="mini-tag">
                  {getUsagePurposeLabel(p)}
                </span>
              ))}
            </div>
          )}

          {material.suitableFor?.length > 0 && (
            <div className="review-material-meta-row">
              <strong>Phù hợp với:</strong>
              {material.suitableFor.map((p) => (
                <span key={p} className="mini-tag">
                  {getSuitableForLabel(p)}
                </span>
              ))}
            </div>
          )}

          {material.contentSummary && (
            <p className="review-material-text">
              <strong>Nội dung:</strong> {material.contentSummary}
            </p>
          )}
          {material.strengths && (
            <p className="review-material-text">
              <strong>Điểm mạnh:</strong> {material.strengths}
            </p>
          )}
          {material.limitations && (
            <p className="review-material-text">
              <strong>Hạn chế / Lưu ý:</strong> {material.limitations}
            </p>
          )}
          {material.effectiveUsageGuide && (
            <p className="review-material-text">
              <strong>Cách dùng hiệu quả:</strong> {material.effectiveUsageGuide}
            </p>
          )}

          {material.linkUrl && (
            <a href={material.linkUrl} target="_blank" rel="noreferrer" className="review-material-link">
              {material.linkUrl}
            </a>
          )}

          {material.attachmentFiles?.length > 0 && (
            <ul className="review-material-files">
              {material.attachmentFiles.map((f, i) => (
                <li key={i}>
                  <a href={f.fileUrl} target="_blank" rel="noreferrer">
                    {f.fileName || "Tải file"}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {!hasExtra && (
            <p className="muted review-material-text">Chưa có mô tả chi tiết.</p>
          )}
        </div>
      )}
    </div>
  );
}
