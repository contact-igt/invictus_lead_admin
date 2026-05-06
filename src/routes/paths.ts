
export const rootPaths = {
  root: '/',
  pageRoot: 'pages',
  authRoot: 'authentication',
  errorRoot: 'error',
};

export default {
  dashboard: `/${rootPaths.pageRoot}/dashboard`,
  settings: `/${rootPaths.pageRoot}/settings`,
  vlsRoot: `/${rootPaths.pageRoot}/vls`,
  vlsLawPractice: `/${rootPaths.pageRoot}/vls/law-practice`,
  vlsAibe: `/${rootPaths.pageRoot}/vls/aibe`,
  vlsAcademy: `/${rootPaths.pageRoot}/vls/academy`,
  management: `/${rootPaths.pageRoot}/management`,
  clients: `/${rootPaths.pageRoot}/clients`,
  signin: `/${rootPaths.authRoot}/signin`,
  forgotPassword: `/${rootPaths.authRoot}/forgot-password`,
  404: `/${rootPaths.errorRoot}/404`,

  // Dynamic Route
  dynamicTable: `/${rootPaths.pageRoot}/d/:clientKey?/:tableId`,

};
