import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'entreprise')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion en sauvegardant l'URL actuelle
    // return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // if (allowedRoles && user && !allowedRoles.includes(user.role)) {
  //   // Rediriger vers la page d'accueil si l'utilisateur n'a pas le rôle requis
  //   return <Navigate to="/" replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute; 