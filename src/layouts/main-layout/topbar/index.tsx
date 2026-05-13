import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import useColorMode from 'hooks/useColorMode';

const LogoImg = '/assets/brand-logo.png';
// import LanguageSelect from './LanguageSelect';
import ProfileMenu from './ProfileMenu';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { useLocation } from 'react-router-dom';

interface TopbarProps {
  isClosing: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Topbar = ({ isClosing, mobileOpen, setMobileOpen }: TopbarProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const { mode, toggle } = useColorMode();

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Stack
      px={4}
      height={72}
      alignItems="center"
      justifyContent="space-between"
      sx={{
        bgcolor: mode === 'dark' ? '#0B1310' : 'info.lighter',
        color: mode === 'dark' ? '#EAF7EE' : 'inherit',
        borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.04)' : undefined,
        boxShadow: mode === 'dark' ? 'inset 0 -1px 0 rgba(0,0,0,0.2)' : undefined,
      }}
      position="sticky"
      top={0}
      zIndex={1200}
    >
      <Stack spacing={{ xs: 1, sm: 2 }} alignItems="center">
        <ButtonBase
          component={Link}
          href="/"
          disableRipple
          sx={{ lineHeight: 0, display: { xs: 'none', sm: 'block', lg: 'none' } }}
        >
          <Image src={LogoImg} alt="logo" height={50} width={200} sx={{ mr: 1.25 }} />
        </ButtonBase>

        <Toolbar sx={{ display: { xs: 'block', lg: 'none' } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
          >
            <IconifyIcon icon="clarity:menu-line" />
          </IconButton>
        </Toolbar>

        <Toolbar sx={{ display: { xs: 'block', md: 'none' } }}>
          <IconButton size="large" edge="start" color="inherit" aria-label="search">
            <IconifyIcon icon="mynaui:search" />
          </IconButton>
        </Toolbar>

        {location.pathname === '/' && (
          <TextField
            variant="filled"
            placeholder="Search data, reports, or users..."
            sx={{ width: 350, display: { xs: 'none', md: 'flex' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconifyIcon icon={'mynaui:search'} />
                </InputAdornment>
              ),
            }}
          />
        )}
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Tooltip title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
          <IconButton
            size="medium"
            onClick={toggle}
            aria-label="toggle theme"
            sx={{ 
              height: 40, 
              width: 40,
              border: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', 
              bgcolor: mode === 'dark' ? 'rgba(22,163,74,0.08)' : 'background.paper',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(22,163,74,0.12)' : 'action.hover',
                borderColor: mode === 'dark' ? 'rgba(34,197,94,0.3)' : 'rgba(0,0,0,0.15)'
              }
            }}
          >
            <IconifyIcon 
              icon={mode === 'dark' ? 'eva:sun-fill' : 'eva:moon-fill'} 
              sx={{ fontSize: 20, color: mode === 'dark' ? '#22C55E' : 'text.primary' }} 
            />
          </IconButton>
        </Tooltip>

        <IconButton 
          size="medium" 
          sx={{ 
            height: 40, 
            width: 40,
            border: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            bgcolor: mode === 'dark' ? 'rgba(22,163,74,0.08)' : 'background.paper',
            '&:hover': {
              bgcolor: mode === 'dark' ? 'rgba(22,163,74,0.12)' : 'action.hover',
              borderColor: mode === 'dark' ? 'rgba(34,197,94,0.3)' : 'rgba(0,0,0,0.15)'
            }
          }}
        >
          <Badge 
            color="success" 
            variant="dot" 
            sx={{ 
              '& .MuiBadge-badge': { 
                backgroundColor: '#16A34A',
                boxShadow: mode === 'dark' ? '0 0 8px rgba(34,197,94,0.5)' : 'none'
              } 
            }}
          >
            <IconifyIcon 
              icon="solar:bell-outline" 
              sx={{ fontSize: 20, color: mode === 'dark' ? '#22C55E' : 'text.primary' }} 
            />
          </Badge>
        </IconButton>

        <ProfileMenu user={user} mode={mode} />
      </Stack>
    </Stack>
  );
};

export default Topbar;
