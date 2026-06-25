import React from 'react';
import { Box, Drawer, Grid, IconButton, Stack, Typography, Divider, Tooltip } from '@mui/material';
import { AlertCircle, Calendar, Clock, Hash, Info, Phone, User, X } from 'lucide-react';
import dayjs from 'dayjs';
import useColorMode from 'hooks/useColorMode';
import type { NotificationState } from 'components/hooks/usePixelEyeNotificationsQuery';
import { PIXELEYE_COLORS } from '../pixel-eye/pixelEyeUi';
import { normalizePixelEyeStatus } from '../pixel-eye/pixelEyeStatuses';

interface NotificationDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  notification: NotificationState | null;
}

const DetailItem = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: any;
  icon?: any;
  color?: string;
}) => {
  const { mode } = useColorMode();
  const displayValue =
    value === null || value === undefined || value === ''
      ? '-'
      : typeof value === 'boolean'
        ? value
          ? 'Yes'
          : 'No'
        : value;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        {Icon && <Icon size={14} style={{ color: PIXELEYE_COLORS.mutedText }} />}
        <Typography
          variant="overline"
          sx={{
            color: PIXELEYE_COLORS.mutedText,
            fontWeight: 700,
            letterSpacing: '0.05em',
            fontSize: '0.65rem',
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        sx={{
          color: color || (mode === 'dark' ? '#FFFFFF' : '#0F172A'),
          fontWeight: 600,
          wordBreak: 'break-word',
          fontSize: '0.9rem',
        }}
      >
        {displayValue}
      </Typography>
    </Box>
  );
};

const SectionHeader = ({
  title,
  icon: Icon,
  helperText,
}: {
  title: string;
  icon?: any;
  helperText?: string;
}) => (
  <Box sx={{ mb: 2, mt: 1 }}>
    <Stack direction="row" spacing={1} alignItems="center">
      {Icon && <Icon size={18} style={{ color: PIXELEYE_COLORS.primary }} />}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 800,
          color: PIXELEYE_COLORS.primary,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '0.75rem',
        }}
      >
        {title}
      </Typography>
      {helperText && (
        <Tooltip title={helperText} arrow placement="top">
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: `1px solid ${PIXELEYE_COLORS.border}`,
              color: PIXELEYE_COLORS.mutedText,
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'help',
              flexShrink: 0,
            }}
          >
            ?
          </Box>
        </Tooltip>
      )}
    </Stack>
    {helperText && (
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mt: 0.5,
          color: PIXELEYE_COLORS.mutedText,
          lineHeight: 1.4,
          fontSize: '0.72rem',
        }}
      >
        {helperText}
      </Typography>
    )}
  </Box>
);

const getReminderStatusLabel = (notification: NotificationState): string => {
  const state = String(notification?.state || '').trim().toLowerCase();
  const completionSource = String(notification?.completion_source || '').trim().toLowerCase();

  if (state === 'scheduled') return 'Scheduled';
  if (state === 'completed' && completionSource === 'manual_handled') return 'Manually Handled';
  if (state === 'completed') return 'Notification Sent';
  if (state === 'cancelled') return 'Cancelled';
  return notification?.state ? String(notification.state) : 'Not Available';
};

const getCallStatusLabel = (notification: NotificationState): string => {
  if (notification.compliance_status === null || notification.compliance_status === undefined) {
    return 'Not Available';
  }

  const status = String(notification?.compliance_status || '').trim().toUpperCase();
  if (!status) return 'Not Available';
  if (status === 'CALLED') return 'Call Done';
  if (status === 'PENDING') return 'Call Pending';
  if (status === 'MISSED') return 'Missed';
  if (status === 'CANCELLED') return 'Cancelled';
  if (status === 'IGNORED') return 'Ignored';
  return status;
};

const getOutcomeStatusLabel = (notification: NotificationState): string => {
  if (notification.outcome_status === 'Outcome Updated' || notification.outcome_status === 'Outcome Pending') {
    return notification.outcome_status;
  }

  const outcomeKeys = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'] as const;
  const hasOutcomeValue = outcomeKeys.some((key) => {
    const value = notification?.[key];
    return typeof value === 'string' ? Boolean(value.trim()) : Boolean(value);
  });

  return hasOutcomeValue ? 'Outcome Updated' : 'Outcome Pending';
};

const getLatestOutcomeValue = (notification: NotificationState): string => {
  const outcomeKeys = ['day_5', 'day_4', 'day_3', 'day_2', 'day_1'] as const;
  for (const key of outcomeKeys) {
    const value = normalizePixelEyeStatus(notification?.[key]);
    if (value) return value;
  }
  return '-';
};

