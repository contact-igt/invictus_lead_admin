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
  Grid,
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
  useCreateVlsConsumerProtectionLawMasterClassRegistration,
  useDeleteVlsConsumerProtectionLawMasterClassRegistration,
  useUpdateVlsConsumerProtectionLawMasterClassRegistration,
  useVlsConsumerProtectionLawMasterClassRegistration,
  useVlsConsumerProtectionLawMasterClassRegistrations,
  useVlsConsumerProtectionLawMasterClassSummary,
} from 'hooks/useVlsConsumerProtectionLawMasterClassQuery';
import { useAuth } from 'redux/selectors/auth/authSelector';
import type { VlsConsumerProtectionLawMasterClassFormValues } from 'schemas/vlsConsumerProtectionLawMasterClassSchema';
import { exportVlsConsumerProtectionLawMasterClassRegistrations } from 'services/vlsConsumerProtectionLawMasterClass.service';
import type {
  VlsConsumerProtectionLawMasterClassExportFormat,
  VlsConsumerProtectionLawMasterClassListParams,
  VlsConsumerProtectionLawMasterClassRegistration,
  VlsConsumerProtectionLawMasterClassSummary,
} from 'types/vlsConsumerProtectionLawMasterClass';
import { resolveClientModuleKey } from 'utils/clientModuleResolver';
import VlsConsumerProtectionLawMasterClassDeleteDialog from './VlsConsumerProtectionLawMasterClassDeleteDialog';
import VlsConsumerProtectionLawMasterClassFormDrawer, {
  VlsConsumerProtectionLawMasterClassDrawerMode,
} from './VlsConsumerProtectionLawMasterClassFormDrawer';
import VlsConsumerProtectionLawMasterClassTable from './VlsConsumerProtectionLawMasterClassTable';
import {
  VLS_CONSUMER_PROTECTION_COLOR,
  VLS_CONSUMER_PROTECTION_PAYMENT_STATUS_OPTIONS,
  cleanVlsConsumerProtectionPayload,
  extractDownloadFilename,
  getVlsConsumerProtectionExportErrorMessage,
  getVlsConsumerProtectionExportFallbackName,
  getVlsConsumerProtectionLawErrorMessage,
  hasVlsConsumerProtectionFilters,
} from './vlsConsumerProtectionLawMasterClassUtils';

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
            bgcolor: alpha(VLS_CONSUMER_PROTECTION_COLOR, 0.1),
            color: VLS_CONSUMER_PROTECTION_COLOR,
            flexShrink: 0,
          }}
        >
          <IconifyIcon icon={icon} width={20} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const EMPTY_SUMMARY: VlsConsumerProtectionLawMasterClassSummary = {
  total_registrations: 0,
  today_registrations: 0,
  total_amount: 0,
  paid_registrations: 0,
};

