import { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  MenuItem,
  TextField,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import {
  usePixelEyeNotificationsQuery,
  usePixelEyeNotificationsSummaryQuery,
} from 'components/hooks/usePixelEyeNotificationsQuery';
import DataGridFooter from 'components/common/DataGridFooter';

interface NotificationTrackerProps {
  clientKey?: string;
  searchText?: string;
}

const STATE_COLORS: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  scheduled: 'warning',
  completed: 'success',
  cancelled: 'error',
  baseline:  'info',
  new:       'default',
};

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  THIRTY_MIN:     '30 Min',
  DNP2:           'DNP2 24hr',
  TWENTY_FOUR_HR: '24hr Follow-up',
  MANUAL:         'Manual Follow-up',
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
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      textAlign: 'center',
    }}
  >
    <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
      {label}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 700, color, mt: 0.5 }}>
      {loading ? <CircularProgress size={22} /> : (value ?? 0)}
    </Typography>
  </Paper>
);

const NotificationTracker = ({ clientKey, searchText }: NotificationTrackerProps) => {
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
  } = usePixelEyeNotificationsQuery(clientKey);

  const {
    data: summary,
    isLoading: summaryLoading,
  } = usePixelEyeNotificationsSummaryQuery(clientKey);

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

  const handleClearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  const columns: GridColDef[] = [
    {
      field: 'call_id',
      headerName: 'Call ID',
      flex: 0.9,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
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
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) => <Typography variant="body2">{p.value || '—'}</Typography>,
    },
    {
      field: 'agent_name',
      headerName: 'Agent',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) => <Typography variant="body2">{p.value || '—'}</Typography>,
    },
    {
      field: 'current_day',
      headerName: 'Day',
      flex: 0.6,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) => (
        <Chip
          label={p.value > 0 ? `Day ${p.value}` : 'Initial'}
          size="small"
          color={p.value > 0 ? 'primary' : 'default'}
          variant="outlined"
          sx={{ fontSize: '0.72rem' }}
        />
      ),
    },
    {
      field: 'last_status',
      headerName: 'Last Status',
      flex: 1.3,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) => (
        <Chip
          label={p.value || '—'}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.72rem', maxWidth: 160 }}
        />
      ),
    },
    {
      field: 'schedule_type',
      headerName: 'Type',
      flex: 0.9,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) => {
        const label = SCHEDULE_TYPE_LABELS[p.value] || p.value || '—';
        return (
          <Chip
            label={label}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.72rem' }}
          />
        );
      },
    },
    {
      field: 'scheduled_at',
      headerName: 'Scheduled At',
      flex: 1.1,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) =>
        p.value ? (
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            {dayjs(p.value).format('DD MMM, HH:mm')}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">—</Typography>
        ),
    },
    {
      field: 'notification_sent_at',
      headerName: 'Sent At',
      flex: 1,
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) =>
        p.value ? (
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            {dayjs(p.value).format('DD MMM, HH:mm')}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">—</Typography>
        ),
    },
    {
      field: 'state',
      headerName: 'State',
      flex: 0.8,
      minWidth: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) => (
        <Chip
          label={String(p.value || '').toUpperCase()}
          size="small"
          color={STATE_COLORS[p.value] || 'default'}
          sx={{ fontWeight: 700, fontSize: '0.68rem', minWidth: 80 }}
        />
      ),
    },
    {
      field: 'cancel_reason',
      headerName: 'Cancel / Note',
      flex: 1.5,
      minWidth: 170,
      align: 'center',
      headerAlign: 'center',
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
          <Typography variant="body2" color="text.disabled">—</Typography>
        ),
    },
  ];

  return (
    <Box>
      {/* API error banner */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load notifications:{' '}
          {(error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error'}
          . Make sure the backend server is running with the latest changes.
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="Scheduled" value={summary?.scheduled} color="warning.main" loading={summaryLoading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="Completed" value={summary?.completed} color="success.main" loading={summaryLoading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="Cancelled" value={summary?.cancelled} color="error.main" loading={summaryLoading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard label="Total" value={summary?.total} color="text.primary" loading={summaryLoading} />
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          select
          label="State"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All States</MenuItem>
          <MenuItem value="scheduled">Scheduled</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
          <MenuItem value="baseline">Baseline</MenuItem>
        </TextField>

        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="THIRTY_MIN">30 Min</MenuItem>
          <MenuItem value="DNP2">DNP2 24hr</MenuItem>
          <MenuItem value="TWENTY_FOUR_HR">24hr Follow-up</MenuItem>
          <MenuItem value="MANUAL">Manual Follow-up</MenuItem>
        </TextField>

        <TextField
          label="From Date"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />

        <TextField
          label="To Date"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />

        {(dateFrom || dateTo) && (
          <Button
            variant="text"
            onClick={handleClearDateFilter}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Clear Dates
          </Button>
        )}

        <Box sx={{ flex: 1 }} />

        <Typography variant="caption" color="text.secondary">
          Auto-refreshes every 30s
        </Typography>
      </Box>

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No notification records yet.
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Records appear here once leads are created or their status is updated.
          </Typography>
        </Box>
      )}

      {/* Table */}
      {(isLoading || filtered.length > 0) && (
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={isLoading}
          autoHeight
          rowHeight={58}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableColumnMenu
          disableRowSelectionOnClick
          slots={{ pagination: DataGridFooter }}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'background.default',
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              overflow: 'visible',
              textOverflow: 'clip',
              whiteSpace: 'normal',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.72rem',
              letterSpacing: '0.05em',
              color: 'text.secondary',
            },
            '& .MuiDataGrid-row': {
              transition: 'background-color 0.2s',
              '&:hover': { backgroundColor: 'action.hover' },
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: 'divider',
            },
          }}
        />
      )}
    </Box>
  );
};

export default NotificationTracker;
