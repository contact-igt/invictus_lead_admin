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
  useCreateVlsMactMasterClassRegistration,
  useDeleteVlsMactMasterClassRegistration,
  useUpdateVlsMactMasterClassRegistration,
  useVlsMactMasterClassRegistration,
  useVlsMactMasterClassRegistrations,
  useVlsMactMasterClassSummary,
} from 'hooks/useVlsMactMasterClassQuery';
import { useAuth } from 'redux/selectors/auth/authSelector';
import type { VlsMactMasterClassFormValues } from 'schemas/vlsMactMasterClassSchema';
import { exportVlsMactMasterClassRegistrations } from 'services/vlsMactMasterClass.service';
import type {
  VlsMactMasterClassExportFormat,
  VlsMactMasterClassListParams,
  VlsMactMasterClassRegistration,
  VlsMactMasterClassSummary,
} from 'types/vlsMactMasterClass';
import { resolveClientModuleKey } from 'utils/clientModuleResolver';
import VlsMactMasterClassDeleteDialog from './VlsMactMasterClassDeleteDialog';
import VlsMactMasterClassFormDrawer, {
  VlsMactMasterClassDrawerMode,
} from './VlsMactMasterClassFormDrawer';
import VlsMactMasterClassTable from './VlsMactMasterClassTable';
import {
  VLS_MACT_COLOR,
  VLS_MACT_PAYMENT_STATUS_OPTIONS,
  cleanVlsMactPayload,
  extractDownloadFilename,
  getVlsMactErrorMessage,
  getVlsMactExportErrorMessage,
  getVlsMactExportFallbackName,
  hasVlsMactFilters,
} from './vlsMactMasterClassUtils';

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: string;
  loading?: boolean;
}

const SummaryCard = ({ label, value, icon, loading = false }: SummaryCardProps) => (
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
            <Skeleton variant="text" width="60%" height={32} sx={{ mt: 0.25 }} />
          ) : (
            <Typography variant="h6" fontWeight={750} mt={0.25} noWrap title={String(value)}>
              {value}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(VLS_MACT_COLOR, 0.1),
            color: VLS_MACT_COLOR,
            flexShrink: 0,
          }}
        >
          <IconifyIcon icon={icon} width={20} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const EMPTY_SUMMARY: VlsMactMasterClassSummary = {
  total_registrations: 0,
  today_registrations: 0,
  total_amount: 0,
  paid_registrations: 0,
};

