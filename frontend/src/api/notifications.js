import { apiClient } from "./client";

export async function getNotifications(params = {}) {
  const { data } = await apiClient.get("/api/notifications", { params });
  return data;
}

export async function markNotificationRead(id) {
  const { data } = await apiClient.put(`/api/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await apiClient.put("/api/notifications/read-all");
  return data;
}
