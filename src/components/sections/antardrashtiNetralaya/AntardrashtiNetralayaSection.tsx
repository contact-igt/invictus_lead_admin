import { MouseEvent, useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  useAntardrashtiNetralayaLead,
  useAntardrashtiNetralayaLeads,
  useAntardrashtiNetralayaSummary,
  useCreateAntardrashtiNetralayaLead,
  useDeleteAntardrashtiNetralayaLead,
  useExportAntardrashtiNetralayaLeads,
  useUpdateAntardrashtiNetralayaLead,
} from 'hooks/useAntardrashtiNetralayaQuery';
import type { AntardrashtiNetralayaFormValues } from 'schemas/antardrashtiNetralayaSchema';
import type {
  AntardrashtiNetralayaExportFormat,
  AntardrashtiNetralayaLead,
  AntardrashtiNetralayaListParams,
  AntardrashtiNetralayaSummary,
  AntardrashtiNetralayaService,
} from 'types/antardrashtiNetralaya';
import { resolveClientModuleKey } from 'utils/clientModuleResolver';
import AntardrashtiNetralayaDeleteDialog from './AntardrashtiNetralayaDeleteDialog';
import AntardrashtiNetralayaFormDrawer, {
  AntardrashtiNetralayaDrawerMode,
} from './AntardrashtiNetralayaFormDrawer';
import AntardrashtiNetralayaTable from './AntardrashtiNetralayaTable';
import {
  ANTARDRASHTI_NETRALAYA_COLOR,
  ANTARDRASHTI_NETRALAYA_SERVICES,
  cleanAntardrashtiPayload,
  extractDownloadFilename,
  getAntardrashtiErrorMessage,
  getAntardrashtiExportErrorMessage,
  getAntardrashtiExportFallbackName,
  hasAntardrashtiFilters,
} from './antardrashtiNetralayaUtils';

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: string;
  helperText?: string;
  loading?: boolean;
}

const SummaryCard = ({ label, value, icon, helperText, loading = false }: SummaryCardProps) => (
  <Card variant="outlined" sx={{ width: '100%', minWidth: 0, minHeight: 92, borderRadius: 3 }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
        <Box minWidth={0} flex={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ wordBreak: 'normal', overflowWrap: 'break-word' }}
          >
            {label}
          </Typography>
          {loading ? (
            <>
              <Skeleton variant="text" width="60%" height={32} sx={{ mt: 0.25 }} />
              {helperText !== undefined ? <Skeleton variant="text" width="44%" height={18} /> : null}
            </>
          ) : (
            <>
              <Typography variant="h6" fontWeight={750} mt={0.25} noWrap title={String(value)}>
                {value}
              </Typography>
              {helperText ? (
                <Typography variant="caption" color="text.secondary" display="block" mt={0.35} noWrap>
                  {helperText}
                </Typography>
              ) : null}
            </>
          )}
        </Box>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(ANTARDRASHTI_NETRALAYA_COLOR, 0.1),
            color: ANTARDRASHTI_NETRALAYA_COLOR,
            flexShrink: 0,
          }}
        >
          <IconifyIcon icon={icon} width={20} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const EMPTY_SUMMARY: AntardrashtiNetralayaSummary = {
  total_leads: 0,
  today_leads: 0,
  this_month_leads: 0,
  top_service: null,
  top_service_count: 0,
};

