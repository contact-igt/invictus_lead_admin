import { useMemo, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import useColorMode from 'hooks/useColorMode';
import { normalizeClientKey } from 'utils/clientKey';
import { usePixelEyeLeadQuery } from 'components/hooks/usePixelEyeQuery';

const formatDateTime = (value?: string | null): string => {
  if (!value) return '---';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY, hh:mm A') : String(value);
};

const formatDateOnly = (value?: string | null): string => {
  if (!value) return '---';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : String(value);
};

const DetailCard = ({
  title,
  subtitle,
  children,
  mode,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  mode: 'dark' | 'light';
}) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 4,
      p: 3,
      border: '1px solid',
      borderColor: mode === 'dark' ? '#17261F' : 'divider',
      background: mode === 'dark' ? '#0B1410' : '#ffffff',
      boxShadow: mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.25)' : '0 10px 30px rgba(15,23,42,0.06)',
    }}
  >
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: mode === 'dark' ? '#F8FAFC' : '#0F172A' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ mt: 0.5, color: mode === 'dark' ? '#94A3B8' : '#64748B' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {children}
  </Paper>
);

const PixelEyeLeadDetailPage = () => {
  const { mode } = useColorMode();
  const navigate = useNavigate();
  const { clientKey, leadId } = useParams<{ clientKey?: string; leadId?: string }>();
  const activeClientKey = normalizeClientKey(clientKey || 'pixeleye');

  const {
    data: lead,
    isLoading,
    isError,
    error,
  } = usePixelEyeLeadQuery(leadId, activeClientKey);

  const leadNotFound = !isLoading && !isError && !lead;

  const overviewRows = useMemo(
    () => [
      { label: 'Date', value: formatDateOnly(lead?.date) },
      { label: 'Time', value: lead?.time || '---' },
      { label: 'Call ID', value: lead?.call_id || '---' },
      { label: 'Customer Name', value: lead?.customer_name || '---' },
      { label: 'Phone Number', value: lead?.phone_number || '---' },
      { label: 'Agent Name', value: lead?.agent_name || '---' },
      { label: 'Status', value: lead?.status || '---' },
      { label: 'Source', value: lead?.source || '---' },
      { label: 'Type of Enquiry', value: lead?.type_of_enquiry || '---' },
      { label: 'Created Date', value: formatDateTime(lead?.createdAt || lead?.created_at) },
      { label: 'Updated Date', value: formatDateTime(lead?.updatedAt || lead?.updated_at) },
    ],
    [lead],
  );

  const followUpRows = useMemo(
    () => [
      { label: 'Follow-up Date', value: formatDateOnly(lead?.follow_up_date) },
      { label: 'Day 1', value: lead?.day_1 || '---' },
      { label: 'Day 2', value: lead?.day_2 || '---' },
      { label: 'Day 3', value: lead?.day_3 || '---' },
      { label: 'Day 4', value: lead?.day_4 || '---' },
      { label: 'Day 5', value: lead?.day_5 || '---' },
      { label: 'Follow-up Change Count', value: String(lead?.follow_up_change_count ?? '---') },
    ],
    [lead],
  );

  const statusLabel = lead?.status || '---';
  const pageTitle = lead?.customer_name || 'Lead Details';
  const pageSubtitle = 'Single lead view for call details, follow-up state, and next actions.';

  const goBack = () => {
    navigate(`/pages/d/${activeClientKey}/leads`);
  };

  if (!leadId) {
    return (
      <Box sx={{ minHeight: '100vh', px: { xs: 2, md: 3.5 }, py: { xs: 2, md: 3.5 } }}>
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          Lead id is missing from the route.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: { xs: 2, md: 3.5 },
        py: { xs: 2, md: 3.5 },
        background: mode === 'dark'
          ? 'linear-gradient(180deg, #08110D 0%, #0B1410 40%, #050807 100%)'
          : 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
        color: mode === 'dark' ? '#E5F6EA' : '#0F172A',
        }}
      >
      <Stack spacing={3} sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* <Button
          variant="text"
          onClick={goBack}
          startIcon={<IconifyIcon icon="mdi:arrow-left" />}
          sx={{
            alignSelf: 'flex-start',
            textTransform: 'none',
            fontWeight: 700,
            color: mode === 'dark' ? '#86EFAC' : '#156A45',
          }}
        >
          Back to PixelEye
          </Button> */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2.5, md: 3.5 },
            border: '1px solid',
            borderColor: mode === 'dark' ? '#17261F' : 'divider',
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #0B1410 0%, #0E1814 55%, #08110D 100%)'
              : '#ffffff',
            boxShadow: mode === 'dark' ? '0 18px 40px rgba(0,0,0,0.28)' : '0 18px 40px rgba(15,23,42,0.08)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: '0.16em', color: mode === 'dark' ? '#86EFAC' : '#156A45', fontWeight: 800 }}>
                Lead Details
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900, color: mode === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                {pageTitle}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: mode === 'dark' ? '#94A3B8' : '#64748B' }}>
                {pageSubtitle}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
              <Chip
                label={statusLabel}
                sx={{
                  fontWeight: 800,
                  borderRadius: 999,
                  backgroundColor: mode === 'dark' ? 'rgba(34,197,94,0.1)' : '#E8F5E9',
                  color: mode === 'dark' ? '#86EFAC' : '#156A45',
                  border: `1px solid ${mode === 'dark' ? 'rgba(34,197,94,0.18)' : '#A5D6A7'}`,
                }}
              />
              <Chip
                label={`Lead #${leadId}`}
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  borderRadius: 999,
                  color: mode === 'dark' ? '#CBD5E1' : '#334155',
                  borderColor: mode === 'dark' ? '#203528' : '#CBD5E1',
                }}
              />
            </Stack>
          </Stack>

          {isError && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 3 }}>
              {((error as any)?.response?.data?.message as string) || (error as any)?.message || 'Failed to load lead details.'}
            </Alert>
          )}

          {leadNotFound && (
            <Alert severity="warning" sx={{ mt: 3, borderRadius: 3 }}>
              Lead not found.
            </Alert>
          )}
        </Paper>

        {isLoading ? (
          <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress size={36} sx={{ color: '#156A45' }} />
              <Typography variant="body2" sx={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}>
                Loading lead details...
              </Typography>
            </Stack>
          </Box>
        ) : leadNotFound ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 3,
              border: '1px solid',
              borderColor: mode === 'dark' ? '#17261F' : 'divider',
              background: mode === 'dark' ? '#0B1410' : '#ffffff',
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: mode === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                Lead not found
              </Typography>
              <Typography variant="body2" sx={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}>
                The lead detail page opened, but no record was returned for this id.
              </Typography>
              <Button
                variant="contained"
                onClick={goBack}
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 700,
                  backgroundColor: '#156A45',
                }}
              >
                Back to PixelEye
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DetailCard
                title="Lead Overview"
                subtitle="Core lead and call information"
                mode={mode}
              >
                <Grid container spacing={2}>
                  {overviewRows.map((item) => (
                    <Grid item xs={12} sm={6} key={item.label}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: mode === 'dark' ? '#16251D' : '#E2E8F0',
                          background: mode === 'dark' ? '#070D0A' : '#F8FAFC',
                          minHeight: 92,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: mode === 'dark' ? '#94A3B8' : '#64748B', fontWeight: 700 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.75, fontWeight: 800, color: mode === 'dark' ? '#F8FAFC' : '#0F172A' }}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </DetailCard>
            </Grid>

            <Grid item xs={12}>
              <DetailCard
                title="Follow-up Details"
                subtitle="Current follow-up date and day-wise status flow"
                mode={mode}
              >
                <Grid container spacing={2}>
                  {followUpRows.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.label}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: mode === 'dark' ? '#16251D' : '#E2E8F0',
                          background: mode === 'dark' ? '#070D0A' : '#F8FAFC',
                          minHeight: 92,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: mode === 'dark' ? '#94A3B8' : '#64748B', fontWeight: 700 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.75, fontWeight: 800, color: mode === 'dark' ? '#F8FAFC' : '#0F172A' }}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </DetailCard>
            </Grid>

            {/* <Grid item xs={12} md={4}>
              <PlaceholderCard
                title="Follow-up History"
                text="Follow-up history will be added in next phase."
                mode={mode}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <PlaceholderCard
                title="Call Tracking"
                text="Call logs and missed follow-up status will be added in next phase."
                mode={mode}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <PlaceholderCard
                title="Actions"
                text="Actions will be added in next phase."
                mode={mode}
              />
            </Grid> */}
          </Grid>
        )}
      </Stack>
    </Box>
  );
};

export default PixelEyeLeadDetailPage;
