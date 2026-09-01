import { useParams } from 'react-router-dom';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { normalizeClientKey } from 'utils/clientKey';

// Shared tenant-scoping logic for every Birthwave portal page: a super-admin
// browses via the URL's :clientKey (passed to the API as _client_key), while
// a client user is always implicitly scoped server-side from their token.
export const useBirthwaveScope = () => {
  const { user } = useAuth();
  const { clientKey: urlClientKey } = useParams<{ clientKey?: string }>();
  const isSuperAdmin = (user?.role || '').toLowerCase() === 'super-admin';
  const activeClientKey = normalizeClientKey(isSuperAdmin ? urlClientKey : user?.clientKey);
  const hasScope = !isSuperAdmin || Boolean(activeClientKey);
  const scopedClientKey = isSuperAdmin ? activeClientKey : undefined;

  return { isSuperAdmin, activeClientKey, hasScope, scopedClientKey };
};
