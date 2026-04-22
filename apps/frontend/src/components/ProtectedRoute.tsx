import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  role?: 'recruiter' | 'candidate';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/candidate'} replace />;
  }

  return <>{children}</>;
}