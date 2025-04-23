// auth-context.tsx
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/check-auth`,
          {
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Accept: "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
            mode: "cors",
          }
        );

        const data = await response.json();
        console.log("check-auth response:", response.status, data);

        // 200 OK && data.isAuthenticated true → 로그인 상태
        setIsLoggedIn(response.ok && data.isAuthenticated === true);
      } catch (err) {
        console.error("Auth check failed", err);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/users/login`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );

    if (response.ok) {
      setIsLoggedIn(true);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "로그인에 실패했습니다.");
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        setIsLoggedIn(false);
      } else {
        console.error("Logout failed:", response.status);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
