import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { useBirthwaveScope } from '../useBirthwaveScope';
import PortalPageHeader from '../PortalPageHeader';
import CrmConfigurationPanel from './CrmConfigurationPanel';
import IntegrationsPanel from './IntegrationsPanel';

const CARD_BORDER = '#E5E7EB';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
    <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT_DARK }}>{value}</Typography>
  </Stack>
);

const SettingsPage = () => {
  const { user } = useAuth();
  const { scopedClientKey } = useBirthwaveScope();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'crm' ? 1 : 0);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <PortalPageHeader title="Settings" subtitle="Account, CRM configuration, and integrations" />

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2.5, borderBottom: '1px solid', borderColor: CARD_BORDER, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' } }}
      >
        <Tab label="Account" />
        <Tab label="CRM Configuration" />
        <Tab label="Integrations" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', p: 3, maxWidth: 520 }}>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: TEXT_DARK, mb: 1 }}>Account</Typography>
          <InfoRow label="Name" value={user?.username || '—'} />
          <InfoRow label="Email" value={user?.email || '—'} />
          <InfoRow label="Client" value={user?.clientName || '—'} />
          <InfoRow label="Role" value="Client" />
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', p: { xs: 2, sm: 3 } }}>
          <CrmConfigurationPanel clientKey={scopedClientKey} />
        </Box>
      )}

      {tab === 2 && (
        <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', p: { xs: 2, sm: 3 } }}>
          <IntegrationsPanel clientKey={scopedClientKey} />
        </Box>
      )}
    </Box>
  );
};

export default SettingsPage;