const NotificationDetailsDrawer: React.FC<NotificationDetailsDrawerProps> = ({
  open,
  onClose,
  notification,
}) => {
  const { mode } = useColorMode();

  if (!notification) return null;

  const formatDate = (date: any) => (date ? dayjs(date).format('DD MMM YYYY, hh:mm A') : '-');

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 480 },
          backgroundColor: mode === 'dark' ? '#0B1511' : '#FFFFFF',
          backgroundImage: 'none',
          borderLeft: `1px solid ${PIXELEYE_COLORS.border}`,
          p: 0,
        },
      }}
    >
      <Box sx={{ p: 3, borderBottom: `1px solid ${PIXELEYE_COLORS.border}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Notification Details
            </Typography>
            <Typography variant="body2" sx={{ color: PIXELEYE_COLORS.mutedText }}>
              Review reminder schedule and delivery information.
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: PIXELEYE_COLORS.mutedText }}>
            <X size={20} />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
        {notification.cancel_reason && notification.state === 'cancelled' && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: '12px',
              backgroundColor: 'rgba(220, 38, 38, 0.08)',
              border: `1px solid ${PIXELEYE_COLORS.dangerBorder}`,
            }}
          >
            <Stack direction="row" spacing={1.5}>
              <AlertCircle size={20} style={{ color: '#FCA5A5', marginTop: 2 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FCA5A5' }}>
                  Cancelled
                </Typography>
                <Typography variant="body2" sx={{ color: '#FCA5A5', opacity: 0.9 }}>
                  {notification.cancel_reason}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        <SectionHeader title="Lead Information" icon={User} />
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <DetailItem label="Customer" value={notification.customer_name} />
          </Grid>
          <Grid item xs={6}>
            <DetailItem label="Phone" value={notification.phone_number} />
          </Grid>
          <Grid item xs={6}>
            <DetailItem label="Agent" value={notification.agent_name || 'Unassigned'} />
          </Grid>
          <Grid item xs={6}>
            <DetailItem label="Call ID" value={notification.call_id} icon={Hash} />
          </Grid>
          <Grid item xs={6}>
            <DetailItem
              label="Follow-up Stage"
              value={notification.current_day ? `Day ${notification.current_day}` : 'Initial'}
            />
          </Grid>
          <Grid item xs={6}>
            <DetailItem label="Last Status" value={normalizePixelEyeStatus(notification.last_status)} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: PIXELEYE_COLORS.border, opacity: 0.5 }} />

        <SectionHeader
          title="Schedule Information"
          icon={Calendar}
          helperText="Shows whether the follow-up reminder/notification was scheduled or sent."
        />
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <DetailItem
              label="Reminder Status"
              value={getReminderStatusLabel(notification)}
            />
          </Grid>
          <Grid item xs={6}>
            <DetailItem
              label="Schedule Type"
              value={notification.schedule_type?.replace(/_/g, ' ') || '-'}
            />
          </Grid>
          <Grid item xs={12}>
            <DetailItem
              label="Scheduled At"
              value={formatDate(notification.scheduled_at)}
              icon={Clock}
            />
          </Grid>
          <Grid item xs={6}>
            <DetailItem
              label="Notification Sent"
              value={notification.notification_sent ? 'Yes' : 'No'}
            />
          </Grid>
          <Grid item xs={6}>
            <DetailItem label="Sent At" value={formatDate(notification.notification_sent_at)} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: PIXELEYE_COLORS.border, opacity: 0.5 }} />

        <SectionHeader
          title="Call Status"
          icon={Phone}
          helperText="Shows whether the customer was actually called, based on Runo call log matching."
        />
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <DetailItem label="Call Status" value={getCallStatusLabel(notification)} />
          </Grid>
          <Grid item xs={6}>
            <DetailItem
              label="Call Evidence"
              value={notification.compliance_status ? 'Matched' : 'Not Available'}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: PIXELEYE_COLORS.border, opacity: 0.5 }} />

        <SectionHeader
          title="Outcome Status"
          icon={Info}
          helperText="Shows whether the agent saved the customer result using Update Outcome."
        />
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <DetailItem label="Outcome Status" value={getOutcomeStatusLabel(notification)} />
          </Grid>
          <Grid item xs={6}>
            <DetailItem label="Latest Outcome" value={getLatestOutcomeValue(notification)} />
          </Grid>
          <Grid item xs={6}>
            <DetailItem
              label="Outcome Updated At"
              value={formatDate(notification.updatedAt)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: PIXELEYE_COLORS.border, opacity: 0.5 }} />

        <SectionHeader title="Lifecycle" icon={Info} />
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <DetailItem label="Created At" value={formatDate(notification.createdAt)} />
          </Grid>
          <Grid item xs={6}>
            <DetailItem label="Updated At" value={formatDate(notification.updatedAt)} />
          </Grid>
          {notification.state === 'completed' && (
            <Grid item xs={6}>
              <DetailItem
                label="Completed At"
                value={formatDate(notification.notification_sent_at || notification.updatedAt)}
              />
            </Grid>
          )}
          {notification.state === 'cancelled' && (
            <Grid item xs={6}>
              <DetailItem label="Cancelled At" value={formatDate(notification.updatedAt)} />
            </Grid>
          )}
          <Grid item xs={6}>
            <DetailItem
              label="Permanently Closed"
              value={notification.permanently_closed ? 'Yes' : 'No'}
            />
          </Grid>
          {notification.reason && (
            <Grid item xs={12}>
              <DetailItem label="Internal Note" value={notification.reason} />
            </Grid>
          )}
        </Grid>
      </Box>
    </Drawer>
  );
};

export default NotificationDetailsDrawer;
