import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';
import PageLoader from 'components/loader/PageLoader';

const MainLayout = lazy(() => import('layouts/main-layout'));
const AuthLayout = lazy(() => import('layouts/auth-layout'));
const PortalRouteLayout = lazy(() => import('layouts/portal-route-layout'));
const ProtectedRoute = lazy(async () => {
  const mod = await import('./security');
  return { default: mod.default };
});
const ErrorPage = lazy(() => import('components/common/ErrorPage'));

const App = lazy(() => import('App'));
const Dashboard = lazy(() => import('pages/dashboard'));
const Signin = lazy(() => import('pages/authentication/Signin'));
const BirthwaveDashboardPage = lazy(() => import('pages/birthwave/dashboard'));
const BirthwaveLeadsPage = lazy(() => import('pages/birthwave/leads'));
const BirthwaveLeadDetailPage = lazy(() => import('pages/birthwave/lead-detail'));
const BirthwaveAppointmentsPage = lazy(() => import('pages/birthwave/appointments'));
const BirthwaveDoctorsPage = lazy(() => import('pages/birthwave/doctors'));
const BirthwaveCampaignSourcesPage = lazy(() => import('pages/birthwave/campaign-sources'));
const BirthwaveFollowUpsPage = lazy(() => import('pages/birthwave/follow-ups'));
const BirthwaveReportsPage = lazy(() => import('pages/birthwave/reports'));
const BirthwaveSettingsPage = lazy(() => import('pages/birthwave/settings'));
const BirthwaveCallsPage = lazy(() => import('pages/birthwave/calls'));
const UserManagement = lazy(() => import('pages/management'));
const ClientManagement = lazy(() => import('pages/client'));
const ApiLogsPage = lazy(() => import('pages/api-logs'));
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
const VlsLawPracticePage = lazy(() => import('pages/vls/vls-law-practice'));
const VlsConsumerProtectionLawMasterClassPage = lazy(
  () => import('pages/vls/consumer-protection-law-master-class'),
);
const VlsTaxationLawPage = lazy(() => import('pages/vls/taxation-law'));
const GeneralEnquiriesPage = lazy(() => import('pages/enquiries/GeneralEnquiriesPage'));
const CareersApplicationsPage = lazy(() => import('pages/enquiries/CareersApplicationsPage'));

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
              path: paths.vlsLawPractice,
              element: <VlsLawPracticePage />,
            },
            {
              path: paths.vlsConsumerProtectionLawMasterClass,
              element: <VlsConsumerProtectionLawMasterClassPage />,
            },
            {
              path: paths.vlsTaxationLaw,
              element: <VlsTaxationLawPage />,
            },
            {
              path: paths.enquiries,
              element: <GeneralEnquiriesPage />,
            },
            {
              path: paths.generalEnquiries,
              element: <GeneralEnquiriesPage />,
            },
            {
              path: paths.careersApplications,
              element: <CareersApplicationsPage />,
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
              path: paths.apiLogs,
              element: <ApiLogsPage />,
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
          // Client-portal route tree. `PortalRouteLayout` picks the shell by role:
          // client users get the standalone portal layout, everyone else keeps
          // the full admin MainLayout.
          path: `/${rootPaths.pageRoot}/d/:clientKey/portal`,
          element: (
            <Suspense fallback={<PageLoader />}>
              <PortalRouteLayout>
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute>
                    <Outlet />
                  </ProtectedRoute>
                </Suspense>
              </PortalRouteLayout>
            </Suspense>
          ),
          children: [
            { path: 'dashboard', element: <BirthwaveDashboardPage /> },
            { path: 'leads', element: <BirthwaveLeadsPage /> },
            { path: 'leads/:leadId', element: <BirthwaveLeadDetailPage /> },
            { path: 'appointments', element: <BirthwaveAppointmentsPage /> },
            { path: 'calls', element: <BirthwaveCallsPage /> },
            { path: 'doctors', element: <BirthwaveDoctorsPage /> },
            { path: 'campaign-sources', element: <BirthwaveCampaignSourcesPage /> },
            { path: 'follow-ups', element: <BirthwaveFollowUpsPage /> },
            { path: 'reports', element: <BirthwaveReportsPage /> },
            { path: 'settings', element: <BirthwaveSettingsPage /> },
          ],
        },
        {
          path: rootPaths.authRoot,
          element: (
            <Suspense fallback={<PageLoader />}>
              <AuthLayout>
                <Suspense fallback={null}>
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




