import { Navigate, useLocation } from 'react-router';

interface RequireAuthProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function RequireAuth({ children, requireAdmin = false }: RequireAuthProps) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin) {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      if (!user?.admin) {
        return <Navigate to="/login" replace />;
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
