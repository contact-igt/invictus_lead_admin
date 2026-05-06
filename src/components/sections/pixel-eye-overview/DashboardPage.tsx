import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from 'react-query';
import KPICards from './KPICards';
import StatusBreakdown from './StatusBreakdown';
import FunnelChart from './FunnelChart';
import TrendChart from './TrendChart';
import ActionPanel from './ActionPanel';
import FollowUpPanel from './FollowUpPanel';
import { _axios } from 'helper/axios';
import { DashboardFilters, KPIItem, LeadRecord } from './types';
import { applyDashboardFilters, buildDashboardMetrics, getAvailableAgents } from './dashboardUtils';
import type { AxiosResponse } from 'axios';
import IconifyIcon from 'components/base/IconifyIcon';

type ExportFormat = 'csv' | 'pdf';

const fetchPixelEyeLeads = async (): Promise<LeadRecord[]> => {
  const response = await _axios('get', '/pixeleye');

  if (Array.isArray(response)) {
    return response as LeadRecord[];
  }

  if (Array.isArray(response?.data)) {
    return response.data as LeadRecord[];
  }

  return [];
};

const controlInputSx = {
  minWidth: { xs: '100%', sm: 180 },
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    minHeight: 42,
  },
  '& .MuiInputBase-input': {
    py: 1.15,
  },
  '& .MuiFormHelperText-root': {
    mx: 0.25,
  },
};

