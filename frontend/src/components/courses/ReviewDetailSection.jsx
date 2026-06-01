import { useState } from "react";

const PREVIEW_LEN = 200;

export function ReviewDetailSection({ icon, title, content }) {
  const [expanded, setExpanded] = useState(false);
  const text = String(content || "").trim();
  if (!text) return null;

  const needsTruncate = text.length > PREVIEW_LEN;
  const displayText =
    needsTruncate && !expanded ? `${text.slice(0, PREVIEW_LEN)}...` : text;

  return (
    <div className="review-content-block">
      <h4>
        {icon && <span aria-hidden="true">{icon}</span>} {title}
      </h4>
      <div className="review-content-box">
        <p>{displayText}</p>
        {needsTruncate && (
          <button
            type="button"
            className="review-see-more"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Thu gọn" : "Xem đầy đủ"}
          </button>
        )}
      </div>
    </div>
  );
}
