import { apiClient } from "./client";

export async function getCourses(params = {}) {
  const { data } = await apiClient.get("/api/courses", { params });
  return data;
}

export async function getCourseById(id) {
  const { data } = await apiClient.get(`/api/courses/${id}`);
  return data;
}
