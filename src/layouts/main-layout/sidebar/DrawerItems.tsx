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
import { resolveClientModuleKey } from 'utils/clientModuleResolver';

// Invictus brand diamond logo (dual-tone green)
const InvictusLogo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <polygon points="20,2 38,20 20,38 2,20" fill="#1F6B40" />
    <polygon points="20,8 32,20 20,32 8,20" fill="#2E8B57" />
    <polygon points="20,14 26,20 20,26 14,20" fill="#3DAA6B" />
  </svg>
);

const roleLabel: Record<string, string> = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  client: 'Client',
};

const roleColor: Record<string, string> = {
  'super-admin': '#1F6B40',
  admin: '#2E8B57',
  client: '#3DAA6B',
};

const getInitials = (name?: string) =>
  (name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const DrawerItems = () => {
  const { user } = useAuth();
  const userModuleKey = resolveClientModuleKey(user?.clientKey);

  const filteredSitemap = sitemap.filter((item: MenuItem) => {
    if (user?.role === 'super-admin') return true;

    if (user?.role === 'admin') {
      if (item.id === 'client-management') return false;
      if (!item.clientKey) {
        return item.id === 'dashboard' || item.id === 'user-management';
      }
      return normalizeClientKey(item.clientKey) === normalizeClientKey(userModuleKey);
    }

    if (user?.role === 'client') {
      if (!item.clientKey) return false;
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
        backgroundColor: '#111714',
        overflow: 'hidden',
      }}
    >
      {/* ── Logo / Brand Header ─────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          pt: 3,
          pb: 2.5,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
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
            gap: 1.25,
            borderRadius: 2,
            p: 0.5,
            '&:hover': { opacity: 0.85 },
          }}
        >
          <InvictusLogo size={34} />
          <Box>
            <Typography
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '0.06em',
                lineHeight: 1.1,
                textTransform: 'uppercase',
              }}
            >
              Invictus
            </Typography>
            <Typography
              sx={{
                fontSize: '0.625rem',
                fontWeight: 500,
                color: '#7ECBA5',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              Global Tech
            </Typography>
          </Box>
        </ButtonBase>
      </Box>

      {/* ── User Avatar Block ───────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: roleColor[user?.role || 'client'] || '#2E8B57',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '0.8125rem',
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
                fontWeight: 600,
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.3,
              }}
            >
              {user?.username || user?.email || 'User'}
            </Typography>
            <Box
              sx={{
                display: 'inline-block',
                mt: 0.25,
                px: 0.75,
                py: 0.125,
                borderRadius: '4px',
                backgroundColor: `${roleColor[user?.role || 'client']}22`,
                border: `1px solid ${roleColor[user?.role || 'client']}44`,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: roleColor[user?.role || 'client'],
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                {roleLabel[user?.role || ''] || user?.role || 'User'}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1.5,
          px: 1.5,
          // Sidebar-specific scrollbar
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(195,230,211,0.2)', borderRadius: 2 },
          '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(195,230,211,0.4)' },
        }}
      >
        <Typography
          sx={{
            px: 1,
            mb: 0.75,
            fontSize: '0.5625rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Main
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
              backgroundColor: 'rgba(224,68,68,0.12)',
              border: '1px solid rgba(224,68,68,0.3)',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', color: '#FF9999', fontWeight: 600, mb: 0.5 }}>
              No client linked
            </Typography>
            <Typography sx={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
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
              backgroundColor: 'rgba(245,158,58,0.12)',
              border: '1px solid rgba(245,158,58,0.3)',
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', color: '#FFCA7A', fontWeight: 600, mb: 0.5 }}>
              Key mismatch
            </Typography>
            <Typography sx={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
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
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.625rem',
            color: 'rgba(255,255,255,0.24)',
            letterSpacing: '0.04em',
          }}
        >
          © 2025 Invictus Global Tech
        </Typography>
      </Box>
    </Box>
  );
};

export default DrawerItems;
