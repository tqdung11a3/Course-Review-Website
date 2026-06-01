import { apiClient } from "./client";

export async function getModerationStats() {
  const { data } = await apiClient.get("/api/admin/stats");
  return data;
}

export async function getPendingReviews(params = {}) {
  const { data } = await apiClient.get("/api/admin/reviews/pending", { params });
  return data;
}

export async function getReviewForModeration(id) {
  const { data } = await apiClient.get(`/api/admin/reviews/${id}`);
  return data;
}

export async function getPendingReports(params = {}) {
  const { data } = await apiClient.get("/api/reports", { params: { status: "pending", ...params } });
  return data;
}
