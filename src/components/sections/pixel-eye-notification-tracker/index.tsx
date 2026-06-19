import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  Typography,
  InputAdornment,
  CircularProgress,
  Card,
  IconButton,
  Pagination,
} from '@mui/material';
import {
  RotateCcw,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Clock,
  SlidersHorizontal,
  Download,
  Bell,
} from 'lucide-react';
import useColorMode from 'hooks/useColorMode';
import {
  usePixelEyeNotificationsQuery,
  usePixelEyeNotificationsSummaryQuery,
} from 'components/hooks/usePixelEyeNotificationsQuery';
import { PixelEyePageShell, PIXELEYE_COLORS } from '../pixel-eye/pixelEyeUi';
import NotificationTrackerList from './NotificationTrackerList';
import NotificationDetailsDrawer from './NotificationDetailsDrawer';
import PixelEyeField from '../pixel-eye/PixelEyeField';
import PixelEyeDatePicker from '../pixel-eye/PixelEyeDatePicker';
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

const NotificationTracker: React.FC<NotificationTrackerProps> = ({
  clientKey,
  searchText: externalSearchText,
}) => {
  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const [internalSearchText, setInternalSearchText] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);

  const searchText = externalSearchText || internalSearchText;

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = usePixelEyeNotificationsQuery(clientKey);

  const { data: summary, isLoading: summaryLoading } =
    usePixelEyeNotificationsSummaryQuery(clientKey);

  const filtered = useMemo(() => {
    return notifications.filter((n: any) => {
      if (stateFilter && n.state !== stateFilter) return false;
      if (typeFilter && n.schedule_type !== typeFilter) return false;

      if (dateFrom || dateTo) {
        const schedAt = n.scheduled_at ? dayjs(n.scheduled_at).format('YYYY-MM-DD') : '';
        const sentAt = n.notification_sent_at
          ? dayjs(n.notification_sent_at).format('YYYY-MM-DD')
          : '';
        const createdAt = n.createdAt ? dayjs(n.createdAt).format('YYYY-MM-DD') : '';

        const compareDate = schedAt || sentAt || createdAt;

        if (!compareDate) return false;
        if (dateFrom && compareDate < dateFrom) return false;
        if (dateTo && compareDate > dateTo) return false;
      }

      if (searchText) {
        const query = searchText.toLowerCase();
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
            .includes(query)
        );
      }

      return true;
    });
  }, [notifications, stateFilter, typeFilter, dateFrom, dateTo, searchText]);

  // Reset to page 1 when data changes (filters/search)
  React.useEffect(() => {
    setPage(1);
  }, [stateFilter, typeFilter, dateFrom, dateTo, searchText]);

  const paginatedNotifications = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const handleOpenDetails = (notification: any) => {
    setSelectedNotification(notification);
    setDrawerOpen(true);
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
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              onClick={() => refetch()}
              startIcon={<RotateCcw size={16} />}
              sx={{
                borderRadius: '12px',
                px: 2,
                height: 42,
                textTransform: 'none',
                fontWeight: 700,
                borderColor: isDark ? 'rgba(134, 239, 172, 0.2)' : 'rgba(0,0,0,0.1)',
                color: isDark ? '#86EFAC' : 'text.primary',
                '&:hover': {
                  borderColor: isDark ? '#86EFAC' : 'primary.main',
                  bgcolor: isDark ? 'rgba(134, 239, 172, 0.05)' : 'rgba(0,0,0,0.02)',
                },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download size={16} />}
              sx={{
                borderRadius: '12px',
                px: 2,
                height: 42,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: 'none',
                bgcolor: PIXELEYE_COLORS.primary,
                '&:hover': {
                  bgcolor: PIXELEYE_COLORS.primaryHover,
                  boxShadow: '0 4px 12px rgba(21, 106, 69, 0.3)',
                },
              }}
            >
              Export
            </Button>
          </Stack>
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
              label="Completed"
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
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
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
                    onChange={(val) => setDateFrom(val)}
                  />
                </Box>
                <Box sx={{ flexGrow: 1, maxWidth: { xs: '100%', lg: '160px' } }}>
                  <PixelEyeDatePicker
                    label="To"
                    value={dateTo}
                    fullWidth
                    onChange={(val) => setDateTo(val)}
                  />
                </Box>
                <IconButton
                  sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '12px',
                    p: 1.2,
                  }}
                >
                  <SlidersHorizontal size={18} />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {isError ? (
          <Box sx={{ p: 10, textAlign: 'center' }}>
            <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 16, opacity: 0.5 }} />
            <Typography variant="h6">Failed to sync tracker data</Typography>
            <Button
              variant="text"
              onClick={() => refetch()}
              startIcon={<RotateCcw size={16} />}
              sx={{ mt: 1 }}
            >
              Try again
            </Button>
          </Box>
        ) : (
          <>
            <NotificationTrackerList
              notifications={paginatedNotifications}
              loading={isLoading}
              onViewDetails={handleOpenDetails}
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
    </PixelEyePageShell>
  );
};

export default NotificationTracker;
