import Stack from '@mui/material/Stack';
import ClientSection from 'components/sections/client';

const ClientPage = () => (
  <Stack direction="column" width="100%" minHeight="100vh" p={3.5} spacing={3.5} sx={{ flex: 1, minHeight: 0 }}>
    <ClientSection />
  </Stack>
);

export default ClientPage;
