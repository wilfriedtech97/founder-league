import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';

const roleHomePaths = {
  user: '/founders-score',
  founder: '/founder-dashboard',
  investor: '/investor-dashboard',
  admin: '/admin',
};

export default function RoleGuard({ allowedRoles, children }) {
  const userRole = useUserRole();

  if (userRole === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={roleHomePaths[userRole] || '/founders-score'} replace />;
  }

  return children;
}