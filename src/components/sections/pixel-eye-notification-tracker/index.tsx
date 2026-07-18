import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  Grid,
  MenuItem,
  Stack,
  Typography,
  InputAdornment,
  CircularProgress,
  Card,
  IconButton,
  Pagination,
  Tooltip,
} from '@mui/material';
import {
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Clock,
  SlidersHorizontal,
  Bell,
} from 'lucide-react';
import useColorMode from 'hooks/useColorMode';
import {
  usePixelEyeNotificationsQuery,
  usePixelEyeNotificationsSummaryQuery,
  useDeletePixelEyeNotificationsMutation,
  type NotificationState,
} from 'components/hooks/usePixelEyeNotificationsQuery';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { PixelEyePageShell, PIXELEYE_COLORS } from '../pixel-eye/pixelEyeUi';
import NotificationTrackerList from './NotificationTrackerList';
import NotificationDetailsDrawer from './NotificationDetailsDrawer';
import PixelEyeField from '../pixel-eye/PixelEyeField';
import PixelEyeDatePicker from '../pixel-eye/PixelEyeDatePicker';
import { normalizePixelEyeStatus } from '../pixel-eye/pixelEyeStatuses';
import dayjs from 'dayjs';

interface NotificationTrackerProps {
  clientKey?: string;
  searchText?: string;
}

const StatWidget = ({
  label,
  value,
  color,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number | undefined;
  color: string;
  icon: any;
  loading?: boolean;
}) => {
  const { mode } = useColorMode();
  const isDark = mode === 'dark';

  return (
    <Card
      sx={{
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '20px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(80, 120, 100, 0.2)' : 'rgba(226, 232, 240, 0.8)',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 15px rgba(0,0,0,0.03)',
        bgcolor: isDark ? PIXELEYE_COLORS.card : '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.05)',
          borderColor: isDark ? 'rgba(134, 239, 172, 0.3)' : 'rgba(21, 106, 69, 0.2)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography
          variant="caption"
          sx={{
            color: isDark ? PIXELEYE_COLORS.mutedText : 'text.secondary',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.7rem',
          }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            p: 1,
            borderRadius: '10px',
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} />
        </Box>
      </Stack>

      {loading ? (
        <CircularProgress size={24} sx={{ color, mt: 1 }} />
      ) : (
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            color: isDark ? '#FFFFFF' : '#0F172A',
            letterSpacing: '-0.02em',
          }}
        >
          {value ?? 0}
        </Typography>
      )}

      {/* Sub-bar decoration */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          bgcolor: color,
          opacity: 0.15,
        }}
      />
    </Card>
  );
};

const ITEMS_PER_PAGE = 12;

const normalizeDateForCompare = (value?: string | null): string => {
  const text = String(value || '').trim();
  if (!text) return '';

  const directDate = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (directDate) return directDate[0];

  const parsed = dayjs(text);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
};

const matchesDateRange = (
  notification: NotificationState,
  dateFrom: string,
  dateTo: string,
): boolean => {
  const candidateDates = [
    normalizeDateForCompare(notification.scheduled_at),
    normalizeDateForCompare(notification.notification_sent_at),
    normalizeDateForCompare(notification.createdAt),
    normalizeDateForCompare(notification.updatedAt),
  ].filter(Boolean);

  if (candidateDates.length === 0) return false;

  return candidateDates.some((candidateDate) => {
    if (dateFrom && candidateDate < dateFrom) return false;
    if (dateTo && candidateDate > dateTo) return false;
    return true;
  });
};

