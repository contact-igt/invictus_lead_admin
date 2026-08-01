import { MenuItem } from 'routes/sitemap';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconifyIcon from 'components/base/IconifyIcon';
import { useLocation } from 'react-router-dom';

const ListItem = ({ subheader, icon, path }: MenuItem) => {
  const location = useLocation();
  const isActive = location.pathname === (path || '');

  return (
    <ListItemButton
      component={Link}
      href={path}
      sx={{
        mb: 0.5,
        borderRadius: '10px',
        px: 1.5,
        py: 0.875,
        backgroundColor: isActive ? '#F1F5F9' : 'transparent',
        '&:hover': {
          backgroundColor: isActive ? '#E2E8F0' : '#F8FAFC',
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
            sx={{ color: isActive ? '#0F172A !important' : '#64748B !important' }}
          />
        )}
      </ListItemIcon>
      <ListItemText
        disableTypography
        primary={
          <Box
            component="span"
            sx={{
              fontSize: '0.875rem', // 14px Sidebar Spec
              fontWeight: isActive ? 600 : 500, // 500 Spec
              color: isActive ? '#0F172A !important' : '#334155 !important',
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
