import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notifications";
import { getMyReviews } from "../api/reviews";
import { ReviewDetailModal } from "../components/reviews/ReviewDetailModal";
import { DashboardHeader } from "../components/layout/DashboardHeader";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

const STATUS_LABELS = {
  pending: { text: "Chờ duyệt", className: "status-pending" },
  published: { text: "Đã duyệt", className: "status-published" },
  rejected: { text: "Bị từ chối", className: "status-rejected" },
  hidden: { text: "Đã ẩn", className: "status-rejected" },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const location = useLocation();
  const flash = location.state?.flash;
  const [notifications, setNotifications] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    try {
      const [notifRes, reviewsRes] = await Promise.all([
        getNotifications({ page: 1, limit: 30 }),
        getMyReviews(),
      ]);
      setNotifications(notifRes?.data?.items || []);
      setMyReviews(reviewsRes?.data?.items || []);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReadNotification(id) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <div className="dashboard-content dashboard-content--form">
        <h1>Hồ sơ</h1>
        {flash && <div className="flash-banner">{flash}</div>}
        <section className="card profile-info">
          <p>
            <strong>Họ tên:</strong> {user?.fullName}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Vai trò:</strong> {user?.role === "admin" ? "Quản trị" : "Sinh viên"}
          </p>
        </section>

        {isLoading ? (
          <LoadingSpinner label="Đang tải..." />
        ) : (
          <>
            <section className="card">
              <div className="profile-section-head">
                <h2>Thông báo</h2>
                {notifications.some((n) => !n.isRead) && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleReadAll}>
                    Đánh dấu đã đọc tất cả
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="muted">Chưa có thông báo.</p>
              ) : (
                <ul className="notification-list">
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      className={`notification-item ${n.isRead ? "" : "notification-item--unread"}`}
                    >
                      <div>
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <time className="muted">
                          {new Date(n.createdAt).toLocaleString("vi-VN")}
                        </time>
                      </div>
                      {!n.isRead && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleReadNotification(n._id)}
                        >
                          Đã đọc
                        </button>
                      )}
                      {n.courseId && n.type === "review_approved" && (
                        <Link to={`/courses/${n.courseId}`} className="auth-link">
                          Xem môn học
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <h2>Review của tôi</h2>
              {myReviews.length === 0 ? (
                <p className="muted">Bạn chưa viết review nào.</p>
              ) : (
                <ul className="my-review-list">
                  {myReviews.map((r) => {
                    const st = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
                    return (
                      <li key={r._id} className="my-review-item">
                        <div>
                          <strong>
                            {r.courseCode} - {r.courseName}
                          </strong>
                          <span className={`review-status-badge ${st.className}`}>{st.text}</span>
                          {r.moderationNote && r.status === "rejected" && (
                            <p className="muted">Lý do: {r.moderationNote}</p>
                          )}
                          {r.evidenceFiles?.length > 0 && (
                            <div className="mod-evidence-preview">
                              {r.evidenceFiles.map((f) => (
                                <a
                                  key={f.fileUrl}
                                  href={f.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mod-evidence-link"
                                >
                                  📄 {f.fileName || "Minh chứng"}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="my-review-actions">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedReviewId(r._id)}
                          >
                            Xem chi tiết
                          </button>
                          {r.status === "published" && r.courseId && (
                            <Link
                              to={`/courses/${r.courseId?._id || r.courseId}`}
                              className="auth-link"
                            >
                              Xem trên trang môn
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>

      {selectedReviewId && (
        <ReviewDetailModal
          reviewId={selectedReviewId}
          onClose={() => setSelectedReviewId(null)}
        />
      )}
    </div>
  );
}
