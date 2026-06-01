import { apiClient } from "./client";

export async function createReview(payload) {
  const { data } = await apiClient.post("/api/reviews", payload);
  return data;
}

export async function createReviewMaterial(reviewId, payload) {
  const { data } = await apiClient.post(`/api/reviews/${reviewId}/materials`, payload);
  return data;
}

export async function voteReview(reviewId, voteType) {
  const { data } = await apiClient.post(`/api/reviews/${reviewId}/vote`, { voteType });
  return data;
}

export async function removeReviewVote(reviewId) {
  const { data } = await apiClient.delete(`/api/reviews/${reviewId}/vote`);
  return data;
}

export async function getMyReviews() {
  const { data } = await apiClient.get("/api/reviews/me");
  return data;
}

export async function getReviewById(id) {
  const { data } = await apiClient.get(`/api/reviews/${id}`);
  return data;
}

export async function publishReview(id, moderationNote = "") {
  const { data } = await apiClient.put(`/api/reviews/${id}/publish`, { moderationNote });
  return data;
}

export async function rejectReview(id, moderationNote = "") {
  const { data } = await apiClient.put(`/api/reviews/${id}/reject`, { moderationNote });
  return data;
}
