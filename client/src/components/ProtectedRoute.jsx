import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role} = useAuth();

  if (!user) return <Navigate to="/sign-in" />;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/sign-in" />;
  }

  return children;
}
