import { apiClient, TOKEN_KEY } from "./client";

export async function login(payload) {
  const { data } = await apiClient.post("/api/auth/login", payload);
  return data;
}

export async function register(payload) {
  const { data } = await apiClient.post("/api/auth/register", payload);
  return data;
}

export async function verifyEmail(payload) {
  const { data } = await apiClient.post("/api/auth/verify-email", payload);
  return data;
}

export async function resendOtp(payload) {
  const { data } = await apiClient.post("/api/auth/resend-otp", payload);
  return data;
}

export async function getMe() {
  const { data } = await apiClient.get("/api/auth/me");
  return data;
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
