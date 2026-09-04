import paths, { buildClientPortalPath } from './paths';
import { ClientRegistry, ClientConfig, TableConfig } from 'config/clients';
import { WEBSITE_SOURCE_LABELS, WEBSITE_SOURCE_ORDER } from 'pages/birthwave/constants';

export interface SubMenuItem {
  name: string;
  pathName: string;
  path: string;
  icon?: string;
  active?: boolean;
  clientKey?: string;
  items?: SubMenuItem[];
}

export interface MenuItem {
  id: string;
  subheader: string;
  path?: string;
  icon?: string;
  avatar?: string;
  active?: boolean;
  clientKey?: string;
  items?: SubMenuItem[];
}

const baseSitemap: MenuItem[] = [
  {
    id: 'dashboard',
    subheader: 'Dashboard',
    path: '/',
    icon: 'hugeicons:grid-view',
    active: true,
  },
];

const managementSitemap: MenuItem = {
  id: 'user-management',
  path: paths.management,
  subheader: 'User Management',
  icon: 'hugeicons:user-group-active',
  active: true,
};

const clientManagementSitemap: MenuItem = {
  id: 'client-management',
  path: paths.clients,
  subheader: 'Client Management',
  icon: 'hugeicons:building-03',
  active: true,
};

const apiLogsSitemap: MenuItem = {
  id: 'api-logs',
  path: paths.apiLogs,
  subheader: 'API Logs',
  icon: 'hugeicons:activity-04',
  active: true,
};

const enquiriesSitemap: MenuItem = {
  id: 'enquiries',
  subheader: 'Invictus',
  icon: 'hugeicons:file-attachment',
  active: true,
  clientKey: 'invictus',
  items: [
    {
      name: 'General Enquiries',
      pathName: paths.generalEnquiries,
      path: paths.generalEnquiries,
    },
    {
      name: 'Careers Applications',
      pathName: paths.careersApplications,
      path: paths.careersApplications,
    },
  ],
};

// Birthwave has a fully custom portal (not the generic dynamic-table experience).
const birthwaveSitemap: MenuItem = {
  id: 'birthwave',
  subheader: 'Birthwave',
  icon: 'hugeicons:database',
  clientKey: 'birthwave',
  active: true,
  items: [
    { name: 'Dashboard', pathName: buildClientPortalPath('birthwave', 'dashboard'), path: buildClientPortalPath('birthwave', 'dashboard') },
    // "Leads" (the bare CRM leads list) — hidden per request; reach it from the
    // Dashboard → "Recent Leads → View all" link if needed.
    // { name: 'Leads', pathName: buildClientPortalPath('birthwave', 'leads'), path: buildClientPortalPath('birthwave', 'leads') },
    {
      name: WEBSITE_SOURCE_LABELS[WEBSITE_SOURCE_ORDER[0]],
      pathName: `${buildClientPortalPath('birthwave', 'leads')}?view=${WEBSITE_SOURCE_ORDER[0]}`,
      path: `${buildClientPortalPath('birthwave', 'leads')}?view=${WEBSITE_SOURCE_ORDER[0]}`,
    },
    // Instagram Leads — fixed-filter view (source=instagram, source_provider=REPLI)
    // over the SAME birthwave_leads list, not a separate lead source/table.
    // Mirrors the equivalent entry in client-portal-layout/navItems.ts.
    {
      name: 'Instagram Leads',
      pathName: `${buildClientPortalPath('birthwave', 'leads')}?view=instagram`,
      path: `${buildClientPortalPath('birthwave', 'leads')}?view=instagram`,
    },
    ...WEBSITE_SOURCE_ORDER.slice(1).map((key) => ({
      name: WEBSITE_SOURCE_LABELS[key],
      pathName: `${buildClientPortalPath('birthwave', 'leads')}?view=${key}`,
      path: `${buildClientPortalPath('birthwave', 'leads')}?view=${key}`,
    })),
    { name: 'Appointments', pathName: buildClientPortalPath('birthwave', 'appointments'), path: buildClientPortalPath('birthwave', 'appointments') },
    { name: 'Calls', pathName: buildClientPortalPath('birthwave', 'calls'), path: buildClientPortalPath('birthwave', 'calls') },
    // Doctors, Campaign Sources, Reports, Settings — hidden per request.
    // Pages/routes are untouched; reach them directly by URL if needed.
    // { name: 'Doctors', pathName: buildClientPortalPath('birthwave', 'doctors'), path: buildClientPortalPath('birthwave', 'doctors') },
    // { name: 'Campaign Sources', pathName: buildClientPortalPath('birthwave', 'campaign-sources'), path: buildClientPortalPath('birthwave', 'campaign-sources') },
    { name: 'Follow-ups', pathName: buildClientPortalPath('birthwave', 'follow-ups'), path: buildClientPortalPath('birthwave', 'follow-ups') },
    // { name: 'Reports', pathName: buildClientPortalPath('birthwave', 'reports'), path: buildClientPortalPath('birthwave', 'reports') },
    // { name: 'Settings', pathName: buildClientPortalPath('birthwave', 'settings'), path: buildClientPortalPath('birthwave', 'settings') },
  ],
};

