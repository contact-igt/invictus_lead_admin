import { useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { Icon } from '@iconify/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { clearAuthData } from 'redux/slices/auth/authSlice';
import useColorMode from 'hooks/useColorMode';
import paths, { buildClientPortalPath } from 'routes/paths';
import { PORTAL_NAV_ITEMS, PortalNavChild, PortalNavItem } from './navItems';

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
  const { mode } = useColorMode();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearAuthData());
    navigate(paths.signin);
  };

  const childHref = (item: PortalNavItem, child: PortalNavChild) => {
    const base = buildClientPortalPath(clientKey, item.segment);
    const qs = new URLSearchParams(child.query || {}).toString();
    return qs ? `${base}?${qs}` : base;
  };

  const isChildActive = (item: PortalNavItem, child: PortalNavChild) => {
    if (location.pathname !== buildClientPortalPath(clientKey, item.segment)) return false;
    const current = new URLSearchParams(location.search).get('view') || '';
    const target = new URLSearchParams(child.query || {}).get('view') || '';
    return current === target;
  };

  const isLeafActive = (item: PortalNavItem) => {
    if (location.pathname !== buildClientPortalPath(clientKey, item.segment)) return false;
    const current = new URLSearchParams(location.search).get('view') || '';
    return current === (item.query?.view || '');
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const isGroupOpen = (item: PortalNavItem) =>
    openGroups[item.segment] ??
    location.pathname === buildClientPortalPath(clientKey, item.segment);

  return (
    <Stack direction="column" height="100%" sx={{ bgcolor: 'var(--bw-surface)' }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 3.5, borderBottom: '1px solid', borderColor: BORDER }}>
        <Box
          component="img"
          src={LogoImg}
          alt="Invictus Global Tech"
          sx={{
            height: 28,
            width: 'auto',
            filter: mode === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'none',
          }}
        />
      </Box>

      {/* Nav */}
      <Stack
        component="nav"
        direction="column"
        spacing={0.5}
        sx={{ flexGrow: 1, px: 2, py: 2.5, overflowY: 'auto', '& a, & a:hover': { textDecoration: 'none' } }}
      >
        {PORTAL_NAV_ITEMS.map((item) => {
          const href = buildClientPortalPath(clientKey, item.segment);

          if (item.children && item.children.length > 0) {
            const groupOpen = isGroupOpen(item);
            const parentActive =
              location.pathname === href && !new URLSearchParams(location.search).get('view');
            const anyChildActive = item.children.some((child) => isChildActive(item, child));
            const highlight = parentActive || anyChildActive;

            return (
              <Box key={item.segment}>
                {/* Parent only toggles its sub-items open/closed — it does not navigate. */}
                <ButtonBase
                  aria-expanded={groupOpen}
                  onClick={() => {
                    setOpenGroups((prev) => ({ ...prev, [item.segment]: !groupOpen }));
                  }}
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: 1.5,
                    px: 1.75,
                    py: 1.15,
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: highlight ? 700 : 500,
                    color: highlight ? GREEN : TEXT_MUTED,
                    bgcolor: highlight ? 'rgba(41,175,129,0.08)' : 'transparent',
                    transition: 'background-color 120ms ease, color 120ms ease',
                    '&:hover': {
                      bgcolor: highlight ? 'rgba(41,175,129,0.1)' : 'var(--bw-hover)',
                      color: highlight ? GREEN : TEXT_DARK,
                    },
                  }}
                >
                  <Icon icon={item.icon} width={19} height={19} />
                  <Typography component="span" sx={{ flexGrow: 1, textAlign: 'left', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
                    {item.label}
                  </Typography>
                  <Box
                    component="span"
                    role="button"
                    aria-label={groupOpen ? 'Collapse' : 'Expand'}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenGroups((prev) => ({ ...prev, [item.segment]: !groupOpen }));
                    }}
                    sx={{ display: 'inline-flex', p: 0.25, borderRadius: '6px', '&:hover': { bgcolor: 'var(--bw-hover)' } }}
                  >
                    <Icon
                      icon="hugeicons:arrow-down-01"
                      width={16}
                      height={16}
                      style={{ transform: groupOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}
                    />
                  </Box>
                </ButtonBase>

                <Collapse in={groupOpen} timeout="auto" unmountOnExit>
                  <Stack direction="column" spacing={0.25} sx={{ mt: 0.25, pl: 2.5 }}>
                    {item.children.map((child) => {
                      const active = isChildActive(item, child);
                      return (
                        <ButtonBase
                          key={child.label}
                          component={Link}
                          to={childHref(item, child)}
                          onClick={onNavigate}
                          sx={{
                            justifyContent: 'flex-start',
                            gap: 1.25,
                            px: 1.5,
                            py: 0.9,
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: active ? 700 : 500,
                            color: active ? GREEN : TEXT_MUTED,
                            bgcolor: active ? 'rgba(41,175,129,0.08)' : 'transparent',
                            '&:hover': {
                              bgcolor: active ? 'rgba(41,175,129,0.1)' : 'var(--bw-hover)',
                              color: active ? GREEN : TEXT_DARK,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              flexShrink: 0,
                              bgcolor: active ? GREEN : 'var(--bw-border)',
                            }}
                          />
                          <Typography component="span" noWrap sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
                            {child.label}
                          </Typography>
                        </ButtonBase>
                      );
                    })}
                  </Stack>
                </Collapse>
              </Box>
            );
          }

          const active = isLeafActive(item);
          return (
            <ButtonBase
              key={item.segment}
              component={Link}
              to={href}
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
            <Typography noWrap sx={{ fontSize: '0.82rem', fontWeight: 700, color: TEXT_DARK, lineHeight: 1.3 }}>
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
