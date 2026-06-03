import { apiClient, TOKEN_KEY } from "./client";
import { withApiRetry } from "../utils/apiRetry";

export async function login(payload) {
  const { data } = await apiClient.post("/api/auth/login", payload);
  return data;
}

export async function register(payload) {
  const { data } = await apiClient.post("/api/auth/register", payload);
  return data;
}

export async function getMe() {
  return withApiRetry(async () => {
    const { data } = await apiClient.get("/api/auth/me");
    return data;
  });
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
