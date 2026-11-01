import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <main className="screen-loader" aria-label="Loading your session"><span className="loader-orb" /></main>;
  }

  return session ? <>{children}</> : <Navigate to="/login" replace />;
}