const formatAmountMetric = (value: number) =>
  `\u20B9${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const VlsMactMasterClassSection = () => {
  const { clientKey } = useParams<{ clientKey: string }>();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const isVlsModule = resolveClientModuleKey(clientKey) === 'vls_law';
  const superAdminClientKey = user?.role === 'super-admin' ? clientKey : undefined;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [registeredStartDate, setRegisteredStartDate] = useState('');
  const [registeredEndDate, setRegisteredEndDate] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<VlsMactMasterClassDrawerMode>('create');
  const [selectedRegistration, setSelectedRegistration] =
    useState<VlsMactMasterClassRegistration | null>(null);
  const [deleteRegistration, setDeleteRegistration] =
    useState<VlsMactMasterClassRegistration | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 450);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params: VlsMactMasterClassListParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    payment_status: paymentStatus || undefined,
    registered_start_date: registeredStartDate || undefined,
    registered_end_date: registeredEndDate || undefined,
  };

  const registrationsQuery = useVlsMactMasterClassRegistrations(clientKey, params, isVlsModule);
  const summaryQuery = useVlsMactMasterClassSummary(clientKey, isVlsModule);
  const detailQuery = useVlsMactMasterClassRegistration(
    clientKey,
    selectedRegistration?.id ?? null,
    isVlsModule && drawerOpen && drawerMode === 'view',
  );
  const createMutation = useCreateVlsMactMasterClassRegistration(clientKey);
  const updateMutation = useUpdateVlsMactMasterClassRegistration(clientKey);
  const deleteMutation = useDeleteVlsMactMasterClassRegistration(clientKey);

  const response = registrationsQuery.data;
  const rows = response?.data ?? [];
  const summary = summaryQuery.data?.data ?? EMPTY_SUMMARY;
  const summaryLoading = !summaryQuery.data && (summaryQuery.isLoading || summaryQuery.isFetching);
  const summaryUnavailable = summaryQuery.isError;
  const pagination = response?.pagination ?? { page, limit, total: 0, totalPages: 0 };

  useEffect(() => {
    if (pagination.totalPages > 0 && page > pagination.totalPages) setPage(pagination.totalPages);
  }, [page, pagination.totalPages]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRegistration(null);
    setDrawerMode('create');
  };

  const openDrawer = (
    mode: VlsMactMasterClassDrawerMode,
    registration: VlsMactMasterClassRegistration | null = null,
  ) => {
    setSelectedRegistration(registration);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const handleSubmit = (values: VlsMactMasterClassFormValues) => {
    const payload = cleanVlsMactPayload(values);
    if (drawerMode === 'edit' && selectedRegistration) {
      updateMutation.mutate({ id: selectedRegistration.id, payload }, { onSuccess: closeDrawer });
      return;
    }
    createMutation.mutate(payload, { onSuccess: closeDrawer });
  };

  const handleDelete = () => {
    if (!deleteRegistration) return;
    deleteMutation.mutate(deleteRegistration.id, { onSuccess: () => setDeleteRegistration(null) });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setPaymentStatus('');
    setRegisteredStartDate('');
    setRegisteredEndDate('');
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

  const handleCloseExportMenu = () => setExportMenuAnchor(null);

  const handleExport = async (format: VlsMactMasterClassExportFormat) => {
    handleCloseExportMenu();
    setIsExporting(true);
    try {
      const response = await exportVlsMactMasterClassRegistrations(
        format,
        params,
        superAdminClientKey,
      );
      const contentType =
        response.headers['content-type'] ||
        (format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8');
      const fileName = extractDownloadFilename(
        response.headers['content-disposition'],
        getVlsMactExportFallbackName(format),
      );
      saveAs(new Blob([response.data], { type: contentType }), fileName);
      enqueueSnackbar(
        `MACT Master Class registrations exported as ${format.toUpperCase()} successfully.`,
        { variant: 'success' },
      );
    } catch (error) {
      enqueueSnackbar(getVlsMactExportErrorMessage(error), { variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isVlsModule) {
    return (
      <Alert severity="error">This page is available only for the VLS Law client module.</Alert>
    );
  }

  const drawerRegistration = detailQuery.data?.data ?? selectedRegistration;
  const mutationLoading = createMutation.isLoading || updateMutation.isLoading;
  const hasFilters = hasVlsMactFilters(params);

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
          bgcolor: alpha(VLS_MACT_COLOR, 0.035),
          borderColor: alpha(VLS_MACT_COLOR, 0.18),
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
                bgcolor: VLS_MACT_COLOR,
              }}
            >
              <IconifyIcon icon="mingcute:briefcase-line" width={24} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h4"
                fontWeight={750}
                sx={{
                  fontSize: { xs: '1.55rem', md: '2rem' },
                  whiteSpace: 'normal',
                  overflowWrap: 'break-word',
                }}
              >
                MACT Master Class
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.35}>
                Manage VLS Law MACT registrations and payment data
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1.25} flexWrap="wrap" justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleOpenExportMenu}
              disabled={isExporting}
              startIcon={
                isExporting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <IconifyIcon icon="mdi:download-outline" />
                )
              }
              endIcon={!isExporting ? <IconifyIcon icon="mdi:chevron-down" /> : undefined}
              sx={{
                borderColor: alpha(VLS_MACT_COLOR, 0.28),
                color: VLS_MACT_COLOR,
                flexShrink: 0,
                '&:hover': { borderColor: VLS_MACT_COLOR, bgcolor: alpha(VLS_MACT_COLOR, 0.04) },
              }}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button
              variant="contained"
              startIcon={<IconifyIcon icon="mdi:plus" />}
              onClick={() => openDrawer('create')}
              sx={{
                bgcolor: VLS_MACT_COLOR,
                flexShrink: 0,
                '&:hover': { bgcolor: alpha(VLS_MACT_COLOR, 0.88) },
              }}
            >
              Add Registration
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
          label="Total Registrations"
          value={summaryUnavailable ? '-' : summary.total_registrations}
          icon="mingcute:group-line"
          loading={summaryLoading}
        />
        <SummaryCard
          label="Today's Registrations"
          value={summaryUnavailable ? '-' : summary.today_registrations}
          icon="mingcute:calendar-2-line"
          loading={summaryLoading}
        />
        <SummaryCard
          label="Total Amount"
          value={summaryUnavailable ? '-' : formatAmountMetric(summary.total_amount)}
          icon="mingcute:currency-rupee-line"
          loading={summaryLoading}
        />
        <SummaryCard
          label="Paid Registrations"
          value={summaryUnavailable ? '-' : summary.paid_registrations}
          icon="mingcute:check-circle-line"
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
              lg: 'repeat(6, minmax(0, 1fr))',
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
            placeholder="Search name, mobile, email or payment status"
            sx={{ minWidth: 0, gridColumn: { xs: '1 / -1', lg: 'span 2' } }}
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
            label="Payment Status"
            value={paymentStatus}
            sx={{ minWidth: 0 }}
            onChange={(event) => {
              setPaymentStatus(event.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Payment Statuses</MenuItem>
            {VLS_MACT_PAYMENT_STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <DatePicker
            label="Registered From"
            value={registeredStartDate ? dayjs(registeredStartDate) : null}
            onChange={updateDate(setRegisteredStartDate)}
            maxDate={registeredEndDate ? dayjs(registeredEndDate) : undefined}
            slotProps={{
              textField: { size: 'small', fullWidth: true, sx: { minWidth: 0 } },
              actionBar: { actions: ['clear'] },
            }}
          />
          <DatePicker
            label="Registered To"
            value={registeredEndDate ? dayjs(registeredEndDate) : null}
            onChange={updateDate(setRegisteredEndDate)}
            minDate={registeredStartDate ? dayjs(registeredStartDate) : undefined}
            slotProps={{
              textField: { size: 'small', fullWidth: true, sx: { minWidth: 0 } },
              actionBar: { actions: ['clear'] },
            }}
          />
          <Button
            variant="text"
            color="inherit"
            onClick={handleResetFilters}
            disabled={!hasFilters && !searchInput}
            startIcon={<IconifyIcon icon="mdi:filter-off-outline" />}
            sx={{ minWidth: 0, width: '100%' }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {registrationsQuery.isError ? (
        <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => registrationsQuery.refetch()}>
                Retry
              </Button>
            }
          >
            {getVlsMactErrorMessage(
              registrationsQuery.error,
              'Unable to load MACT Master Class registrations.',
            )}
          </Alert>
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={{ width: '100%', maxWidth: '100%', minWidth: 0, borderRadius: 3, overflow: 'hidden' }}
        >
          <VlsMactMasterClassTable
            rows={rows}
            page={page}
            limit={limit}
            total={pagination.total}
            isLoading={registrationsQuery.isLoading || registrationsQuery.isFetching}
            hasFilters={hasFilters}
            onPaginationChange={handlePaginationChange}
            onView={(registration) => openDrawer('view', registration)}
            onEdit={(registration) => openDrawer('edit', registration)}
            onDelete={setDeleteRegistration}
          />
        </Paper>
      )}

      <VlsMactMasterClassFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        registration={drawerRegistration}
        isLoading={mutationLoading || (drawerMode === 'view' && detailQuery.isLoading)}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />
      <VlsMactMasterClassDeleteDialog
        open={Boolean(deleteRegistration)}
        registration={deleteRegistration}
        isLoading={deleteMutation.isLoading}
        onClose={() => setDeleteRegistration(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default VlsMactMasterClassSection;