const formatAmountMetric = (value: number) =>
  `\u20B9${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const VlsConsumerProtectionLawMasterClassSection = () => {
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
  const [drawerMode, setDrawerMode] = useState<VlsConsumerProtectionLawMasterClassDrawerMode>('create');
  const [selectedRegistration, setSelectedRegistration] =
    useState<VlsConsumerProtectionLawMasterClassRegistration | null>(null);
  const [deleteRegistration, setDeleteRegistration] =
    useState<VlsConsumerProtectionLawMasterClassRegistration | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 450);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params: VlsConsumerProtectionLawMasterClassListParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    payment_status: paymentStatus || undefined,
    registered_start_date: registeredStartDate || undefined,
    registered_end_date: registeredEndDate || undefined,
  };

  const {
    data: listResponse,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
  } = useVlsConsumerProtectionLawMasterClassRegistrations(clientKey, params, isVlsModule);

  const {
    data: summaryResponse,
    isLoading: isSummaryLoading,
  } = useVlsConsumerProtectionLawMasterClassSummary(
    clientKey,
    {
      search: params.search,
      payment_status: params.payment_status,
      registered_start_date: params.registered_start_date,
      registered_end_date: params.registered_end_date,
    },
    isVlsModule,
  );

  const selectedRegistrationId = selectedRegistration?.id ?? null;
  const { data: detailResponse } = useVlsConsumerProtectionLawMasterClassRegistration(
    clientKey,
    selectedRegistrationId,
    drawerOpen && Boolean(selectedRegistrationId),
  );

  const createMutation = useCreateVlsConsumerProtectionLawMasterClassRegistration(clientKey);
  const updateMutation = useUpdateVlsConsumerProtectionLawMasterClassRegistration(clientKey);
  const deleteMutation = useDeleteVlsConsumerProtectionLawMasterClassRegistration(clientKey);

  const rows = listResponse?.data ?? [];
  const pagination = listResponse?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 };
  const summary = summaryResponse?.data ?? EMPTY_SUMMARY;
  const activeRegistration = detailResponse?.data ?? selectedRegistration;

  const isMutationLoading =
    createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setPaymentStatus(value);
    setPage(1);
  };

  const handleStartDateChange = (value: Dayjs | null) => {
    setRegisteredStartDate(value && value.isValid() ? value.format('YYYY-MM-DD') : '');
    setPage(1);
  };

  const handleEndDateChange = (value: Dayjs | null) => {
    setRegisteredEndDate(value && value.isValid() ? value.format('YYYY-MM-DD') : '');
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setPaymentStatus('');
    setRegisteredStartDate('');
    setRegisteredEndDate('');
    setPage(1);
  };

  const handlePaginationChange = (nextPage: number, nextLimit: number) => {
    setPage(nextPage);
    setLimit(nextLimit);
  };

  const handleOpenCreate = () => {
    setSelectedRegistration(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleOpenView = (record: VlsConsumerProtectionLawMasterClassRegistration) => {
    setSelectedRegistration(record);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleOpenEdit = (record: VlsConsumerProtectionLawMasterClassRegistration) => {
    setSelectedRegistration(record);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedRegistration(null);
  };

  const handleFormSubmit = async (values: VlsConsumerProtectionLawMasterClassFormValues) => {
    const payload = cleanVlsConsumerProtectionPayload(values);

    if (drawerMode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => handleCloseDrawer(),
      });
      return;
    }

    if (drawerMode === 'edit' && selectedRegistration) {
      updateMutation.mutate(
        { id: selectedRegistration.id, payload },
        {
          onSuccess: () => handleCloseDrawer(),
        },
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteRegistration) return;
    deleteMutation.mutate(deleteRegistration.id, {
      onSuccess: () => setDeleteRegistration(null),
    });
  };

  const handleOpenExportMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = async (format: VlsConsumerProtectionLawMasterClassExportFormat) => {
    handleCloseExportMenu();
    setIsExporting(true);
    try {
      const response = await exportVlsConsumerProtectionLawMasterClassRegistrations(
        format,
        {
          search: params.search,
          payment_status: params.payment_status,
          registered_start_date: params.registered_start_date,
          registered_end_date: params.registered_end_date,
        },
        superAdminClientKey,
      );

      const filename = extractDownloadFilename(
        response.headers?.['content-disposition'],
        getVlsConsumerProtectionExportFallbackName(format),
      );

      saveAs(response.data, filename);
      enqueueSnackbar(`Report exported successfully as ${format.toUpperCase()}`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(getVlsConsumerProtectionExportErrorMessage(err), { variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isVlsModule) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Consumer Protection Law Masterclass module is available only under the VLS Law client key context.
        </Alert>
      </Box>
    );
  }

  const isFilterActive = hasVlsConsumerProtectionFilters(params);

  return (
    <Box p={{ xs: 2, sm: 3 }} display="flex" flexDirection="column" gap={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={750}>
            Consumer Protection Law Masterclass
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage landing page registrations, payments, and UTM parameters for Consumer Protection Law Masterclass.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            color="inherit"
            startIcon={isExporting ? <CircularProgress size={16} /> : <IconifyIcon icon="mdi:download" />}
            onClick={handleOpenExportMenu}
            disabled={isExporting || isListLoading}
          >
            Export
          </Button>

          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={handleCloseExportMenu}
          >
            <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
            <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
          </Menu>

          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="mdi:plus" />}
            onClick={handleOpenCreate}
          >
            New Registration
          </Button>
        </Stack>
      </Stack>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={2}>
        <SummaryCard
          label="Total Registrations"
          value={summary.total_registrations}
          icon="mdi:account-group"
          loading={isSummaryLoading}
        />
        <SummaryCard
          label="Today's Registrations"
          value={summary.today_registrations}
          icon="mdi:calendar-today"
          loading={isSummaryLoading}
        />
        <SummaryCard
          label="Total Revenue"
          value={formatAmountMetric(summary.total_amount)}
          icon="mdi:currency-inr"
          loading={isSummaryLoading}
        />
        <SummaryCard
          label="Paid Registrations"
          value={summary.paid_registrations}
          icon="mdi:check-circle"
          loading={isSummaryLoading}
        />
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3.5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, mobile, email, city..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon icon="mdi:magnify" width={20} />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <Button size="small" onClick={() => handleSearchChange('')} sx={{ minWidth: 0, p: 0.5 }}>
                      <IconifyIcon icon="mdi:close" width={18} />
                    </Button>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              select
              size="small"
              label="Payment Status"
              value={paymentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {VLS_CONSUMER_PROTECTION_PAYMENT_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <DatePicker
              label="Registered From"
              value={registeredStartDate ? dayjs(registeredStartDate) : null}
              onChange={handleStartDateChange}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <DatePicker
              label="Registered To"
              value={registeredEndDate ? dayjs(registeredEndDate) : null}
              onChange={handleEndDateChange}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>

          {isFilterActive && (
            <Grid item xs={12} display="flex" justifyContent="flex-end">
              <Button size="small" variant="text" color="inherit" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      {isListError ? (
        <Alert severity="error">
          {getVlsConsumerProtectionLawErrorMessage(listError, 'Unable to load Consumer Protection Law registrations.')}
        </Alert>
      ) : (
        <VlsConsumerProtectionLawMasterClassTable
          rows={rows}
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          isLoading={isListLoading}
          hasFilters={isFilterActive}
          onPaginationChange={handlePaginationChange}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={(record) => setDeleteRegistration(record)}
        />
      )}

      <VlsConsumerProtectionLawMasterClassFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        registration={activeRegistration}
        isLoading={isMutationLoading}
        onClose={handleCloseDrawer}
        onSubmit={handleFormSubmit}
      />

      <VlsConsumerProtectionLawMasterClassDeleteDialog
        open={Boolean(deleteRegistration)}
        registration={deleteRegistration}
        isLoading={deleteMutation.isLoading}
        onClose={() => setDeleteRegistration(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};

export default VlsConsumerProtectionLawMasterClassSection;
