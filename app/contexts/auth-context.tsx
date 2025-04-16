import type { ReactNode } from "react";
import pkg from "react";
const { createContext, useContext, useState, useEffect } = pkg;

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
      try {
        const response = await fetch(
          "http://localhost:8000/api/users/check-auth",
          {
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.isAuthenticated);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/users/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsLoggedIn(false);
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
