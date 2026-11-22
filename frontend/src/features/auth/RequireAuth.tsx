import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "./AuthContext";

interface RequireAuthProps {
  children: ReactNode;
}

// Shows its children only when a user is logged in; otherwise sends them to /login.
export default function RequireAuth({ children }: RequireAuthProps) {
  const { status } = useAuth();

  if (status === "loading") {
    return <p>Checking your session...</p>;
  }

  if (status === "anonymous") {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
