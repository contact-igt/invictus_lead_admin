/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';
import PageLoader from 'components/loader/PageLoader';

// CRITICAL: Lazy-load all MUI/Emotion-using components to prevent initialization issues
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
        // Root dashboard route
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

        // All protected page routes — consolidated into one group
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
              path: paths.dynamicTable,
              element: <DynamicPage />,
            },
            {
              path: paths.pixelEyeLeads,
              element: <PixelEyePage />,
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
        // Auth routes
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
