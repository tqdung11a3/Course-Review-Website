import { apiClient } from "./client";

export async function uploadFiles(files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const { data } = await apiClient.post("/api/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
