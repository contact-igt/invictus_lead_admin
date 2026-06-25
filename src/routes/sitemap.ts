import paths from './paths';
import { ClientRegistry, ClientConfig, TableConfig } from 'config/clients';

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

// Base hardcoded menus (like Dashboard and User Management)
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

// Dynamically generate client menus from the Registry
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

    const items: SubMenuItem[] = [overviewItem];
    items.push(...tableItems);

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
  ...generateDynamicClientMenus(),
  clientManagementSitemap,
  managementSitemap,
];

export default sitemap;
