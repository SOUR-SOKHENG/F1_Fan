import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <p>Checking admin access...</p>;
  }

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/News" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
