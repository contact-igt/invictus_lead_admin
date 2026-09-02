import { PropsWithChildren } from 'react';
import { useAuth } from 'redux/selectors/auth/authSelector';
import MainLayout from 'layouts/main-layout';
import ClientPortalLayout from 'layouts/client-portal-layout';

/**
 * The Birthwave (client-portal) route family renders inside one of two shells:
 *
 *  - a real **client** user gets the dedicated standalone portal layout
 *    (`ClientPortalLayout`) — its own sidebar, nothing else.
 *  - **super-admin / admin / internal** users keep the full admin experience
 *    (`MainLayout`) — the all-clients sidebar + the standard header — with the
 *    portal page rendered in the content area, exactly like every other module.
 */
const PortalRouteLayout = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const isClientUser = (user?.role || '').toLowerCase() === 'client';

  return isClientUser ? (
    <ClientPortalLayout>{children}</ClientPortalLayout>
  ) : (
    <MainLayout>{children}</MainLayout>
  );
};

export default PortalRouteLayout;
