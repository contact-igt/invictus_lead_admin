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
  pixelEyeFollowUps: `pixel-eye/follow-ups`,
  pixelEyeScopedFollowUps: `/${rootPaths.pageRoot}/d/:clientKey/follow-ups`,
  pixelEyeLeadDetail: `pixel-eye/leads/:leadId`,
  pixelEyeScopedLeadDetail: `/${rootPaths.pageRoot}/d/:clientKey/pixel-eye/leads/:leadId`,
  notificationTracker: `/${rootPaths.pageRoot}/d/:clientKey/notification-tracker`,
  notificationDetails: `/${rootPaths.pageRoot}/d/:clientKey/notification/:notificationId`,

  // Dynamic client module route
  dynamicTable: `/${rootPaths.pageRoot}/d/:clientKey?/:tableId`,
};
