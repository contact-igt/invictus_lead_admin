import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Grid,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import useColorMode from 'hooks/useColorMode';
import { useAuth } from 'redux/selectors/auth/authSelector';
import {
  useDeletePixelEyeNotificationsMutation,
  usePixelEyeNotificationsQuery,
  usePixelEyeNotificationsSummaryQuery,
} from 'components/hooks/usePixelEyeNotificationsQuery';
import ConfirmAlert from 'components/common/ConfirmAlert';
import DataGridFooter from 'components/common/DataGridFooter';
import { PixelEyeCard, getPixelEyeButtonSx, PIXELEYE_COLORS } from './pixelEyeUi';
import PixelEyeField from './PixelEyeField';
import PixelEyeDatePicker from './PixelEyeDatePicker';

interface NotificationTrackerProps {
  clientKey?: string;
  searchText?: string;
}

const STATE_COLORS: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  scheduled: 'warning',
  completed: 'success',
  cancelled: 'error',
  baseline: 'info',
  new: 'default',
};

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  THIRTY_MIN: '30 Min',
  DNP2: 'DNP2 24hr',
  TWENTY_FOUR_HR: '24hr Follow-up',
  FORTY_EIGHT_HR: '48hr Follow-up',
  MANUAL: 'Manual Follow-up',
};

const normalizeDateForCompare = (value?: string | null): string => {
  const text = String(value || '').trim();
  if (!text) return '';

  const directDate = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (directDate) return directDate[0];

  const parsed = dayjs(text);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
};

const getNotificationFilterDate = (notification: any): string =>
  normalizeDateForCompare(notification.scheduled_at) ||
  normalizeDateForCompare(notification.notification_sent_at) ||
  normalizeDateForCompare(notification.createdAt) ||
  normalizeDateForCompare(notification.created_at);

const SummaryCard = ({
  label,
  value,
  color,
  loading,
}: {
  label: string;
  value: number | undefined;
  color: string;
  loading?: boolean;
}) => (
  <PixelEyeCard sx={{ p: 2.5, textAlign: 'center' }}>
    <Typography
      variant="overline"
      sx={{
        fontSize: '0.68rem',
        letterSpacing: '0.12em',
        color: 'text.secondary',
      }}
    >
      {label}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 800, color, mt: 0.5 }}>
      {loading ? <CircularProgress size={22} /> : value ?? 0}
    </Typography>
  </PixelEyeCard>
);

