import { createContext, useEffect, useMemo, useState } from "react";
import { clearToken, getMe, login, register, saveToken } from "../api/auth";
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

  async function authAndFetch(authFn, payload) {
    const response = await authFn(payload);
    const token = response?.data?.token;
    if (token) saveToken(token);
    const meResponse = await getMe();
    setUser(meResponse?.data?.user || null);
    return response;
  }

  async function loginAndFetch(payload) {
    return authAndFetch(login, payload);
  }

  async function registerAndFetch(payload) {
    return authAndFetch(register, payload);
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
      register: registerAndFetch,
      logout,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