const generateDynamicClientMenus = (): MenuItem[] => {
  return Object.entries(ClientRegistry).map(([clientKey, config]: [string, ClientConfig]) => {
    const overviewItem: SubMenuItem = {
      name: 'Overview',
      pathName: `/pages/d/${clientKey}/overview`,
      path: `/pages/d/${clientKey}/overview`,
    };

    const tableItems: SubMenuItem[] = config.tables.map((table: TableConfig) => ({
      name: table.title,
      pathName: `/pages/d/${clientKey}/${table.id}`,
      path: `/pages/d/${clientKey}/${table.id}`,
    }));

    const isDedicatedLeadModule = ['aarav_eye_care', 'antardrashti_netralaya', 'rio', 'shanti_eye_tech', 'phoenix_fitness'].includes(clientKey);
    const items: SubMenuItem[] = isDedicatedLeadModule ? tableItems : [overviewItem];
    if (!isDedicatedLeadModule) {
      items.push(...tableItems);
    }

    if (clientKey === 'vls_law') {
      items.push({
        name: 'Law Practice Enrollments',
        pathName: `/pages/d/${clientKey}/vls/law-practice`,
        path: `/pages/d/${clientKey}/vls/law-practice`,
      });
      items.push({
        name: 'MACT Master Class',
        pathName: `/pages/d/${clientKey}/vls/mact-master-class`,
        path: `/pages/d/${clientKey}/vls/mact-master-class`,
      });
      items.push({
        name: 'Consumer Protection Law Masterclass',
        pathName: `/pages/d/${clientKey}/vls/consumer-protection-law-master-class`,
        path: `/pages/d/${clientKey}/vls/consumer-protection-law-master-class`,
      });
      items.push({
        name: 'Taxation Law',
        pathName: `/pages/d/${clientKey}/vls/taxation-law`,
        path: `/pages/d/${clientKey}/vls/taxation-law`,
      });
    }

    if (clientKey === 'pixeleye') {
      items.push({
        name: 'Follow-ups',
        pathName: `/pages/d/${clientKey}/follow-ups`,
        path: `/pages/d/${clientKey}/follow-ups`,
      });
      items.push({
        name: 'Notification Tracker',
        pathName: `/pages/d/${clientKey}/notification-tracker`,
        path: `/pages/d/${clientKey}/notification-tracker`,
      });
      items.push({
        name: 'Website Leads',
        pathName: `/pages/d/${clientKey}/pixel-eye/website-leads`,
        path: `/pages/d/${clientKey}/pixel-eye/website-leads`,
      });
    }

    return {
      id: clientKey,
      subheader: config.appName,
      icon: 'hugeicons:database',
      clientKey: clientKey,
      active: true,
      items,
    };
  });
};

const sitemap: MenuItem[] = [
  ...baseSitemap,
  enquiriesSitemap,
  ...generateDynamicClientMenus(),
  birthwaveSitemap,
  clientManagementSitemap,
  apiLogsSitemap,
  managementSitemap,
];

export default sitemap;