const NotificationTracker: React.FC<NotificationTrackerProps> = ({
  clientKey,
  searchText: externalSearchText,
}) => {
  const { user } = useAuth();
  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const isSuperAdmin = String(user?.role || '').toLowerCase().trim() === 'super-admin';
  const canDeleteNotifications = ['super-admin', 'admin', 'client'].includes(
    String(user?.role || '').toLowerCase().trim(),
  );
  const [internalSearchText, setInternalSearchText] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationState | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<number[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);

  const searchText = externalSearchText || internalSearchText;

  const hasScopedClientContext = !isSuperAdmin || Boolean(clientKey);

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = usePixelEyeNotificationsQuery(clientKey, undefined, { enabled: hasScopedClientContext });

  const { data: summary, isLoading: summaryLoading } =
    usePixelEyeNotificationsSummaryQuery(clientKey, { enabled: hasScopedClientContext });
  const deleteNotificationsMutation = useDeletePixelEyeNotificationsMutation();
  const hasActiveFilters = Boolean(searchText || stateFilter || typeFilter || dateFrom || dateTo);

  if (!hasScopedClientContext) {
    return (
      <PixelEyePageShell>
        <Box sx={{ px: 3, mt: 2, width: '100%' }}>
          <Card sx={{ p: 3, borderRadius: '20px' }}>
            <Typography variant="h5" fontWeight={800}>
              Please select a client
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Select a client from route context to load notification tracker data.
            </Typography>
          </Card>
        </Box>
      </PixelEyePageShell>
    );
  }

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const normalizedState = String(n.state || '').trim().toLowerCase();
      const normalizedType = String(n.schedule_type || '').trim().toUpperCase();

      if (stateFilter && normalizedState !== stateFilter.toLowerCase()) return false;
      if (typeFilter && normalizedType !== typeFilter.toUpperCase()) return false;

      if (dateFrom || dateTo) {
        if (!matchesDateRange(n, dateFrom, dateTo)) return false;
      }

      if (searchText) {
        const query = searchText.toLowerCase().trim();
        const scheduleTypeText = String(n.schedule_type || '')
          .replace(/_/g, ' ')
          .toLowerCase();
        const completionSourceText = String(n.completion_source || '')
          .replace(/_/g, ' ')
          .toLowerCase();
        const currentDayText = n.current_day ? `day ${n.current_day}` : 'initial';
        const outcomeText = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5']
          .map((key) => normalizePixelEyeStatus(n[key as keyof NotificationState] as string | null | undefined))
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return (
          String(n.customer_name || '')
            .toLowerCase()
            .includes(query) ||
          String(n.phone_number || '')
            .toLowerCase()
            .includes(query) ||
          String(n.call_id || '')
            .toLowerCase()
            .includes(query) ||
          String(n.agent_name || '')
            .toLowerCase()
            .includes(query) ||
          String(n.reason || '')
            .toLowerCase()
            .includes(query) ||
          String(n.cancel_reason || '')
            .toLowerCase()
            .includes(query) ||
          normalizedState.includes(query) ||
          scheduleTypeText.includes(query) ||
          completionSourceText.includes(query) ||
          String(n.outcome_status || '')
            .toLowerCase()
            .includes(query) ||
          String(n.compliance_status || '')
            .toLowerCase()
            .includes(query) ||
          currentDayText.includes(query) ||
          normalizePixelEyeStatus(n.last_status).toLowerCase().includes(query) ||
          outcomeText.includes(query)
        );
      }

      return true;
    });
  }, [notifications, stateFilter, typeFilter, dateFrom, dateTo, searchText]);

  // Reset to page 1 when data changes (filters/search)
  React.useEffect(() => {
    setPage(1);
  }, [stateFilter, typeFilter, dateFrom, dateTo, searchText]);

  React.useEffect(() => {
    setSelectedNotificationIds((current) =>
      current.filter((id) => filtered.some((notification) => notification.id === id)),
    );
  }, [filtered]);

  const paginatedNotifications = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const handleOpenDetails = (notification: any) => {
    setSelectedNotification(notification);
    setDrawerOpen(true);
  };

  const handleToggleNotification = (notificationId: number) => {
    setSelectedNotificationIds((current) =>
      current.includes(notificationId)
        ? current.filter((id) => id !== notificationId)
        : [...current, notificationId],
    );
  };

  const visibleNotificationIds = paginatedNotifications
    .map((notification) => Number(notification.id))
    .filter((id) => Number.isInteger(id) && id > 0);

  const areAllVisibleSelected =
    visibleNotificationIds.length > 0 &&
    visibleNotificationIds.every((id) => selectedNotificationIds.includes(id));

  const handleToggleAllVisible = () => {
    setSelectedNotificationIds((current) => {
      if (areAllVisibleSelected) {
        return current.filter((id) => !visibleNotificationIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleNotificationIds]));
    });
  };

  const handleDeleteSelected = () => {
    if (!canDeleteNotifications || selectedNotificationIds.length === 0) return;

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

  const handleClearFilters = () => {
    setInternalSearchText('');
    setStateFilter('');
    setTypeFilter('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <PixelEyePageShell>
      <Box sx={{ px: 3, mt: 2, width: '100%' }}>
        {/* Clean Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '10px',
                  bgcolor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'primary.main',
                  color: isDark ? '#4ade80' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bell size={20} />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 900,
                  color: isDark ? '#4ade80' : 'primary.main',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                SYSTEM ACTIVITY
              </Typography>
            </Stack>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 1.5,
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.75rem', md: '2.25rem' },
              }}
            >
              Notification Tracker
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: isDark ? PIXELEYE_COLORS.mutedText : 'text.secondary',
                maxWidth: 700,
                lineHeight: 1.6,
              }}
            >
              Monitor and manage your follow-up workflows in real-time. Track automated schedules,
              delivery statuses, and customer engagement metrics.
            </Typography>
          </Box>
        </Stack>

        {/* Stats Grid */}
        <Grid container spacing={3} mb={6}>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget
              label="Scheduled"
              value={summary?.scheduled}
              color="#fbbf24"
              icon={Clock}
              loading={summaryLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget
              label="Notification Sent"
              value={summary?.completed}
              color="#22c55e"
              icon={CheckCircle2}
              loading={summaryLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget
              label="Cancelled"
              value={summary?.cancelled}
              color="#ef4444"
              icon={XCircle}
              loading={summaryLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatWidget
              label="Total Tracks"
              value={summary?.total}
              color={isDark ? '#86efac' : 'primary.main'}
              icon={BarChart3}
              loading={summaryLoading}
            />
          </Grid>
        </Grid>

        {/* Modern Filter Strip */}
        <Box
          sx={{
            mb: 4,
            p: 2.5,
            borderRadius: '20px',
            bgcolor: isDark ? 'rgba(11, 21, 17, 0.6)' : 'rgba(248, 250, 252, 0.8)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(80, 120, 100, 0.25)' : 'rgba(226, 232, 240, 0.8)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} lg={4}>
              {!externalSearchText && (
                <PixelEyeField
                  fullWidth
                  placeholder="Search by name, phone or ID..."
                  value={internalSearchText}
                  onChange={(e) => setInternalSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search
                          size={18}
                          style={{ color: isDark ? PIXELEYE_COLORS.mutedText : '#94A3B8' }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Grid>
            <Grid item xs={6} sm={3} lg={2}>
              <PixelEyeField
                select
                fullWidth
                label="Status"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value as string)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="baseline">Baseline</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Notification Sent</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </PixelEyeField>
            </Grid>
            <Grid item xs={6} sm={3} lg={2}>
              <PixelEyeField
                select
                fullWidth
                label="Trigger"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as string)}
              >
                <MenuItem value="">All Triggers</MenuItem>
                <MenuItem value="MANUAL">Manual</MenuItem>
                <MenuItem value="THIRTY_MIN">30 Min</MenuItem>
                <MenuItem value="DNP2">DNP2</MenuItem>
                <MenuItem value="TWENTY_FOUR_HR">24hr Follow-up</MenuItem>
                <MenuItem value="FORTY_EIGHT_HR">48hr Follow-up</MenuItem>
              </PixelEyeField>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
              >
                <Box sx={{ flexGrow: 1, maxWidth: { xs: '100%', lg: '160px' } }}>
                  <PixelEyeDatePicker
                    label="From"
                    value={dateFrom}
                    fullWidth
                    maxDate={dateTo || undefined}
                    onChange={(val) => {
                      setDateFrom(val);
                      if (dateTo && val && val > dateTo) {
                        setDateTo(val);
                      }
                    }}
                  />
                </Box>
                <Box sx={{ flexGrow: 1, maxWidth: { xs: '100%', lg: '160px' } }}>
                  <PixelEyeDatePicker
                    label="To"
                    value={dateTo}
                    minDate={dateFrom || undefined}
                    disabled={!dateFrom}
                    fullWidth
                    onChange={(val) => setDateTo(val)}
                  />
                </Box>
                <Tooltip title={hasActiveFilters ? 'Clear filters' : 'No active filters'}>
                  <Box>
                    <IconButton
                      onClick={handleClearFilters}
                      disabled={!hasActiveFilters}
                      sx={{
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderRadius: '12px',
                        p: 1.2,
                      }}
                    >
                      <SlidersHorizontal size={18} />
                    </IconButton>
                  </Box>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {isError ? (
          <Box sx={{ p: 10, textAlign: 'center' }}>
            <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 16, opacity: 0.5 }} />
            <Typography variant="h6">Failed to sync tracker data</Typography>
          </Box>
        ) : (
          <>
            <NotificationTrackerList
              notifications={paginatedNotifications}
              loading={isLoading}
              onViewDetails={handleOpenDetails}
              selectedNotificationIds={selectedNotificationIds}
              onToggleNotification={handleToggleNotification}
              onToggleAllVisible={handleToggleAllVisible}
              allVisibleSelected={areAllVisibleSelected}
              canDeleteNotifications={canDeleteNotifications}
              onDeleteSelected={() => setIsDeleteConfirmOpen(true)}
              deleteDisabled={
                !canDeleteNotifications ||
                selectedNotificationIds.length === 0 ||
                deleteNotificationsMutation.isLoading
              }
            />

            {/* Pagination Section */}
            {!isLoading && filtered.length > 0 && (
              <Box
                sx={{
                  mt: 5,
                  mb: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: isDark ? PIXELEYE_COLORS.mutedText : 'text.secondary',
                  }}
                >
                  Showing {Math.min(filtered.length, (page - 1) * ITEMS_PER_PAGE + 1)} -{' '}
                  {Math.min(filtered.length, page * ITEMS_PER_PAGE)} of {filtered.length}{' '}
                  notifications
                </Typography>

                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, v) => {
                    setPage(v);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  shape="rounded"
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 700,
                      borderRadius: '8px',
                      color: isDark ? '#FFFFFF' : 'inherit',
                      '&.Mui-selected': {
                        bgcolor: PIXELEYE_COLORS.primary,
                        color: 'white',
                        '&:hover': {
                          bgcolor: PIXELEYE_COLORS.primaryHover,
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>

      <NotificationDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notification={selectedNotification}
      />

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
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
            Delete {selectedNotificationIds.length} notification
            {selectedNotificationIds.length === 1 ? '' : 's'}?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            This removes the selected tracker rows from the notification page.
          </Typography>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={() => setIsDeleteConfirmOpen(false)} disabled={deleteNotificationsMutation.isLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteSelected}
              disabled={deleteNotificationsMutation.isLoading}
            >
              Delete Selected
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </PixelEyePageShell>
  );
};

export default NotificationTracker;
