import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  Chip,
  Checkbox,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Grid,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { Eye, Clock, CheckCircle2, XCircle, Phone, Bell, Trash2 } from 'lucide-react';
import useColorMode from 'hooks/useColorMode';
import type { NotificationState } from 'components/hooks/usePixelEyeNotificationsQuery';
import { PIXELEYE_COLORS } from '../pixel-eye/pixelEyeUi';
import dayjs from 'dayjs';

interface NotificationTrackerListProps {
  notifications: NotificationState[];
  loading?: boolean;
  onViewDetails: (notification: NotificationState) => void;
  selectedNotificationIds: number[];
  onToggleNotification: (notificationId: number) => void;
  onToggleAllVisible: () => void;
  allVisibleSelected: boolean;
  canDeleteNotifications: boolean;
  onDeleteSelected: () => void;
  deleteDisabled: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  scheduled: { label: 'Scheduled', color: '#EAB308', icon: Clock, bg: 'rgba(234, 179, 8, 0.1)' },
  cancelled: { label: 'Cancelled', color: '#EF4444', icon: XCircle, bg: 'rgba(239, 68, 68, 0.1)' },
  failed: { label: 'Failed', color: '#B91C1C', icon: XCircle, bg: 'rgba(185, 28, 28, 0.1)' },
};

const getReminderStatusConfig = (notification: NotificationState) => {
  const state = String(notification?.state || '').trim().toLowerCase();
  const completionSource = String(notification?.completion_source || '').trim().toLowerCase();

  if (state === 'scheduled') {
    return STATUS_CONFIG.scheduled;
  }

  if (state === 'completed') {
    if (completionSource === 'manual_handled') {
      return {
        label: 'Manually Handled',
        color: '#F59E0B',
        icon: CheckCircle2,
        bg: 'rgba(245, 158, 11, 0.1)',
      };
    }

    return {
      label: 'Notification Sent',
      color: '#22C55E',
      icon: CheckCircle2,
      bg: 'rgba(34, 197, 94, 0.1)',
    };
  }

  if (state === 'cancelled') {
    return STATUS_CONFIG.cancelled;
  }

  if (state === 'failed') {
    return STATUS_CONFIG.failed;
  }

  return {
    label: notification?.state || 'New',
    color: '#64748B',
    icon: Bell,
    bg: 'rgba(100, 116, 139, 0.1)',
  };
};

