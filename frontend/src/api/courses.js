import { apiClient } from "./client";

export async function getCourses(params = {}) {
  const { data } = await apiClient.get("/api/courses", { params });
  return data;
}

export async function getCourseById(id) {
  const { data } = await apiClient.get(`/api/courses/${id}`);
  return data;
}

export async function createCourse(payload) {
  const { data } = await apiClient.post("/api/courses", payload);
  return data;
}

export async function getCourseStats(id) {
  const { data } = await apiClient.get(`/api/courses/${id}/stats`);
  return data;
}

export async function getCourseReviews(id, params = {}) {
  const { data } = await apiClient.get(`/api/courses/${id}/reviews`, { params });
  return data;
}
