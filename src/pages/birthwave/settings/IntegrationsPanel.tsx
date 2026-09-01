import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useCrmIntegrationsQuery, useUpdateCrmIntegrationMutation } from 'components/hooks/useCrmQuery';
import { CrmIntegration, CrmIntegrationStatus, CrmProvider } from 'services/crm';

const CARD_BORDER = '#E5E7EB';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const GREEN = '#29AF81';

const PROVIDER_META: Record<CrmProvider, { name: string; icon: string; description: string; configKey: string; configLabel: string }> = {
  runo: { name: 'Runo', icon: 'hugeicons:call-02', description: 'Calling & recordings', configKey: 'api_key', configLabel: 'API Key' },
  meta: { name: 'Meta', icon: 'hugeicons:facebook-01', description: 'Lead ads', configKey: 'page_access_token', configLabel: 'Page Access Token' },
  website: { name: 'Website', icon: 'hugeicons:globe-02', description: 'Form submissions', configKey: 'api_key', configLabel: 'API Key' },
  whatsapp: { name: 'WhatsApp / WhatsNexus', icon: 'hugeicons:whatsapp', description: 'Chat leads', configKey: 'api_key', configLabel: 'API Key' },
};

const STATUS_META: Record<CrmIntegrationStatus, { label: string; bg: string; fg: string }> = {
  not_configured: { label: 'Not Configured', bg: '#F1F5F9', fg: TEXT_MUTED },
  connected: { label: 'Connected', bg: 'rgba(41,175,129,0.12)', fg: GREEN },
  error: { label: 'Error', bg: '#FEF2F2', fg: '#EF4444' },
};

interface IntegrationsPanelProps {
  clientKey: string | undefined;
}

const IntegrationsPanel = ({ clientKey }: IntegrationsPanelProps) => {
  const { data: integrations = [], isLoading } = useCrmIntegrationsQuery(clientKey);
  const { mutate: updateIntegration, isLoading: isSaving } = useUpdateCrmIntegrationMutation(clientKey);
  const [editing, setEditing] = useState<CrmIntegration | null>(null);
  const [configValue, setConfigValue] = useState('');
  const [enabled, setEnabled] = useState(false);

  const openConfigure = (integration: CrmIntegration) => {
    setEditing(integration);
    setConfigValue('');
    setEnabled(integration.enabled);
  };

  const closeDialog = () => setEditing(null);

  const handleSave = () => {
    if (!editing) return;
    const meta = PROVIDER_META[editing.provider];
    const config = configValue ? { [meta.configKey]: configValue } : undefined;
    updateIntegration({ provider: editing.provider, data: { enabled, config } }, { onSuccess: closeDialog });
  };

  return (
    <Box>
      <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED, mb: 2 }}>
        Connect lead sources to Birthwave. Status reflects the real connection state — a provider only shows Connected after it has actually processed an event.
      </Typography>

      {isLoading ? (
        <Typography sx={{ color: TEXT_MUTED, fontSize: '0.85rem' }}>Loading integrations...</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {integrations.map((integration) => {
            const meta = PROVIDER_META[integration.provider];
            const status = STATUS_META[integration.status];
            return (
              <Stack
                key={integration.provider}
                direction="column"
                spacing={1.25}
                sx={{ p: 2, border: '1px solid', borderColor: CARD_BORDER, borderRadius: '10px' }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon icon={meta.icon} width={18} height={18} color={TEXT_MUTED} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT_DARK }}>{meta.name}</Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED }}>{meta.description}</Typography>
                    </Box>
                  </Stack>
                  <Chip label={status.label} size="small" sx={{ fontSize: '0.65rem', height: 22, bgcolor: status.bg, color: status.fg, fontWeight: 700 }} />
                </Stack>

                {integration.status === 'error' && integration.last_error && (
                  <Typography sx={{ fontSize: '0.72rem', color: '#EF4444' }}>{integration.last_error}</Typography>
                )}
                {integration.config_keys_set.length > 0 && (
                  <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED }}>{meta.configLabel}: Configured</Typography>
                )}

                <Button size="small" variant="outlined" onClick={() => openConfigure(integration)} sx={{ textTransform: 'none', alignSelf: 'flex-start', borderColor: CARD_BORDER, color: TEXT_DARK }}>
                  Configure
                </Button>
              </Stack>
            );
          })}
        </Box>
      )}

      <Dialog open={Boolean(editing)} onClose={closeDialog} fullWidth maxWidth="xs">
        {editing && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>Configure {PROVIDER_META[editing.provider].name}</DialogTitle>
            <DialogContent>
              <Stack direction="column" spacing={2.25} sx={{ pt: 1 }}>
                <FormControlLabel
                  control={<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
                  label="Enabled"
                />
                <TextField
                  fullWidth
                  type="password"
                  label={PROVIDER_META[editing.provider].configLabel}
                  placeholder={editing.config_keys_set.length > 0 ? '•••••••• (leave blank to keep current value)' : 'Not set'}
                  value={configValue}
                  onChange={(e) => setConfigValue(e.target.value)}
                />
                <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED }}>
                  This value is never displayed once saved. Status only becomes Connected after this provider actually sends real data through the ingestion pipeline.
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={closeDialog} color="inherit">Cancel</Button>
              <Button variant="contained" disabled={isSaving} onClick={handleSave} sx={{ bgcolor: GREEN, boxShadow: 'none', '&:hover': { bgcolor: '#218D68', boxShadow: 'none' } }}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default IntegrationsPanel;
