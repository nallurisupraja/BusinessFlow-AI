import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, loginUser, logoutUser } from "./api";
import type { AuthUser } from "./types";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  sessionMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  expireSession: (message: string) => void;
  clearSessionMessage: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// Holds the logged-in user for the whole app. Checks /auth/me once on load.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((current) => {
        if (!active) return;
        setUser(current);
        setStatus(current ? "authenticated" : "anonymous");
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus("anonymous");
      });
    return () => {
      active = false;
    };
  }, []);

  async function login(email: string, password: string) {
    const current = await loginUser(email, password);
    setUser(current);
    setStatus("authenticated");
    setSessionMessage(null);
  }

  async function logout() {
    await logoutUser();
    setUser(null);
    setStatus("anonymous");
    setSessionMessage(null);
  }

  function expireSession(message: string) {
    setUser(null);
    setStatus("anonymous");
    setSessionMessage(message);
  }

  function clearSessionMessage() {
    setSessionMessage(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, status, sessionMessage, login, logout, expireSession, clearSessionMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}