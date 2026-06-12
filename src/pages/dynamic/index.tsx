import { useParams } from 'react-router-dom';
import { useAuth } from 'redux/selectors/auth/authSelector';
import DynamicSection from 'components/sections/dynamic/DynamicSection';
import DynamicDashboard from 'components/sections/dynamic/DynamicDashboard';
import DashboardPage from 'components/sections/pixel-eye-overview/DashboardPage';
import NotificationTracker from 'components/sections/pixel-eye-notification-tracker';
import { ClientRegistry } from 'config/clients';
import { Box, Typography } from '@mui/material';
import { normalizeClientKey } from 'utils/clientKey';
import { resolveClientModuleKey } from 'utils/clientModuleResolver';

const DynamicPage = () => {
  const { user } = useAuth();
  const { tableId, clientKey: urlClientKey } = useParams<{ tableId: string; clientKey?: string }>();

  // Super Admin can pass clientKey in URL. Regular clients use their own key.
  const rawClientKey =
    user?.role === 'super-admin' && urlClientKey ? urlClientKey : user?.clientKey;
  const activeClientKey = resolveClientModuleKey(rawClientKey);
  const tenantClientKey = normalizeClientKey(rawClientKey);

  if (!activeClientKey || !ClientRegistry[activeClientKey]) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h5" color="error">
          Client Configuration Not Found
        </Typography>
        <Typography variant="body1">No configuration exists for key: {activeClientKey}</Typography>
      </Box>
    );
  }

  const clientConfig = ClientRegistry[activeClientKey];

  // "overview" is a special tableId — render the client's metric dashboard
  if (tableId === 'overview') {
    if (activeClientKey === 'pixeleye') {
      return <DashboardPage />;
    }

    return <DynamicDashboard config={clientConfig} />;
  }

  if (tableId === 'notification-tracker') {
    return (
      <NotificationTracker clientKey={user?.role === 'super-admin' ? tenantClientKey : undefined} />
    );
  }

  const tableConfig = clientConfig.tables.find((t) => t.id === tableId);

  if (!tableConfig) {
    const defaultTable = clientConfig.tables[0];
    if (defaultTable) {
      return <DynamicSection config={defaultTable} clientKey={activeClientKey} />;
    }
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h5" color="error">
          No Tables Configured
        </Typography>
        <Typography variant="body1">
          The client {activeClientKey} has no valid table configurations.
        </Typography>
      </Box>
    );
  }

  return <DynamicSection config={tableConfig} clientKey={tenantClientKey} />;
};

export default DynamicPage;
