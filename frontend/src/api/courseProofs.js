import { apiClient } from "./client";

export async function createCourseProof(payload) {
  const { data } = await apiClient.post("/api/course-proofs", payload);
  return data;
}
