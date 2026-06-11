
export const rootPaths = {
  root: '/',
  pageRoot: 'pages',
  authRoot: 'authentication',
};

export default {
  settings: `/${rootPaths.pageRoot}/settings`,
  management: `/${rootPaths.pageRoot}/management`,
  clients: `/${rootPaths.pageRoot}/clients`,
  signin: `/${rootPaths.authRoot}/signin`,
  pixelEyeLeads: `/${rootPaths.pageRoot}/d/:clientKey/leads`,
  pixelEyeLeadDetail: `pixel-eye/leads/:leadId`,

  // Dynamic client module route
  dynamicTable: `/${rootPaths.pageRoot}/d/:clientKey?/:tableId`,
};
