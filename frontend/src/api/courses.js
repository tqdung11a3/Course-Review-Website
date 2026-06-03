import { apiClient } from "./client";
import { withApiRetry } from "../utils/apiRetry";

export async function getCourses(params = {}, retryOptions) {
  return withApiRetry(async () => {
    const { data } = await apiClient.get("/api/courses", { params });
    return data;
  }, retryOptions);
}

export async function getCourseById(id, retryOptions) {
  return withApiRetry(async () => {
    const { data } = await apiClient.get(`/api/courses/${id}`);
    return data;
  }, retryOptions);
}

export async function createCourse(payload) {
  const { data } = await apiClient.post("/api/courses", payload);
  return data;
}

export async function getCourseStats(id, retryOptions) {
  return withApiRetry(async () => {
    const { data } = await apiClient.get(`/api/courses/${id}/stats`);
    return data;
  }, retryOptions);
}

export async function getCourseReviews(id, params = {}, retryOptions) {
  return withApiRetry(async () => {
    const { data } = await apiClient.get(`/api/courses/${id}/reviews`, { params });
    return data;
  }, retryOptions);
}