const NotificationTracker = ({ clientKey, searchText }: NotificationTrackerProps) => {
  const { user } = useAuth();
  const { mode } = useColorMode();
  const isSuperAdmin = String(user?.role || '').toLowerCase().trim() === 'super-admin';
  const canDeleteNotifications = ['super-admin', 'admin', 'client'].includes(
    String(user?.role || '').toLowerCase().trim(),
  );
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<number[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const hasScopedClientContext = !isSuperAdmin || Boolean(clientKey);

  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
  } = usePixelEyeNotificationsQuery(clientKey, undefined, { enabled: hasScopedClientContext });

  const { data: summary, isLoading: summaryLoading } =
    usePixelEyeNotificationsSummaryQuery(clientKey, { enabled: hasScopedClientContext });
  const deleteNotificationsMutation = useDeletePixelEyeNotificationsMutation();

  if (!hasScopedClientContext) {
    return (
      <PixelEyeCard sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Please select a client
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Select a client from route context to load notification tracker data.
        </Typography>
      </PixelEyeCard>
    );
  }

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (stateFilter && n.state !== stateFilter) return false;
      if (typeFilter && n.schedule_type !== typeFilter) return false;

      if (dateFrom || dateTo) {
        const notificationDate = getNotificationFilterDate(n);
        if (!notificationDate) return false;
        if (dateFrom && notificationDate < dateFrom) return false;
        if (dateTo && notificationDate > dateTo) return false;
      }

      if (searchText) {
        const query = searchText.toLowerCase();
        const callId = String(n.call_id || '').toLowerCase();
        const customerName = String(n.customer_name || '').toLowerCase();
        const agentName = String(n.agent_name || '').toLowerCase();
        const lastStatus = String(n.last_status || '').toLowerCase();
        const cancelReason = String(n.cancel_reason || '').toLowerCase();
        const state = String(n.state || '').toLowerCase();
        const scheduleType = String(n.schedule_type || '').toLowerCase();

        return (
          callId.includes(query) ||
          customerName.includes(query) ||
          agentName.includes(query) ||
          lastStatus.includes(query) ||
          cancelReason.includes(query) ||
          state.includes(query) ||
          scheduleType.includes(query)
        );
      }

      return true;
    });
  }, [dateFrom, dateTo, notifications, stateFilter, typeFilter, searchText]);

  useEffect(() => {
    setSelectedNotificationIds((current) =>
      current.filter((id) => filtered.some((notification) => notification.id === id)),
    );
  }, [filtered]);

  const handleClearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  const handleDeleteSelected = () => {
    if (selectedNotificationIds.length === 0) return;

    deleteNotificationsMutation.mutate(
      { ids: selectedNotificationIds, clientKey },
      {
        onSuccess: () => {
          setIsDeleteConfirmOpen(false);
          setSelectedNotificationIds([]);
        },
      },
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'call_id',
      headerName: 'Call ID',
      flex: 0.9,
      minWidth: 120,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {p.value || '—'}
        </Typography>
      ),
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      flex: 1.2,
      minWidth: 180,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) => (
        <Typography variant="body2" fontWeight={600} noWrap title={String(p.value || '—')}>
          {p.value || '—'}
        </Typography>
      ),
    },
    {
      field: 'agent_name',
      headerName: 'Agent',
      flex: 1,
      minWidth: 140,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) => (
        <Typography variant="body2" noWrap>
          {p.value || '—'}
        </Typography>
      ),
    },
    {
      field: 'current_day',
      headerName: 'Day',
      flex: 0.6,
      minWidth: 84,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) => (
        <Chip
          label={p.value > 0 ? `Day ${p.value}` : 'Initial'}
          size="small"
          color={p.value > 0 ? 'primary' : 'default'}
          variant="outlined"
          sx={{ fontSize: '0.72rem', borderRadius: '14px' }}
        />
      ),
    },
    {
      field: 'last_status',
      headerName: 'Last Status',
      flex: 1.3,
      minWidth: 150,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) => (
        <Chip
          label={p.value || '—'}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.72rem', maxWidth: 180, borderRadius: '14px' }}
        />
      ),
    },
    {
      field: 'schedule_type',
      headerName: 'Type',
      flex: 0.9,
      minWidth: 120,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) => {
        const label = SCHEDULE_TYPE_LABELS[p.value] || p.value || '—';
        return (
          <Chip
            label={label}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.72rem', borderRadius: '14px' }}
          />
        );
      },
    },
    {
      field: 'scheduled_at',
      headerName: 'Scheduled At',
      flex: 1.1,
      minWidth: 150,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) =>
        p.value ? (
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            {dayjs(p.value).format('DD MMM, HH:mm')}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      field: 'notification_sent_at',
      headerName: 'Sent At',
      flex: 1,
      minWidth: 140,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) =>
        p.value ? (
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            {dayjs(p.value).format('DD MMM, HH:mm')}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      field: 'state',
      headerName: 'State',
      flex: 0.8,
      minWidth: 110,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) => (
        <Chip
          label={String(p.value || '').toUpperCase()}
          size="small"
          color={STATE_COLORS[p.value] || 'default'}
          sx={{ fontWeight: 700, fontSize: '0.68rem', minWidth: 80, borderRadius: '14px' }}
        />
      ),
    },
    {
      field: 'cancel_reason',
      headerName: 'Cancel / Note',
      flex: 1.5,
      minWidth: 180,
      align: 'left',
      headerAlign: 'left',
      renderCell: (p) =>
        p.value ? (
          <Tooltip title={p.value} placement="top">
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                fontSize: '0.78rem',
                color: 'text.secondary',
              }}
            >
              {p.value}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
  ];

  return (
    <Box>
      {isError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          Failed to load notifications:{' '}
          {(error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error'}.
          Make sure the backend server is running with the latest changes.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Scheduled"
            value={summary?.scheduled}
            color={mode === 'dark' ? '#FDE047' : '#B45309'}
            loading={summaryLoading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Completed"
            value={summary?.completed}
            color={mode === 'dark' ? '#86EFAC' : '#15803D'}
            loading={summaryLoading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Cancelled"
            value={summary?.cancelled}
            color={mode === 'dark' ? '#FCA5A5' : '#B91C1C'}
            loading={summaryLoading}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            label="Total"
            value={summary?.total}
            color={mode === 'dark' ? '#FFFFFF' : '#0F172A'}
            loading={summaryLoading}
          />
        </Grid>
      </Grid>

      <PixelEyeCard sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            p: { xs: 2, md: 2.5 },
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <PixelEyeField
            select
            label="State"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            size="small"
            sx={{ width: { xs: 150, sm: 160 } }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">All States</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="baseline">Baseline</MenuItem>
          </PixelEyeField>

          <PixelEyeField
            select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            size="small"
            sx={{ width: { xs: 150, sm: 180 } }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="THIRTY_MIN">30 Min</MenuItem>
            <MenuItem value="DNP2">DNP2 24hr</MenuItem>
            <MenuItem value="TWENTY_FOUR_HR">24hr Follow-up</MenuItem>
            <MenuItem value="FORTY_EIGHT_HR">48hr Follow-up</MenuItem>
            <MenuItem value="MANUAL">Manual Follow-up</MenuItem>
          </PixelEyeField>

          <PixelEyeDatePicker
            label="From Date"
            value={dateFrom}
            maxDate={dateTo || undefined}
            sx={{ width: { xs: 150, sm: 160 } }}
            onChange={(newFrom) => {
              setDateFrom(newFrom);
              if (dateTo && newFrom > dateTo) {
                setDateTo(newFrom);
              }
            }}
          />

          <PixelEyeDatePicker
            label="To Date"
            value={dateTo}
            minDate={dateFrom || undefined}
            disabled={!dateFrom}
            sx={{ width: { xs: 150, sm: 160 } }}
            onChange={(newTo) => setDateTo(newTo)}
          />

          {(dateFrom || dateTo) && (
            <Button
              variant="text"
              onClick={handleClearDateFilter}
              sx={getPixelEyeButtonSx(mode, 'secondary')}
            >
              Clear Dates
            </Button>
          )}

          <Box sx={{ flex: 1 }} />

          <Tooltip
            title={
              canDeleteNotifications
                ? ''
                : 'Only management roles can delete notification tracker rows.'
            }
          >
            <Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={16} />}
                disabled={
                  !canDeleteNotifications ||
                  selectedNotificationIds.length === 0 ||
                  deleteNotificationsMutation.isLoading
                }
                onClick={() => setIsDeleteConfirmOpen(true)}
                sx={getPixelEyeButtonSx(mode, 'secondary')}
              >
                Delete Selected
              </Button>
            </Box>
          </Tooltip>

          <Typography
            variant="caption"
            sx={{ color: mode === 'dark' ? PIXELEYE_COLORS.mutedText : 'text.secondary' }}
          >
            Auto-refreshes every 30s
          </Typography>
        </Box>
      </PixelEyeCard>

      {!isLoading && !isError && filtered.length === 0 && (
        <PixelEyeCard sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No notification records yet.
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Records appear here once leads are created or their status is updated.
          </Typography>
        </PixelEyeCard>
      )}

      {(isLoading || filtered.length > 0) && (
        <PixelEyeCard>
          <Box
            sx={{
              px: { xs: 2, md: 2.5 },
              pt: { xs: 2, md: 2.5 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {selectedNotificationIds.length > 0
                ? `${selectedNotificationIds.length} selected`
                : 'Select rows to manage notifications'}
            </Typography>
            {selectedNotificationIds.length > 0 && (
              <Chip
                color={canDeleteNotifications ? 'error' : 'default'}
                variant="outlined"
                label={`${selectedNotificationIds.length} selected`}
                sx={{ borderRadius: '14px', fontWeight: 700 }}
              />
            )}
          </Box>

          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              loading={isLoading}
              checkboxSelection
              rowSelectionModel={selectedNotificationIds as GridRowSelectionModel}
              onRowSelectionModelChange={(selectionModel) => {
                const ids = Array.from(selectionModel)
                  .map((value) => Number(value))
                  .filter((value) => Number.isInteger(value) && value > 0);
                setSelectedNotificationIds(ids);
              }}
              autoHeight
              rowHeight={60}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableColumnMenu
              disableRowSelectionOnClick
              slots={{ pagination: DataGridFooter }}
              sx={{
                minWidth: 1320,
                border: 0,
                backgroundColor: 'transparent',
                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
                {
                  outline: 'none',
                },
                '& .MuiDataGrid-cell:focus-visible, & .MuiDataGrid-columnHeader:focus-visible': {
                  outline: 'none',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: mode === 'dark' ? PIXELEYE_COLORS.card : '#F8FAFC',
                  borderBottom: `1px solid ${mode === 'dark' ? 'rgba(80, 120, 100, 0.22)' : '#E2E8F0'}`,
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  overflow: 'visible',
                  textOverflow: 'clip',
                  whiteSpace: 'normal',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  fontSize: '0.72rem',
                  letterSpacing: '0.05em',
                  color: mode === 'dark' ? '#9FB0A6' : '#64748B',
                },
                '& .MuiDataGrid-row': {
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor:
                      mode === 'dark' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(31, 107, 64, 0.03)',
                  },
                },
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  px: 2,
                  borderBottom: `1px solid ${mode === 'dark' ? 'rgba(80, 120, 100, 0.18)' : '#E2E8F0'}`,
                  color: mode === 'dark' ? '#EAF7EE' : '#334155',
                },
                '& .MuiDataGrid-columnHeaderCheckbox, & .MuiDataGrid-cellCheckbox': {
                  px: 0.5,
                  justifyContent: 'center',
                },
                '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root, & .MuiDataGrid-cellCheckbox .MuiCheckbox-root':
                {
                  color: mode === 'dark' ? '#86EFAC' : '#166534',
                },
                '& .MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root.Mui-checked, & .MuiDataGrid-cellCheckbox .MuiCheckbox-root.Mui-checked':
                {
                  color: mode === 'dark' ? '#BBF7D0' : '#15803D',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${mode === 'dark' ? 'rgba(80, 120, 100, 0.22)' : '#E2E8F0'}`,
                  backgroundColor: 'transparent',
                },
              }}
            />
          </Box>
        </PixelEyeCard>
      )}

      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => {
          if (!deleteNotificationsMutation.isLoading) {
            setIsDeleteConfirmOpen(false);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <ConfirmAlert
          title={`Delete ${selectedNotificationIds.length} notification${selectedNotificationIds.length === 1 ? '' : 's'}?`}
          message="This removes the selected tracker records from the notification table."
          onConfirm={handleDeleteSelected}
          onCancel={() => setIsDeleteConfirmOpen(false)}
          isLoading={deleteNotificationsMutation.isLoading}
        />
      </Dialog>
    </Box>
  );
};

export default NotificationTracker;
