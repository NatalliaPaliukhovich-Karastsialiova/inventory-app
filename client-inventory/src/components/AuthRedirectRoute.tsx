import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface AuthRedirectRouteProps {
  children: React.ReactElement;
}

export function AuthRedirectRoute({ children }: AuthRedirectRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function AuthRedirectAdminRoute({ children }: AuthRedirectRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function NonAuthRedirectRoute({ children }: AuthRedirectRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
