import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!user || !token) return <Navigate to="/login" replace />;

  const role = user.role?.toLowerCase();
  if (!allowedRoles.map(r => r.toLowerCase()).includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
