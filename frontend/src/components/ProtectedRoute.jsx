import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../api/auth';

export default function ProtectedRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
