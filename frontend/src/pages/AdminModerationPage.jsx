import { useCallback, useEffect, useState } from "react";
import {
  getModerationStats,
  getPendingReports,
  getPendingReviews,
} from "../api/admin";
import { publishReview, rejectReview } from "../api/reviews";
import { AdminReviewModal } from "../components/admin/AdminReviewModal";
import { DashboardHeader } from "../components/layout/DashboardHeader";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ variant, value, label }) {
  return (
    <div className={`mod-stat-card mod-stat-card--${variant}`}>
      <span className="mod-stat-value">{value}</span>
      <span className="mod-stat-label">{label}</span>
    </div>
  );
}

function PendingReviewItem({ item, onView, onApprove, onReject, isProcessing }) {
  return (
    <article className="mod-review-item">
      <div className="mod-review-item-top">
        <div>
          <h3>
            {item.courseCode} - {item.courseName}
          </h3>
          <p className="muted">
            Người viết: {item.authorName} • {formatDateTime(item.createdAt)}
          </p>
        </div>
        <span
          className={`mod-evidence-badge ${
            item.hasEvidence ? "mod-evidence-badge--yes" : "mod-evidence-badge--no"
          }`}
        >
          {item.hasEvidence ? "✓ Có minh chứng" : "⚠ Chưa có minh chứng"}
        </span>
      </div>
      {item.evidenceFiles?.length > 0 && (
        <div className="mod-evidence-preview">
          {item.evidenceFiles.map((f) => (
            <a
              key={f.fileUrl}
              href={f.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mod-evidence-link"
            >
              📄 {f.fileName || "Bảng điểm"}
            </a>
          ))}
        </div>
      )}
      <div className="mod-review-actions">
        <button type="button" className="btn btn-outline" onClick={() => onView(item._id)}>
          👁 Xem chi tiết
        </button>
        <button
          type="button"
          className="btn btn-success"
          disabled={isProcessing}
          onClick={() => onApprove(item._id)}
        >
          ✓ Phê duyệt
        </button>
        <button
          type="button"
          className="btn btn-danger"
          disabled={isProcessing}
          onClick={() => onReject(item._id)}
        >
          ✕ Từ chối
        </button>
      </div>
    </article>
  );
}

export default function AdminModerationPage() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("pending");
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [quickRejectId, setQuickRejectId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, reviewsRes, reportsRes] = await Promise.all([
        getModerationStats(),
        getPendingReviews({ page: 1, limit: 50 }),
        getPendingReports({ page: 1, limit: 50 }),
      ]);
      setStats(statsRes?.data || null);
      setPendingReviews(reviewsRes?.data?.items || []);
      setReports(reportsRes?.data?.items || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleQuickApprove(id) {
    setProcessingId(id);
    try {
      await publishReview(id);
      await loadData();
    } finally {
      setProcessingId("");
    }
  }

  async function confirmQuickReject() {
    if (!quickRejectId) return;
    setProcessingId(quickRejectId);
    try {
      await rejectReview(quickRejectId, rejectNote.trim() || "Review không đáp ứng tiêu chí.");
      setQuickRejectId(null);
      setRejectNote("");
      await loadData();
    } finally {
      setProcessingId("");
    }
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <div className="dashboard-content">
        <h1 className="admin-page-title">Quản trị viên</h1>

        <div className="mod-stats-row">
          <StatCard
            variant="pending"
            value={stats?.pendingReviews ?? 0}
            label="Chờ duyệt"
          />
          <StatCard
            variant="reports"
            value={stats?.pendingReports ?? 0}
            label="Báo cáo vi phạm"
          />
          <StatCard
            variant="approved"
            value={stats?.publishedReviews ?? 0}
            label="Đã duyệt"
          />
          <StatCard
            variant="rejected"
            value={stats?.rejectedReviews ?? 0}
            label="Đã từ chối"
          />
        </div>

        <div className="mod-tabs">
          <button
            type="button"
            className={`mod-tab ${tab === "pending" ? "mod-tab--active" : ""}`}
            onClick={() => setTab("pending")}
          >
            Chờ duyệt ({pendingReviews.length})
          </button>
          <button
            type="button"
            className={`mod-tab ${tab === "reports" ? "mod-tab--active" : ""}`}
            onClick={() => setTab("reports")}
          >
            Báo cáo vi phạm ({reports.length})
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Đang tải..." />
        ) : tab === "pending" ? (
          pendingReviews.length === 0 ? (
            <p className="muted courses-empty">Không có review nào chờ duyệt.</p>
          ) : (
            <div className="mod-review-list">
              {pendingReviews.map((item) => (
                <PendingReviewItem
                  key={item._id}
                  item={item}
                  isProcessing={processingId === item._id}
                  onView={setSelectedReviewId}
                  onApprove={handleQuickApprove}
                  onReject={setQuickRejectId}
                />
              ))}
            </div>
          )
        ) : reports.length === 0 ? (
          <p className="muted courses-empty">Không có báo cáo vi phạm nào.</p>
        ) : (
          <div className="mod-review-list">
            {reports.map((report) => (
              <article key={report._id} className="mod-review-item">
                <h3>Báo cáo: {report.reason}</h3>
                <p className="muted">{report.description || "Không có mô tả thêm"}</p>
                <p className="muted">
                  Người báo cáo: {report.userId?.fullName} • {formatDateTime(report.createdAt)}
                </p>
                {report.reviewId?._id && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setSelectedReviewId(report.reviewId._id)}
                  >
                    👁 Xem review liên quan
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedReviewId && (
        <AdminReviewModal
          reviewId={selectedReviewId}
          onClose={() => setSelectedReviewId(null)}
          onActionDone={loadData}
        />
      )}

      {quickRejectId && (
        <div className="modal-overlay" onClick={() => setQuickRejectId(null)}>
          <div className="modal-panel modal-panel--small" onClick={(e) => e.stopPropagation()}>
            <h3>Từ chối review</h3>
            <textarea
              className="form-control form-textarea"
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Lý do từ chối (gửi thông báo cho sinh viên)..."
            />
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setQuickRejectId(null)}>
                Hủy
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmQuickReject}>
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
