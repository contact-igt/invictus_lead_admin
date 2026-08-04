import sitemap, { MenuItem } from 'routes/sitemap';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import CollapseListItem from './list-items/CollapseListItem';
import ListItem from './list-items/ListItem';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { normalizeClientKey } from 'utils/clientKey';
import { resolveClientModuleKey, isInvictusClientKey, INVICTUS_CLIENT_KEY } from 'utils/clientModuleResolver';
import useColorMode from 'hooks/useColorMode';

// Invictus brand diamond logo (emerald dual-facet)
const InvictusLogo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left Chevron / Angle shape */}
    <path
      d="M23 5 L5 25 L23 45 L23 36 L13 25 L23 14 Z"
      fill="#00D285"
    />
    {/* Right Blade / Vertical Diamond facet */}
    <path
      d="M27 5 L45 25 L27 45 L27 5 Z"
      fill="#009E5E"
    />
    {/* Inner facet shading */}
    <path
      d="M27 5 L36 25 L27 45 Z"
      fill="#00B86E"
      opacity="0.4"
    />
  </svg>
);

const roleLabel: Record<string, string> = {
  'super-admin': 'SUPER ADMIN',
  admin: 'ADMIN',
  client: 'CLIENT',
  'invictus-admin': 'INVICTUS ADMIN',
  'invictus-frontend': 'INVICTUS FRONTEND',
  'invictus-backend': 'INVICTUS BACKEND',
};

