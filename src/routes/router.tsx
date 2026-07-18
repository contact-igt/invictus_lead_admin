import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';
import PageLoader from 'components/loader/PageLoader';

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
const PixelEyeWebsiteLeadsPage = lazy(() => import('pages/pixel-eye/website-leads'));
const NotificationTrackerPage = lazy(() => import('pages/notifications/NotificationTracker'));
const NotificationDetailsPage = lazy(() => import('pages/notifications/NotificationDetails'));
const SettingsPage = lazy(() => import('pages/settings'));
const AaravEyeCarePage = lazy(() => import('pages/aaravEyeCare'));
const AntardrashtiNetralayaPage = lazy(() => import('pages/antardrashtiNetralaya'));
const RioPage = lazy(() => import('pages/rio'));
const ShantiEyeTechPage = lazy(() => import('pages/shantiEyeTech'));
const PhoenixFitnessPage = lazy(() => import('pages/phoenixFitness'));
const VlsMactMasterClassPage = lazy(() => import('pages/vls/mact-master-class'));

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
              path: paths.pixelEyeScopedFollowUps,
              element: <PixelEyeFollowUpsPage />,
            },
            {
              path: paths.pixelEyeScopedLeadDetail,
              element: <PixelEyeLeadDetailPage />,
            },
            {
              path: paths.pixelEyeScopedWebsiteLeads,
              element: <PixelEyeWebsiteLeadsPage />,
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
              path: paths.aaravEyeCare(':clientKey'),
              element: <AaravEyeCarePage />,
            },
            {
              path: paths.antardrashtiNetralaya(':clientKey'),
              element: <AntardrashtiNetralayaPage />,
            },
            {
              path: paths.rio(':clientKey'),
              element: <RioPage />,
            },
            {
              path: paths.shantiEyeTech(':clientKey'),
              element: <ShantiEyeTechPage />,
            },
            {
              path: paths.phoenixFitness(':clientKey'),
              element: <PhoenixFitnessPage />,
            },
            {
              path: paths.vlsMactMasterClass,
              element: <VlsMactMasterClassPage />,
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
          path: paths.pixelEyeFollowUps,
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




