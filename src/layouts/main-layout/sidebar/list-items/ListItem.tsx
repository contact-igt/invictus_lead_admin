import { MenuItem } from 'routes/sitemap';
import Link from '@mui/material/Link';
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
        mb: 0.25,
        borderRadius: 2,
        px: 1.25,
        py: 0.875,
        backgroundColor: isActive ? '#1F6B40' : 'transparent',
        borderLeft: isActive ? '3px solid #3DAA6B' : '3px solid transparent',
        '&:hover': {
          backgroundColor: isActive ? '#1F6B40' : 'rgba(255,255,255,0.06)',
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>
        {icon && (
          <IconifyIcon
            icon={icon}
            width={18}
            height={18}
            sx={{ color: isActive ? '#7ECBA5' : 'rgba(255,255,255,0.45)' }}
          />
        )}
      </ListItemIcon>
      <ListItemText
        primary={subheader}
        primaryTypographyProps={{
          sx: {
            fontSize: '0.8125rem',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
            letterSpacing: '0.01em',
          },
        }}
      />
    </ListItemButton>
  );
};

export default ListItem;
