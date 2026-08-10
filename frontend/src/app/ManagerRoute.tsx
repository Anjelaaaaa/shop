import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export function ManagerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, getUser } = useAuth();

  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  const user = getUser();
  if (user?.role !== "MANAGER" && user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}