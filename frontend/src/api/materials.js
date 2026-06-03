import { apiClient } from "./client";

export async function updateLearningMaterial(id, payload) {
  const { data } = await apiClient.put(`/api/materials/${id}`, payload);
  return data;
}

export async function deleteLearningMaterial(id) {
  const { data } = await apiClient.delete(`/api/materials/${id}`);
  return data;
}
