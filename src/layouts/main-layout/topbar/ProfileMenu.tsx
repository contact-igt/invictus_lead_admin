/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import Menu from '@mui/material/Menu';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconifyIcon from 'components/base/IconifyIcon';
import { clearAuthData } from 'redux/slices/auth/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import path from '../../../routes/paths';

interface MenuItems {
  id: number;
  title: string;
  icon: string;
}

const menuItems: MenuItems[] = [
  {
    id: 2,
    title: 'Account Settings',
    icon: 'hugeicons:account-setting-02',
  },
  {
    id: 5,
    title: 'Logout',
    icon: 'hugeicons:logout-03',
  },
];

const firstLetter = (name?: string | null): string =>
  (name || '?').trim().charAt(0).toUpperCase();

const ProfileMenu = ({ user, mode }: any) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const logout = () => {
    dispatch(clearAuthData());
    navigate(path.signin);
  };

  return (
    <>
      <ButtonBase
        onClick={handleProfileClick}
        aria-controls={open ? 'account-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        disableRipple
        sx={{
          borderRadius: '8px',
          border: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          bgcolor: mode === 'dark' ? 'rgba(22,163,74,0.08)' : 'background.paper',
          '&:hover': {
            bgcolor: mode === 'dark' ? 'rgba(22,163,74,0.12)' : 'action.hover',
            borderColor: mode === 'dark' ? 'rgba(34,197,94,0.3)' : 'rgba(0,0,0,0.15)'
          }
        }}
      >
        <Avatar
          sx={{
            height: 40,
            width: 40,
            bgcolor: mode === 'dark' ? '#16A34A' : 'primary.main',
            fontWeight: 600,
            fontSize: 16,
            boxShadow: mode === 'dark' ? '0 0 12px rgba(34,197,94,0.3)' : 'none',
          }}
        >
          {firstLetter(user?.username)}
        </Avatar>
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        sx={{
          mt: 1.5,
          '& .MuiList-root': { p: 0, width: 230 },
          '& .MuiPaper-root': {
            bgcolor: mode === 'dark' ? '#0D1410' : 'background.paper',
            border: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: mode === 'dark' 
              ? '0 8px 24px rgba(0,0,0,0.65), 0 2px 6px rgba(46,139,87,0.08)' 
              : '0 4px 12px rgba(0,0,0,0.1)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box p={1}>
          <MenuItem 
            onClick={handleProfileMenuClose} 
            sx={{ 
              '&:hover': { 
                bgcolor: mode === 'dark' ? 'rgba(22,163,74,0.1)' : 'info.light' 
              } 
            }}
          >
            <Avatar
              sx={{
                mr: 1,
                height: 42,
                width: 42,
                bgcolor: mode === 'dark' ? '#16A34A' : 'primary.main',
                fontWeight: 700,
                fontSize: 18,
                boxShadow: mode === 'dark' ? '0 0 8px rgba(34,197,94,0.3)' : 'none',
              }}
            >
              {firstLetter(user?.username)}
            </Avatar>
            <Stack direction="column">
              <Typography variant="body2" color={mode === 'dark' ? '#DFFFE3' : 'text.primary'} fontWeight={600}>
                {user?.username}
              </Typography>
              <Typography variant="caption" color={mode === 'dark' ? '#94A3B8' : 'text.secondary'} fontWeight={400}>
                {user?.email}
              </Typography>
            </Stack>
          </MenuItem>
        </Box>

        <Divider sx={{ my: 0, borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'divider' }} />

        <Box p={1}>
          {menuItems.map((item) => {
            const handleClick = () => {
              handleProfileMenuClose();
              if (item.title === 'Logout') {
                logout();
              } else if (item.title === 'Account Settings') {
                navigate(path.settings);
              }
            };
            return (
              <MenuItem 
                key={item.id} 
                onClick={handleClick} 
                sx={{ 
                  py: 1,
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 'rgba(22,163,74,0.1)' : 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ mr: 1, color: mode === 'dark' ? '#22C55E' : 'text.secondary', fontSize: 'h5.fontSize' }}>
                  <IconifyIcon icon={item.icon} />
                </ListItemIcon>
                <Typography variant="body2" color={mode === 'dark' ? '#DFFFE3' : 'text.secondary'} fontWeight={500}>
                  {item.title}
                </Typography>
              </MenuItem>
            );
          })}
        </Box>
      </Menu>
    </>
  );
};

export default ProfileMenu;
