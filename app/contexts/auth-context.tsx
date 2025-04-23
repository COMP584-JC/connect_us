// auth-context.tsx
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 매 요청마다 Authorization 헤더에 토큰을 붙이는 헬퍼
  const fetchWithAuth = (url: string, opts: RequestInit = {}) => {
    const token = localStorage.getItem("jwt");
    return fetch(url, {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_BASE_URL}/users/check-auth`
        );
        const data = await res.json();
        console.log("check-auth:", res.status, data);
        setIsLoggedIn(res.ok && data.isAuthenticated === true);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "로그인에 실패했습니다.");
    }
    const { token } = await res.json();
    localStorage.setItem("jwt", token);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/users/logout`, {
      method: "POST",
    });
    localStorage.removeItem("jwt");
    setIsLoggedIn(false);
  };

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
