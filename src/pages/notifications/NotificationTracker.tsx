import React from 'react';
import { useParams } from 'react-router-dom';
import NotificationTrackerSection from 'components/sections/pixel-eye-notification-tracker';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { normalizeClientKey } from 'utils/clientKey';

const NotificationTracker: React.FC = () => {
  const { clientKey: urlClientKey } = useParams<{ clientKey: string }>();
  const { user } = useAuth();

  const tenantClientKey = normalizeClientKey(
    user?.role === 'super-admin' && urlClientKey ? urlClientKey : user?.clientKey,
  );

  return <NotificationTrackerSection clientKey={tenantClientKey} />;
};

export default NotificationTracker;
