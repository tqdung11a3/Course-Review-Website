import { createContext, useEffect, useMemo, useState } from "react";
import {
  clearToken,
  getMe,
  login,
  register,
  verifyEmail,
  resendOtp as apiResendOtp,
  saveToken,
} from "../api/auth";
import { TOKEN_KEY } from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await getMe();
        setUser(response?.data?.user || null);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, []);

  // Đăng nhập bình thường
  async function loginAndFetch(payload) {
    const response = await login(payload);
    const token = response?.data?.token;
    if (token) saveToken(token);
    const meResponse = await getMe();
    setUser(meResponse?.data?.user || null);
    return response;
  }

  // Đăng ký: chỉ gửi request, KHÔNG tự đăng nhập (cần verify OTP trước)
  async function registerOnly(payload) {
    const response = await register(payload);
    return response;
  }

  // Xác thực OTP → đăng nhập
  async function verifyAndLogin(payload) {
    const response = await verifyEmail(payload);
    const token = response?.data?.token;
    if (token) saveToken(token);
    const meResponse = await getMe();
    setUser(meResponse?.data?.user || null);
    return response;
  }

  async function handleResendOtp(payload) {
    return await apiResendOtp(payload);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login: loginAndFetch,
      register: registerOnly,
      verifyEmail: verifyAndLogin,
      resendOtp: handleResendOtp,
      logout,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
