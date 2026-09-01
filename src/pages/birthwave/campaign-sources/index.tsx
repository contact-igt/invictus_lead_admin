import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { useBirthwaveScope } from '../useBirthwaveScope';
import { useBirthwaveDashboardQuery } from 'components/hooks/useBirthwaveQuery';
import { LEAD_SOURCE_LABELS } from '../constants';
import PortalPageHeader from '../PortalPageHeader';

const CARD_BORDER = '#E5E7EB';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const GREEN = '#29AF81';

const CampaignSourcesPage = () => {
  const { hasScope, scopedClientKey } = useBirthwaveScope();
  const { data: dashboard, isLoading } = useBirthwaveDashboardQuery(scopedClientKey, {}, { enabled: hasScope });
  const sources = dashboard?.lead_sources ?? [];

  if (!hasScope) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Please select a client.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <PortalPageHeader title="Campaign Sources" subtitle="Where Birthwave leads are coming from" />

      <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', p: { xs: 2.5, sm: 3.5 } }}>
        {isLoading ? (
          <Typography sx={{ color: TEXT_MUTED }}>Loading...</Typography>
        ) : sources.length === 0 ? (
          <Typography sx={{ color: TEXT_MUTED }}>No lead source data yet.</Typography>
        ) : (
          <Stack direction="column" spacing={2.5}>
            {sources.map((source) => (
              <Box key={source.source}>
                <Stack direction="row" justifyContent="space-between" mb={0.75}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT_DARK }}>
                    {LEAD_SOURCE_LABELS[source.source] || source.source}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: TEXT_MUTED }}>
                    {source.count} leads · {source.percentage}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={source.percentage}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': { bgcolor: GREEN, borderRadius: 999 },
                  }}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default CampaignSourcesPage;
