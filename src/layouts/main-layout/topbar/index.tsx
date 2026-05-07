import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';

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

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Stack
      px={3.5}
      height={90}
      alignItems="center"
      justifyContent="space-between"
      bgcolor="info.lighter"
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

      <Stack spacing={{ xs: 1, sm: 2 }} alignItems="center">
        {/* <LanguageSelect /> */}
        <IconButton size="large">
          <Badge color="error" variant="dot">
            <IconifyIcon icon="solar:bell-outline" />
          </Badge>
        </IconButton>
        <ProfileMenu user={user} />
      </Stack>
    </Stack>
  );
};

export default Topbar;
