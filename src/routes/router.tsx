/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';
import PageLoader from 'components/loader/PageLoader';

// Lazy-load MUI/Emotion-heavy modules to avoid initialization issues.
const MainLayout = lazy(() => import('layouts/main-layout'));
const AuthLayout = lazy(() => import('layouts/auth-layout'));
const ProtectedRoute = lazy(async () => {
  const mod = await import('./security');
  return { default: mod.default };
});
const ErrorPage = lazy(() => import('components/common/ErrorPage'));

const App = lazy(() => import('App'));
const Dashboard = lazy(() => import('pages/dashboard'));
const Signin = lazy(() => import('pages/authentication/Signin'));
const UserManagement = lazy(() => import('pages/management'));
const ClientManagement = lazy(() => import('pages/client'));
const DynamicPage = lazy(() => import('pages/dynamic'));
const PixelEyePage = lazy(() => import('pages/pixel-eye'));
const PixelEyeLeadDetailPage = lazy(() => import('pages/pixel-eye/lead-detail'));
const PixelEyeFollowUpsPage = lazy(() => import('pages/pixel-eye/follow-ups'));
const NotificationTrackerPage = lazy(() => import('pages/notifications/NotificationTracker'));
const NotificationDetailsPage = lazy(() => import('pages/notifications/NotificationDetails'));
const SettingsPage = lazy(() => import('pages/settings'));

const router = createBrowserRouter(
  [
    {
      element: (
        <Suspense fallback={<PageLoader />}>
          <App />
        </Suspense>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/',
          element: (
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <ProtectedRoute>
                  <Outlet />
                </ProtectedRoute>
              </Suspense>
            </MainLayout>
          ),
          children: [
            {
              index: true,
              element: <Dashboard />,
            },
          ],
        },
        {
          path: rootPaths.pageRoot,
          element: (
            <Suspense fallback={<PageLoader />}>
              <MainLayout>
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute>
                    <Outlet />
                  </ProtectedRoute>
                </Suspense>
              </MainLayout>
            </Suspense>
          ),
          children: [
            {
              path: paths.pixelEyeLeads,
              element: <PixelEyePage />,
            },
            {
              path: paths.notificationTracker,
              element: <NotificationTrackerPage />,
            },
            {
              path: paths.notificationDetails,
              element: <NotificationDetailsPage />,
            },
            {
              path: paths.dynamicTable,
              element: <DynamicPage />,
            },
            {
              path: paths.management,
              element: <UserManagement />,
            },
            {
              path: paths.clients,
              element: <ClientManagement />,
            },
            {
              path: paths.settings,
              element: <SettingsPage />,
            },
          ],
        },
        {
          path: 'pixel-eye/follow-ups',
          element: (
            <Suspense fallback={<PageLoader />}>
              <MainLayout>
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute>
                    <PixelEyeFollowUpsPage />
                  </ProtectedRoute>
                </Suspense>
              </MainLayout>
            </Suspense>
          ),
        },
        {
          path: paths.pixelEyeLeadDetail,
          element: (
            <Suspense fallback={<PageLoader />}>
              <MainLayout>
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute>
                    <PixelEyeLeadDetailPage />
                  </ProtectedRoute>
                </Suspense>
              </MainLayout>
            </Suspense>
          ),
        },
        {
          path: rootPaths.authRoot,
          element: (
            <Suspense fallback={<PageLoader />}>
              <AuthLayout>
                <Suspense fallback={<PageLoader />}>
                  <Outlet />
                </Suspense>
              </AuthLayout>
            </Suspense>
          ),
          children: [
            {
              path: paths.signin,
              element: <Signin />,
            },
          ],
        },
      ],
    },
  ],
  {
    basename: '/',
  },
);

export default router;
