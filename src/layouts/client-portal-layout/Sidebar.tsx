import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { Icon } from '@iconify/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { clearAuthData } from 'redux/slices/auth/authSlice';
import paths, { buildClientPortalPath } from 'routes/paths';
import { PORTAL_NAV_ITEMS, PortalNavItem } from './navItems';

const LogoImg = '/assets/invictus-logo-light.png';
const BORDER = 'var(--bw-border)';
const GREEN = '#29AF81';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';

const firstLetter = (name?: string | null): string => (name || '?').trim().charAt(0).toUpperCase();

interface SidebarContentProps {
  clientKey: string;
  onNavigate?: () => void;
}

const SidebarContent = ({ clientKey, onNavigate }: SidebarContentProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearAuthData());
    navigate(paths.signin);
  };

  const hrefFor = (item: PortalNavItem) => {
    const base = buildClientPortalPath(clientKey, item.segment);
    const qs = new URLSearchParams(item.query || {}).toString();
    return qs ? `${base}?${qs}` : base;
  };

  const isItemActive = (item: PortalNavItem) => {
    if (location.pathname !== buildClientPortalPath(clientKey, item.segment)) return false;
    const currentView = new URLSearchParams(location.search).get('view') || '';
    const targetView = item.query?.view || '';
    return currentView === targetView;
  };

  return (
    <Stack direction="column" height="100%" sx={{ bgcolor: 'var(--bw-surface)' }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 3.5, borderBottom: '1px solid', borderColor: BORDER }}>
        <Box component="img" src={LogoImg} alt="Invictus Global Tech" sx={{ height: 28, width: 'auto' }} />
      </Box>

      {/* Nav */}
      <Stack
        component="nav"
        direction="column"
        spacing={0.5}
        sx={{ flexGrow: 1, px: 2, py: 2.5, overflowY: 'auto', '& a, & a:hover': { textDecoration: 'none' } }}
      >
        {PORTAL_NAV_ITEMS.map((item, index) => {
          const active = isItemActive(item);
          return (
            <ButtonBase
              key={`${item.segment}-${item.query?.view ?? index}`}
              component={Link}
              to={hrefFor(item)}
              onClick={onNavigate}
              sx={{
                justifyContent: 'flex-start',
                gap: 1.5,
                px: 1.75,
                py: 1.15,
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: active ? 700 : 500,
                color: active ? GREEN : TEXT_MUTED,
                bgcolor: active ? 'rgba(41,175,129,0.08)' : 'transparent',
                transition: 'background-color 120ms ease, color 120ms ease',
                '&:hover': {
                  bgcolor: active ? 'rgba(41,175,129,0.1)' : 'var(--bw-hover)',
                  color: active ? GREEN : TEXT_DARK,
                },
              }}
            >
              <Icon icon={item.icon} width={19} height={19} />
              <Typography component="span" noWrap sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
                {item.label}
              </Typography>
            </ButtonBase>
          );
        })}
      </Stack>

      {/* Profile */}
      <Box sx={{ px: 2, py: 2, borderTop: '1px solid', borderColor: BORDER }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: GREEN, fontSize: 14, fontWeight: 700 }}>
            {firstLetter(user?.username)}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography
              noWrap
              sx={{ fontSize: '0.82rem', fontWeight: 700, color: TEXT_DARK, lineHeight: 1.3 }}
            >
              {user?.username || 'Client'}
            </Typography>
            <Typography noWrap sx={{ fontSize: '0.72rem', color: TEXT_MUTED }}>
              {user?.clientName || 'Client Portal'}
            </Typography>
          </Box>
          <ButtonBase
            onClick={handleLogout}
            aria-label="Log out"
            sx={{
              p: 1,
              borderRadius: '8px',
              color: TEXT_MUTED,
              '&:hover': { bgcolor: 'var(--bw-hover)', color: TEXT_DARK },
            }}
          >
            <Icon icon="hugeicons:logout-03" width={18} height={18} />
          </ButtonBase>
        </Stack>
      </Box>
    </Stack>
  );
};

export default SidebarContent;