const DashboardPage = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateFrom: '',
    dateTo: '',
    agent: '',
  });
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [exportError, setExportError] = useState<string>('');

  const { data: leads = [], isLoading, isError } = useQuery<LeadRecord[]>(
    ['pixelEyeOverviewLeads'],
    fetchPixelEyeLeads,
    { staleTime: 3 * 60 * 1000 },
  );

  const availableAgents = useMemo(() => getAvailableAgents(leads), [leads]);
  const hasInvalidDateRange = Boolean(filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo);
  const activeFilterCount = [filters.dateFrom, filters.dateTo, filters.agent].filter(Boolean).length;

  const filteredLeads = useMemo(
    () => (hasInvalidDateRange ? [] : applyDashboardFilters(leads, filters)),
    [hasInvalidDateRange, leads, filters],
  );
  const metrics = useMemo(() => buildDashboardMetrics(filteredLeads), [filteredLeads]);

  const total = metrics.kpis.totalLeads;
  const contactedRate = total > 0 ? Math.round((metrics.kpis.contactedLeads / total) * 100) : 0;
  const appointmentRate = total > 0 ? Math.round((metrics.kpis.appointments / total) * 100) : 0;
  const lostRate = total > 0 ? Math.round((metrics.kpis.lostLeads / total) * 100) : 0;

  const kpiItems: KPIItem[] = [
    {
      key: 'total',
      label: 'Total Leads',
      value: metrics.kpis.totalLeads,
      icon: 'mdi:account-multiple-outline',
      color: 'primary',
      subtext: 'All records in selected filters',
    },
    {
      key: 'contacted',
      label: 'Contacted Leads',
      value: metrics.kpis.contactedLeads,
      icon: 'mdi:phone-check-outline',
      color: 'success',
      subtext: `${contactedRate}% contactability`,
    },
    {
      key: 'appointments',
      label: 'Appointments',
      value: metrics.kpis.appointments,
      icon: 'mdi:calendar-check-outline',
      color: 'warning',
      subtext: `${appointmentRate}% appointment conversion`,
    },
    {
      key: 'lost',
      label: 'Lost Leads',
      value: metrics.kpis.lostLeads,
      icon: 'mdi:alert-circle-outline',
      color: 'error',
      subtext: `${lostRate}% loss ratio`,
    },
  ];

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ dateFrom: '', dateTo: '', agent: '' });
    setExportError('');
  };

  const extractFileNameFromDisposition = (headerValue?: string): string => {
    if (!headerValue) return '';

    const utfMatch = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) {
      return decodeURIComponent(utfMatch[1]);
    }

    const plainMatch = headerValue.match(/filename="?([^";]+)"?/i);
    return plainMatch?.[1] || '';
  };

  const fallbackFileName = (format: ExportFormat) => {
    const datePart = new Date().toISOString().slice(0, 10);
    return `pixeleye-overview-${datePart}.${format}`;
  };

  const triggerDownload = (blob: Blob, fileName: string) => {
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const handleExport = async (format: ExportFormat) => {
    setExportError('');
    setExportingFormat(format);

    try {
      const params = {
        format,
        ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
        ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
        ...(filters.agent ? { agent: filters.agent } : {}),
      };

      const response = (await _axios(
        'get',
        '/pixeleye/export',
        undefined,
        'application/json',
        params,
        { responseType: 'blob', returnRawResponse: true },
      )) as AxiosResponse<Blob>;

      const fallbackType = format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8';
      const contentType = (response.headers?.['content-type'] as string | undefined) || fallbackType;
      const disposition = response.headers?.['content-disposition'] as string | undefined;
      const derivedFileName = extractFileNameFromDisposition(disposition) || fallbackFileName(format);
      const responseData = response.data;
      const blob = responseData instanceof Blob ? responseData : new Blob([responseData], { type: contentType });

      triggerDownload(blob, derivedFileName);
    } catch (error) {
      setExportError('Failed to download export file. Please try again.');
      // Keep this log for debugging network/file response issues.
      console.error('Export download failed:', error);
    } finally {
      setExportingFormat(null);
    }
  };

  if (isError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Unable to load dashboard data right now. Please refresh and try again.
      </Alert>
    );
  }

  return (
    <Stack
      direction="column"
      spacing={2.5}
      sx={{
        width: '100%',
        p: { xs: 2, md: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'visible',
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #F4FAFF 0%, #EEF5FF 52%, #F5FCF1 100%)',
          border: '1px solid',
          borderColor: 'rgba(30, 64, 175, 0.12)',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.09)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 240,
            height: 240,
            top: -120,
            right: -90,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(56, 189, 248, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <Grid container spacing={2.5} alignItems="stretch" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} lg={4.5}>
            <Stack direction="column" spacing={1.5} height="100%" justifyContent="center">
              <Chip
                size="small"
                label="PixelEye Analytics"
                sx={{
                  alignSelf: 'flex-start',
                  fontWeight: 700,
                  color: '#14532D',
                  bgcolor: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              />

              <Typography variant="h4" fontWeight={900} lineHeight={1.15}>
                Lead Tracking Overview
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
                Premium insight workspace for lead quality, conversion, and follow-up performance.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  size="small"
                  label={`Records In View: ${filteredLeads.length.toLocaleString()}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`Active Filters: ${activeFilterCount}`}
                  color="success"
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={7.5}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                p: { xs: 1.8, md: 2.2 },
                overflow: 'visible',
                border: '1px solid',
                borderColor: 'rgba(15, 23, 42, 0.08)',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Stack direction="column" spacing={1.6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconifyIcon icon="mdi:filter-variant" sx={{ color: 'text.secondary', fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                    Filter And Export
                  </Typography>
                </Stack>

                <Grid container spacing={1.4} alignItems="flex-start">
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      type="date"
                      size="small"
                      label="From"
                      value={filters.dateFrom}
                      onChange={(event) => handleFilterChange('dateFrom', event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      sx={controlInputSx}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      type="date"
                      size="small"
                      label="To"
                      value={filters.dateTo}
                      onChange={(event) => handleFilterChange('dateTo', event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={hasInvalidDateRange}
                      helperText={hasInvalidDateRange ? 'To date should be same or later than From date' : undefined}
                      fullWidth
                      sx={controlInputSx}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      size="small"
                      label="Agent"
                      value={filters.agent}
                      onChange={(event) => handleFilterChange('agent', event.target.value)}
                      fullWidth
                      sx={controlInputSx}
                    >
                      <MenuItem value="">All Agents</MenuItem>
                      {availableAgents.map((agent) => (
                        <MenuItem key={agent} value={agent}>
                          {agent}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Divider />

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.2}
                  justifyContent="flex-end"
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    disabled={activeFilterCount === 0}
                    startIcon={<IconifyIcon icon="mdi:filter-remove-outline" />}
                    sx={{ borderRadius: 2, minWidth: 140 }}
                  >
                    Clear Filters
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => handleExport('csv')}
                    disabled={isLoading || hasInvalidDateRange || exportingFormat !== null}
                    startIcon={<IconifyIcon icon="mdi:file-delimited-outline" />}
                    sx={{ borderRadius: 2, minWidth: 150, boxShadow: '0 10px 24px rgba(22, 163, 74, 0.26)' }}
                  >
                    {exportingFormat === 'csv' ? 'Downloading CSV...' : 'Export CSV'}
                  </Button>

                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleExport('pdf')}
                    disabled={isLoading || hasInvalidDateRange || exportingFormat !== null}
                    startIcon={<IconifyIcon icon="mdi:file-pdf-box" />}
                    sx={{ borderRadius: 2, minWidth: 150 }}
                  >
                    {exportingFormat === 'pdf' ? 'Downloading PDF...' : 'Export PDF'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {hasInvalidDateRange && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Date range is invalid. Adjust the From and To dates to get accurate results.
        </Alert>
      )}

      {exportError ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {exportError}
        </Alert>
      ) : null}

      {!isLoading && !hasInvalidDateRange && filteredLeads.length === 0 && leads.length > 0 && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No leads match the current filters. Try changing the date range or agent.
        </Alert>
      )}

      <KPICards items={kpiItems} loading={isLoading} />

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <StatusBreakdown categories={metrics.statusBreakdown} loading={isLoading} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ActionPanel
            todayFollowUps={metrics.actions.todayFollowUps}
            notAnswering={metrics.actions.notAnswering}
            highPriorityCount={metrics.actions.highPriorityCount}
            highPriorityLeads={metrics.actions.highPriorityLeads}
            loading={isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <FunnelChart stages={metrics.funnel} loading={isLoading} />
        </Grid>
        <Grid item xs={12} md={7}>
          <TrendChart points={metrics.trend} loading={isLoading} />
        </Grid>
      </Grid>

      <FollowUpPanel followUps={metrics.followUps} loading={isLoading} />
    </Stack>
  );
};

export default DashboardPage;
