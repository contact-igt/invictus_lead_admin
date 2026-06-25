import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'redux/selectors/auth/authSelector';
import paths from './paths';
import sitemap from './sitemap';
import { normalizeClientKey } from 'utils/clientKey';
import { resolveClientModuleKey } from 'utils/clientModuleResolver';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const { token, user } = useAuth();
  const userModuleKey = resolveClientModuleKey(user?.clientKey);
  const clientHomePath = userModuleKey ? `/pages/d/${userModuleKey}/overview` : '/';

  if (!token) {
    return <Navigate to={`${paths.signin}`} state={{ from: location }} replace />;
  }

  // Settings is always accessible to any authenticated user
  if (location.pathname === paths.settings) {
    return children;
  }

  // Find the current route in the sitemap to determine requirements
  const currentItem = sitemap.find(
    (item) =>
      item.path === location.pathname ||
      item.items?.some((subItem) => subItem.path === location.pathname),
  );

  let requiredKey = currentItem?.clientKey || '';
  const routeId = currentItem?.id;
  const pixelEyeFollowUpsMatch = location.pathname.match(/^\/pixel-eye\/follow-ups$/);
  const pixelEyeLeadDetailMatch = location.pathname.match(/^\/pixel-eye\/leads\/[^/]+$/);
  const pixelEyeNotificationDetailMatch = location.pathname.match(
    /^\/pages\/d\/[^/]+\/notification\/[^/]+$/,
  );

  // Fallback for aliased dynamic client URLs (e.g. /pages/d/pixel_eye/overview).
  if (!requiredKey && location.pathname.startsWith('/pages/d/')) {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length >= 3) {
      requiredKey = segments[2];
    }
  }

  if (!requiredKey && pixelEyeLeadDetailMatch) {
    requiredKey = 'pixeleye';
  }

  if (!requiredKey && pixelEyeFollowUpsMatch) {
    requiredKey = 'pixeleye';
  }

  if (!requiredKey && pixelEyeNotificationDetailMatch) {
    requiredKey = 'pixeleye';
  }

  // 1. Super-admin bypass.
  if (user?.role === 'super-admin') {
    return children;
  }

  // 2. Admin access: dashboard + user-management + own client module only.
  if (user?.role === 'admin') {
    if (routeId === 'client-management') {
      return <Navigate to="/" replace />;
    }

    if (!requiredKey) {
      if (routeId === 'dashboard' || routeId === 'user-management') {
        return children;
      }
      return <Navigate to="/" replace />;
    }

    if (normalizeClientKey(requiredKey) !== normalizeClientKey(userModuleKey)) {
      return <Navigate to="/" replace />;
    }

    return children;
  }

  // 3. Client Access
  if (user?.role === 'client') {
    // Dashboard and all management pages are not allowed for client users.
    if (
      routeId === 'dashboard' ||
      routeId === 'user-management' ||
      routeId === 'client-management'
    ) {
      if (location.pathname === clientHomePath) {
        return children;
      }
      return <Navigate to={clientHomePath} replace />;
    }

    // Client users can only access their own module routes.
    if (!requiredKey) {
      if (location.pathname === clientHomePath) {
        return children;
      }
      return <Navigate to={clientHomePath} replace />;
    }

    if (normalizeClientKey(requiredKey) !== normalizeClientKey(userModuleKey)) {
      if (location.pathname === clientHomePath) {
        return children;
      }
      return <Navigate to={clientHomePath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
