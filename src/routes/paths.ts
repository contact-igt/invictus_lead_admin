
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

  // Dynamic client module route
  dynamicTable: `/${rootPaths.pageRoot}/d/:clientKey?/:tableId`,
};