const AntardrashtiNetralayaSection = () => {
  const { clientKey } = useParams<{ clientKey: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const isAntardrashtiModule = resolveClientModuleKey(clientKey) === 'antardrashti_netralaya';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [service, setService] = useState<AntardrashtiNetralayaService | ''>('');
  const [utmSource, setUtmSource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<AntardrashtiNetralayaDrawerMode>('create');
  const [selectedLead, setSelectedLead] = useState<AntardrashtiNetralayaLead | null>(null);
  const [deleteLead, setDeleteLead] = useState<AntardrashtiNetralayaLead | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 450);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params: AntardrashtiNetralayaListParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    service: service || undefined,
    utm_source: utmSource.trim() || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  };

  const leadsQuery = useAntardrashtiNetralayaLeads(clientKey, params, isAntardrashtiModule);
  const summaryQuery = useAntardrashtiNetralayaSummary(clientKey, params, isAntardrashtiModule);
  const detailQuery = useAntardrashtiNetralayaLead(
    clientKey,
    selectedLead?.id ?? null,
    isAntardrashtiModule && drawerOpen && drawerMode === 'view',
  );
  const createMutation = useCreateAntardrashtiNetralayaLead(clientKey);
  const updateMutation = useUpdateAntardrashtiNetralayaLead(clientKey);
  const deleteMutation = useDeleteAntardrashtiNetralayaLead(clientKey);
  const exportMutation = useExportAntardrashtiNetralayaLeads(clientKey);

  const response = leadsQuery.data;
  const rows = response?.data ?? [];
  const summary = summaryQuery.data?.data ?? EMPTY_SUMMARY;
  const summaryLoading = !summaryQuery.data && (summaryQuery.isLoading || summaryQuery.isFetching);
  const summaryUnavailable = summaryQuery.isError;
  const pagination = response?.pagination ?? {
    page,
    limit,
    total: 0,
    totalPages: 0,
  };

  useEffect(() => {
    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedLead(null);
    setDrawerMode('create');
  };

  const openDrawer = (mode: AntardrashtiNetralayaDrawerMode, lead: AntardrashtiNetralayaLead | null = null) => {
    setSelectedLead(lead);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const handleSubmit = (values: AntardrashtiNetralayaFormValues) => {
    const payload = cleanAntardrashtiPayload(values);

    if (drawerMode === 'edit' && selectedLead) {
      updateMutation.mutate(
        { id: selectedLead.id, payload },
        { onSuccess: closeDrawer },
      );
      return;
    }

    createMutation.mutate(payload, { onSuccess: closeDrawer });
  };

  const handleDelete = () => {
    if (!deleteLead) return;
    deleteMutation.mutate(deleteLead.id, {
      onSuccess: () => setDeleteLead(null),
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setService('');
    setUtmSource('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const updateDate = (setter: (value: string) => void) => (value: Dayjs | null) => {
    setter(value?.isValid() ? value.format('YYYY-MM-DD') : '');
    setPage(1);
  };

  const handlePaginationChange = (nextPage: number, nextLimit: number) => {
    if (nextLimit !== limit) {
      setLimit(nextLimit);
      setPage(1);
      return;
    }
    setPage(nextPage);
  };

  const handleOpenExportMenu = (event: MouseEvent<HTMLElement>) => {
    if (isExporting) return;
    setExportMenuAnchor(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = async (format: AntardrashtiNetralayaExportFormat) => {
    handleCloseExportMenu();
    setIsExporting(true);

    try {
      const exportParams = {
        search: debouncedSearch || undefined,
        service: service || undefined,
        utm_source: utmSource.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };
      const response = await exportMutation.mutateAsync({ format, params: exportParams });
      const contentType = response.headers['content-type'] || (format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8');
      const fileName = extractDownloadFilename(
        response.headers['content-disposition'],
        getAntardrashtiExportFallbackName(format),
      );
      const blob = new Blob([response.data], { type: contentType });

      saveAs(blob, fileName);
      enqueueSnackbar(
        `Antardrashti Netralaya leads exported as ${format.toUpperCase()} successfully.`,
        { variant: 'success' },
      );
    } catch (error) {
      enqueueSnackbar(getAntardrashtiExportErrorMessage(error), { variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAntardrashtiModule) {
    return (
      <Alert severity="error">
        This page is available only for the Antardrashti Netralaya client module.
      </Alert>
    );
  }

  const activeFilters = hasAntardrashtiFilters(params);
  const drawerLead = detailQuery.data?.data ?? selectedLead;
  const mutationLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        p: { xs: 2, md: 3 },
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          p: { xs: 2.25, md: 3 },
          borderRadius: 3,
          bgcolor: alpha(ANTARDRASHTI_NETRALAYA_COLOR, 0.035),
          borderColor: alpha(ANTARDRASHTI_NETRALAYA_COLOR, 0.18),
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          sx={{ width: '100%', minWidth: 0 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.75} sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                color: 'common.white',
                bgcolor: ANTARDRASHTI_NETRALAYA_COLOR,
              }}
            >
              <IconifyIcon icon="hugeicons:view" width={24} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h4"
                fontWeight={750}
                sx={{
                  fontSize: { xs: '1.55rem', md: '2rem' },
                  whiteSpace: 'normal',
                  wordBreak: 'normal',
                  overflowWrap: 'break-word',
                }}
              >
                Antardrashti Netralaya
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.35}>
                Manage website enquiries and service leads
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.25} flexWrap="wrap" justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleOpenExportMenu}
              disabled={isExporting}
              startIcon={
                isExporting ? <CircularProgress size={16} color="inherit" /> : <IconifyIcon icon="mdi:download-outline" />
              }
              endIcon={!isExporting ? <IconifyIcon icon="mdi:chevron-down" /> : undefined}
              sx={{
                borderColor: alpha(ANTARDRASHTI_NETRALAYA_COLOR, 0.28),
                color: ANTARDRASHTI_NETRALAYA_COLOR,
                flexShrink: 0,
                '&:hover': {
                  borderColor: ANTARDRASHTI_NETRALAYA_COLOR,
                  bgcolor: alpha(ANTARDRASHTI_NETRALAYA_COLOR, 0.04),
                },
              }}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button
              variant="contained"
              startIcon={<IconifyIcon icon="mdi:plus" />}
              onClick={() => openDrawer('create')}
              sx={{
                bgcolor: ANTARDRASHTI_NETRALAYA_COLOR,
                flexShrink: 0,
                '&:hover': { bgcolor: alpha(ANTARDRASHTI_NETRALAYA_COLOR, 0.88) },
              }}
            >
              Add Lead
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleCloseExportMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled={isExporting} onClick={() => handleExport('csv')}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <IconifyIcon icon="mdi:file-delimited-outline" width={18} />
            <Typography variant="inherit">Export as CSV</Typography>
          </Stack>
        </MenuItem>
        <MenuItem disabled={isExporting} onClick={() => handleExport('pdf')}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <IconifyIcon icon="mdi:file-pdf-box" width={18} />
            <Typography variant="inherit">Export as PDF</Typography>
          </Stack>
        </MenuItem>
      </Menu>

      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        <SummaryCard
          label="Total Leads"
          value={summaryUnavailable ? '-' : summary.total_leads}
          icon="hugeicons:user-multiple"
          loading={summaryLoading}
        />
        <SummaryCard
          label="Today's Leads"
          value={summaryUnavailable ? '-' : summary.today_leads}
          icon="hugeicons:calendar-03"
          loading={summaryLoading}
        />
        <SummaryCard
          label="This Month"
          value={summaryUnavailable ? '-' : summary.this_month_leads}
          icon="hugeicons:calendar-04"
          loading={summaryLoading}
        />
        <SummaryCard
          label="Top Service"
          value={summaryUnavailable ? '-' : summary.top_service || 'No data'}
          helperText={
            summaryUnavailable
              ? undefined
              : summary.top_service
                ? `${summary.top_service_count} leads`
                : undefined
          }
          icon="hugeicons:medical-mask"
          loading={summaryLoading}
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{ width: '100%', maxWidth: '100%', minWidth: 0, p: 2, borderRadius: 3 }}
      >
        <Box
          sx={{
            width: '100%',
            minWidth: 0,
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(auto-fit, minmax(180px, 1fr))',
            },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, mobile number, service or UTM source"
            sx={{
              minWidth: 0,
              gridColumn: { xs: '1 / -1', lg: 'span 2' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconifyIcon icon="mdi:magnify" width={19} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            fullWidth
            size="small"
            label="Service"
            value={service}
            sx={{ minWidth: 0 }}
            onChange={(event) => {
              setService(event.target.value as AntardrashtiNetralayaService | '');
              setPage(1);
            }}
          >
            <MenuItem value="">All Services</MenuItem>
            {ANTARDRASHTI_NETRALAYA_SERVICES.map((serviceOption) => (
              <MenuItem key={serviceOption} value={serviceOption}>
                {serviceOption}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            size="small"
            label="UTM Source"
            value={utmSource}
            sx={{ minWidth: 0 }}
            onChange={(event) => {
              setUtmSource(event.target.value);
              setPage(1);
            }}
          />
          <DatePicker
            label="Start Date"
            value={startDate ? dayjs(startDate) : null}
            onChange={updateDate(setStartDate)}
            maxDate={endDate ? dayjs(endDate) : undefined}
            slotProps={{ textField: { size: 'small', fullWidth: true, sx: { minWidth: 0 } } }}
          />
          <DatePicker
            label="End Date"
            value={endDate ? dayjs(endDate) : null}
            onChange={updateDate(setEndDate)}
            minDate={startDate ? dayjs(startDate) : undefined}
            disabled={!startDate}
            slotProps={{ textField: { size: 'small', fullWidth: true, sx: { minWidth: 0 } } }}
          />
          <Button
            variant="text"
            color="inherit"
            onClick={clearFilters}
            disabled={!activeFilters && !searchInput}
            startIcon={<IconifyIcon icon="mdi:filter-off-outline" />}
            sx={{ minWidth: 0, width: { xs: '100%', lg: 'auto' } }}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      {leadsQuery.isError ? (
        <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => leadsQuery.refetch()}>
                Retry
              </Button>
            }
          >
            {getAntardrashtiErrorMessage(leadsQuery.error, 'Unable to load Antardrashti Netralaya leads.')}
          </Alert>
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={{ width: '100%', maxWidth: '100%', minWidth: 0, borderRadius: 3, overflow: 'hidden' }}
        >
          <AntardrashtiNetralayaTable
            rows={rows}
            page={page}
            limit={limit}
            total={pagination.total}
            isLoading={leadsQuery.isLoading || leadsQuery.isFetching}
            hasFilters={activeFilters}
            onPaginationChange={handlePaginationChange}
            onView={(lead) => openDrawer('view', lead)}
            onEdit={(lead) => openDrawer('edit', lead)}
            onDelete={setDeleteLead}
          />
        </Paper>
      )}

      <AntardrashtiNetralayaFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        lead={drawerLead}
        isLoading={mutationLoading || (drawerMode === 'view' && detailQuery.isLoading)}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />
      <AntardrashtiNetralayaDeleteDialog
        open={Boolean(deleteLead)}
        lead={deleteLead}
        isLoading={deleteMutation.isLoading}
        onClose={() => setDeleteLead(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default AntardrashtiNetralayaSection;