const getInitials = (name?: string) =>
  (name || 'I')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const DrawerItems = () => {
  const { mode } = useColorMode();
  const { user } = useAuth();
  const userModuleKey = resolveClientModuleKey(user?.clientKey);

  // Check if the logged-in user is an Invictus internal user
  const isInvictusUser = isInvictusClientKey(user?.clientKey);

  const filteredSitemap = sitemap.filter((item: MenuItem) => {
    if (user?.role === 'super-admin') return true;

    if (user?.role === 'admin') {
      if (item.id === 'client-management') return false;
      if (!item.clientKey) {
        return item.id === 'dashboard' || item.id === 'user-management';
      }
      // Invictus admin can see enquiries menu
      if (item.clientKey === INVICTUS_CLIENT_KEY && isInvictusUser) return true;
      return normalizeClientKey(item.clientKey) === normalizeClientKey(userModuleKey);
    }

    if (user?.role === 'client') {
      if (!item.clientKey) return false;
      // Invictus client users see the enquiries menu
      if (item.clientKey === INVICTUS_CLIENT_KEY && isInvictusUser) return true;
      return normalizeClientKey(item.clientKey) === normalizeClientKey(userModuleKey);
    }
    return false;
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: mode === 'dark' ? '#0B1410' : '#FFFFFF',
        overflow: 'hidden',
        transition: 'background-color 200ms ease',
      }}
    >
      {/* ── Logo / Brand Header ─────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 2,
          borderBottom: mode === 'dark' ? '1px solid #15271E' : '1px solid #F1F5F9',
          flexShrink: 0,
        }}
      >
        <ButtonBase
          component={Link}
          href="/"
          disableRipple
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderRadius: 2,
            p: 0.5,
            justifyContent: 'flex-start',
            '&:hover': { opacity: 0.9 },
          }}
        >
          <InvictusLogo size={38} />
          <Box sx={{ textAlign: 'left' }}>
            <Typography
              sx={{
                fontFamily: '"Geist", sans-serif',
                fontSize: '1rem',
                fontWeight: 800,
                color: mode === 'dark' ? '#FFFFFF !important' : '#0F172A !important',
                letterSpacing: '0.04em',
                lineHeight: 1.1,
                textTransform: 'uppercase',
              }}
            >
              INVICTUS
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Geist", sans-serif',
                fontSize: '0.625rem',
                fontWeight: 700,
                color: mode === 'dark' ? '#4ADE80 !important' : '#0F172A !important',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                lineHeight: 1.2,
                mt: '1px',
              }}
            >
              GLOBAL TECH
            </Typography>
          </Box>
        </ButtonBase>
      </Box>

      {/* ── User Profile Block ───────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: mode === 'dark' ? '1px solid #15271E' : '1px solid #F1F5F9',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(16,185,129,0.2)',
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {getInitials(user?.username || user?.email)}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: mode === 'dark' ? '#F8FAFC !important' : '#0F172A !important',
                  lineHeight: 1.3,
                }}
              >
                {user?.username || user?.email || 'invictusglobaltech'}
              </Typography>
              <Box
                sx={{
                  display: 'inline-block',
                  mt: 0.25,
                  px: 1,
                  py: 0.2,
                  borderRadius: '12px',
                  backgroundColor: mode === 'dark' ? '#10241A' : '#D1FAE5',
                  border: mode === 'dark' ? '1px solid #15271E' : '1px solid #A7F3D0',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: mode === 'dark' ? '#4ADE80' : '#047857',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}
                >
                  {roleLabel[user?.role || ''] || user?.role || 'SUPER ADMIN'}
                </Typography>
              </Box>
            </Box>
          </Stack>
          <Box
            sx={{
              color: mode === 'dark' ? '#94A3B8' : '#0F172A',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </Box>
        </Stack>
      </Box>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 2,
          px: 2,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: mode === 'dark' ? '#1F3E30' : '#CBD5E1', borderRadius: 2 },
          '&::-webkit-scrollbar-thumb:hover': { background: mode === 'dark' ? '#22C55E' : '#94A3B8' },
        }}
      >
        <Typography
          sx={{
            px: 1,
            mb: 1,
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: mode === 'dark' ? '#4B6356 !important' : '#64748B !important',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          MAIN
        </Typography>

        <List component="nav" disablePadding>
          {filteredSitemap.map((route) =>
            route.items ? (
              <CollapseListItem key={route.id} {...route} />
            ) : (
              <ListItem key={route.id} {...route} />
            ),
          )}
        </List>

        {/* Diagnostic: shown only when client has no matching menu items */}
        {user?.role === 'client' && !user?.clientKey && (
          <Box
            sx={{
              mt: 2,
              mx: 1,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: mode === 'dark' ? '#2D1212' : '#FEF2F2',
              border: mode === 'dark' ? '1px solid #7F1D1D' : '1px solid #FCA5A5',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', color: mode === 'dark' ? '#FCA5A5' : '#991B1B', fontWeight: 600, mb: 0.5 }}>
              No client linked
            </Typography>
            <Typography sx={{ fontSize: '0.625rem', color: mode === 'dark' ? '#FECACA' : '#7F1D1D', lineHeight: 1.5 }}>
              This user has no client_id set in the database. Assign a client to this user account.
            </Typography>
          </Box>
        )}

        {user?.role === 'client' && user?.clientKey && filteredSitemap.filter(i => i.clientKey).length === 0 && (
          <Box
            sx={{
              mt: 2,
              mx: 1,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: mode === 'dark' ? '#271E0B' : '#FFFBEB',
              border: mode === 'dark' ? '1px solid #78350F' : '1px solid #FDE68A',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', color: mode === 'dark' ? '#FCD34D' : '#92400E', fontWeight: 600, mb: 0.5 }}>
              Key mismatch
            </Typography>
            <Typography sx={{ fontSize: '0.625rem', color: mode === 'dark' ? '#FEF3C7' : '#78350F', lineHeight: 1.5 }}>
              clientKey "{user.clientKey}" not mapped to any module.
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: mode === 'dark' ? '1px solid #15271E' : '1px solid #F1F5F9',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.625rem',
            color: mode === 'dark' ? '#4B6356' : '#94A3B8',
            letterSpacing: '0.04em',
            fontWeight: 500,
          }}
        >
          © 2025 Invictus Global Tech
        </Typography>
      </Box>
    </Box>
  );
};

export default DrawerItems;
