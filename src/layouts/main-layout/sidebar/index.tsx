import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import DrawerItems from './DrawerItems';
import useColorMode from 'hooks/useColorMode';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsClosing: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ mobileOpen, setMobileOpen, setIsClosing }: SidebarProps) => {
  const { mode } = useColorMode();

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const paperStyles = {
    backgroundColor: mode === 'dark' ? '#0B1410' : '#FFFFFF',
    borderRight: mode === 'dark' ? '1px solid #15271E' : '1px solid #E2E8F0',
    boxShadow: 'none',
    transition: 'background-color 200ms ease, border-color 200ms ease',
  };

  return (
    <Box
      component="nav"
      width={{ lg: 252 }}
      flexShrink={{ lg: 0 }}
      display={{ xs: 'none', lg: 'block' }}
      zIndex={1300}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', lg: 'none' } }}
        PaperProps={{ sx: paperStyles }}
      >
        <DrawerItems />
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', lg: 'block' } }}
        PaperProps={{ sx: paperStyles }}
        open
      >
        <DrawerItems />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