const NotificationItem = ({
  notification,
  onViewDetails,
  selected,
  onToggleNotification,
}: {
  notification: NotificationState;
  onViewDetails: (n: NotificationState) => void;
  selected: boolean;
  onToggleNotification: (notificationId: number) => void;
}) => {
  const { mode } = useColorMode();
  const isDark = mode === 'dark';
  const status = getReminderStatusConfig(notification);
  const { icon: StatusIcon, color, bg, label } = status;

  return (
    <Card
      onClick={() => onViewDetails(notification)}
      sx={{
        p: 2.5,
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(80, 120, 100, 0.15)' : 'rgba(226, 232, 240, 0.6)',
        bgcolor: isDark ? PIXELEYE_COLORS.card : '#ffffff',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.02)',
        '&:hover': {
          transform: 'scale(1.005) translateY(-2px)',
          boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 24px rgba(0,0,0,0.06)',
          borderColor: isDark ? 'rgba(134, 239, 172, 0.3)' : 'rgba(21, 106, 69, 0.2)',
        },
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* Status Indicator Area */}
        <Grid item xs={12} sm={3} md={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Checkbox
              checked={selected}
              onClick={(event) => event.stopPropagation()}
              onChange={() => onToggleNotification(notification.id)}
              sx={{
                color: isDark ? '#86EFAC' : '#166534',
                '&.Mui-checked': {
                  color: isDark ? '#BBF7D0' : '#15803D',
                },
              }}
            />
            <Box
              sx={{
                p: 1.5,
                borderRadius: '14px',
                bgcolor: bg,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 15px ${color}15`,
              }}
            >
              <StatusIcon size={24} />
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 900,
                  color: color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: '0.72rem',
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? PIXELEYE_COLORS.mutedText : 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  fontWeight: 500,
                }}
              >
                <Clock size={12} />{' '}
                {dayjs(notification.scheduled_at || notification.createdAt).format('hh:mm A')}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Customer & Info */}
        <Grid item xs={12} sm={6} md={7}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.8rem' }}>
                  {notification.customer_name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}
                  >
                    {notification.customer_name || 'Anonymous Customer'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDark ? PIXELEYE_COLORS.mutedText : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Phone size={12} /> {notification.phone_number || 'No Phone'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDark ? PIXELEYE_COLORS.mutedText : 'text.secondary',
                      display: 'block',
                      textTransform: 'uppercase',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                    }}
                  >
                    Trigger type
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: isDark ? '#E2E8F0' : 'inherit' }}
                  >
                    {notification.schedule_type?.replace(/_/g, ' ') || 'Manual'}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDark ? PIXELEYE_COLORS.mutedText : 'text.secondary',
                      display: 'block',
                      textTransform: 'uppercase',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                    }}
                  >
                    Stage
                  </Typography>
                  <Chip
                    label={notification.current_day ? `Day ${notification.current_day}` : 'Initial'}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      borderColor: isDark ? 'rgba(134, 239, 172, 0.3)' : 'rgba(21, 106, 69, 0.3)',
                      color: isDark ? '#86EFAC' : 'primary.main',
                      bgcolor: isDark ? 'rgba(134, 239, 172, 0.05)' : 'rgba(21, 106, 69, 0.02)',
                    }}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Grid>

        {/* Actions */}
        <Grid item xs={12} sm={3} md={3}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? '#CBD5E1' : 'text.primary',
                  display: 'block',
                  fontWeight: 700,
                }}
              >
                {dayjs(notification.scheduled_at || notification.createdAt).format('DD MMM, YYYY')}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? PIXELEYE_COLORS.mutedText : 'text.secondary',
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                }}
              >
                {notification.call_id?.slice(-8) || 'NOID'}
              </Typography>
            </Box>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 0.5, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            />
            <Tooltip title="View Detailed Log">
              <IconButton
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  color: isDark ? PIXELEYE_COLORS.mutedText : 'text.secondary',
                  borderRadius: '10px',
                  '&:hover': { bgcolor: PIXELEYE_COLORS.primary, color: 'white' },
                }}
              >
                <Eye size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};

const NotificationTrackerList: React.FC<NotificationTrackerListProps> = ({
  notifications,
  loading,
  onViewDetails,
  selectedNotificationIds,
  onToggleNotification,
  onToggleAllVisible,
  allVisibleSelected,
  canDeleteNotifications,
  onDeleteSelected,
  deleteDisabled,
}) => {
  if (loading) {
    return (
      <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Loading recent activity...
        </Typography>
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box
        sx={{
          py: 10,
          textAlign: 'center',
          bgcolor: 'rgba(255,255,255,0.01)',
          borderRadius: '16px',
          border: '1px dashed rgba(255,255,255,0.1)',
        }}
      >
        <Bell size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
        <Typography variant="h6">No notifications found</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Adjust your filters to see more results
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Checkbox
            checked={allVisibleSelected}
            disabled={notifications.length === 0}
            onChange={onToggleAllVisible}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Recent Activity{' '}
            <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
              showing {notifications.length} tracks
            </Typography>
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip label="Latest First" size="small" />
          <Chip label="All Channels" size="small" variant="outlined" />
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<Trash2 size={14} />}
            disabled={deleteDisabled}
            onClick={onDeleteSelected}
          >
            {canDeleteNotifications ? 'Delete Selected' : 'Selection Only'}
          </Button>
        </Stack>
      </Stack>

      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id || index}
          notification={notification}
          onViewDetails={onViewDetails}
          selected={selectedNotificationIds.includes(notification.id)}
          onToggleNotification={onToggleNotification}
        />
      ))}
    </Box>
  );
};

export default NotificationTrackerList;
