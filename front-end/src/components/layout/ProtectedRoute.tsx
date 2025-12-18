import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("accessToken");

  // agar login nahi hai
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // agar login hai
  return <>{children}</>;
};

export default ProtectedRoute;
