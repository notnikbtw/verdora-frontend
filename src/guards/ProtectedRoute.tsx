import type { Roles } from '@/types/user';
import { Spinner } from '@components/ui/spinner';
import { useAppSelector } from '@api/hooks';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import React from 'react';

type Props = {
  allowedRoles?: Roles[];
  redirectTo?: string;
  requireAuth?: boolean;
  children?: React.ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({
  allowedRoles = [],
  redirectTo = '/login',
  requireAuth = true,
  children,
}) => {
  const location = useLocation();
  const { user, hydrating, loading } = useAppSelector(state => state.auth);

  if (hydrating || (requireAuth && (loading.login || loading.register))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (!requireAuth) {
    if (user) {
      const from = (location.state as { from?: { pathname?: string } } | null)
        ?.from?.pathname;
      return <Navigate to={from || '/'} replace />;
    }
    return children ? <>{children}</> : <Outlet />;
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    if (!user.role || !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
