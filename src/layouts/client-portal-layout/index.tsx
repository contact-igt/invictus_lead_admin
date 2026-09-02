import { PropsWithChildren, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import SidebarContent from './Sidebar';
// Reuse the exact admin-app header so the client portal matches the rest of the app.
import Topbar from 'layouts/main-layout/topbar';

const SIDEBAR_WIDTH = 252;
const BORDER = 'var(--bw-border)';

const ClientPortalLayout = ({ children }: PropsWithChildren) => {
  const { clientKey = '' } = useParams<{ clientKey: string }>();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Stack direction="row" width={1} minHeight="100vh" sx={{ bgcolor: 'var(--bw-page)' }}>
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
        <Topbar isClosing={false} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Box>
      </Stack>
    </Stack>
  );
};

export default ClientPortalLayout;
