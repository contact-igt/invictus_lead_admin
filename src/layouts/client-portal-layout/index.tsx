import { PropsWithChildren, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { Icon } from '@iconify/react';
import SidebarContent from './Sidebar';

const SIDEBAR_WIDTH = 252;
const BORDER = '#E5E7EB';

const ClientPortalLayout = ({ children }: PropsWithChildren) => {
  const { clientKey = '' } = useParams<{ clientKey: string }>();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Stack direction="row" width={1} minHeight="100vh" sx={{ bgcolor: '#F8FAFC' }}>
      {/* Desktop sidebar */}
      <Box
        component="nav"
        width={{ lg: SIDEBAR_WIDTH }}
        flexShrink={{ lg: 0 }}
        display={{ xs: 'none', lg: 'block' }}
        sx={{ borderRight: '1px solid', borderColor: BORDER }}
      >
        <Box sx={{ position: 'sticky', top: 0, height: '100vh' }}>
          <SidebarContent clientKey={clientKey} />
        </Box>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', lg: 'none' } }}
        PaperProps={{ sx: { width: SIDEBAR_WIDTH } }}
      >
        <SidebarContent clientKey={clientKey} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Stack component="main" direction="column" flexGrow={1} minWidth={0}>
        {/* Mobile top bar */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            display: { xs: 'flex', lg: 'none' },
            px: 2,
            height: 60,
            borderBottom: '1px solid',
            borderColor: BORDER,
            bgcolor: '#FFFFFF',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <IconButton
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            size="small"
            sx={{ border: '1px solid', borderColor: BORDER, borderRadius: '8px' }}
          >
            <Icon icon="hugeicons:menu-01" width={20} height={20} />
          </IconButton>
          <Box component="img" src="/assets/invictus-logo-light.png" alt="Invictus Global Tech" sx={{ height: 20 }} />
        </Stack>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Box>
      </Stack>
    </Stack>
  );
};

export default ClientPortalLayout;
