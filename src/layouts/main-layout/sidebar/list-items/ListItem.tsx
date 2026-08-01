import { MenuItem } from 'routes/sitemap';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconifyIcon from 'components/base/IconifyIcon';
import { useLocation } from 'react-router-dom';
import useColorMode from 'hooks/useColorMode';

const ListItem = ({ subheader, icon, path }: MenuItem) => {
  const { mode } = useColorMode();
  const location = useLocation();
  const isActive = location.pathname === (path || '');

  const activeBg = mode === 'dark' ? '#10241A' : '#F1F5F9';
  const hoverBg = isActive
    ? (mode === 'dark' ? '#162E22' : '#E2E8F0')
    : (mode === 'dark' ? '#0E1D15' : '#F8FAFC');
  const activeColor = mode === 'dark' ? '#4ADE80' : '#0F172A';
  const inactiveColor = mode === 'dark' ? '#CBD5E1' : '#334155';
  const iconColor = isActive ? (mode === 'dark' ? '#4ADE80' : '#0F172A') : (mode === 'dark' ? '#94A3B8' : '#64748B');

  return (
    <ListItemButton
      component={Link}
      href={path}
      sx={{
        mb: 0.5,
        borderRadius: '10px',
        px: 1.5,
        py: 0.875,
        backgroundColor: isActive ? activeBg : 'transparent',
        border: isActive && mode === 'dark' ? '1px solid #15271E' : '1px solid transparent',
        '&:hover': {
          backgroundColor: hoverBg,
        },
        transition: 'all 120ms ease',
      }}
    >
      <ListItemIcon sx={{ minWidth: 28 }}>
        {icon && (
          <IconifyIcon
            icon={icon}
            width={18}
            height={18}
            sx={{ color: `${iconColor} !important` }}
          />
        )}
      </ListItemIcon>
      <ListItemText
        disableTypography
        primary={
          <Box
            component="span"
            sx={{
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: `${isActive ? activeColor : inactiveColor} !important`,
              letterSpacing: '0em',
              fontFamily: '"Geist", sans-serif',
            }}
          >
            {subheader}
          </Box>
        }
      />
    </ListItemButton>
  );
};

export default ListItem;
