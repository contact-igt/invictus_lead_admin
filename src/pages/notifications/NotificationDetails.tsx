import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePixelEyeNotificationsQuery } from 'components/hooks/usePixelEyeNotificationsQuery';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Card,
  Chip,
  Button,
  Grid,
  Divider,
  Paper,
} from '@mui/material';
import { ArrowLeft, Clock, User, Phone, Tag, Database, Bell } from 'lucide-react';
import useColorMode from 'hooks/useColorMode';
import {
  PIXELEYE_COLORS,
  getPixelEyeCardSx,
  getPixelEyeButtonSx,
} from 'components/sections/pixel-eye/pixelEyeUi';
import PageLoader from 'components/loader/PageLoader';

const DetailItem = ({ label, value, icon: Icon }: { label: string; value: any; icon?: any }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        {Icon && <Icon size={14} color={PIXELEYE_COLORS.mutedText} />}
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: PIXELEYE_COLORS.mutedText,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography variant="body1" fontWeight={600} color="text.primary">
        {value || '---'}
      </Typography>
    </Box>
  );
};

const NotificationDetails: React.FC = () => {
  const { clientKey, notificationId } = useParams<{ clientKey: string; notificationId: string }>();
  const navigate = useNavigate();
  const { mode } = useColorMode();

  const { data: notifications = [], isLoading } = usePixelEyeNotificationsQuery(clientKey);

  const notification = useMemo(() => {
    return notifications.find((n) => String(n.id) === notificationId);
  }, [notifications, notificationId]);

  if (isLoading) return <PageLoader />;
  if (!notification) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Notification not found</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  const statusColor =
    notification.state === 'completed'
      ? 'success'
      : notification.state === 'scheduled'
        ? 'warning'
        : notification.state === 'cancelled'
          ? 'error'
          : 'default';

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={4}>
        <IconButton onClick={() => navigate(-1)} sx={getPixelEyeButtonSx(mode as any, 'secondary')}>
          <ArrowLeft size={20} />
        </IconButton>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" fontWeight={800}>
              Notification Detail
            </Typography>
            <Chip
              label={notification.state?.toUpperCase()}
              color={statusColor}
              size="small"
              sx={{ fontWeight: 800, borderRadius: '6px' }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Detail view for record #{notification.id}
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ ...getPixelEyeCardSx(mode as any), p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={800} mb={3}>
              General Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DetailItem label="Customer Name" value={notification.customer_name} icon={User} />
                <DetailItem label="Phone Number" value={notification.phone_number} icon={Phone} />
                <DetailItem label="Schedule Type" value={notification.schedule_type} icon={Tag} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Scheduled At"
                  value={
                    notification.scheduled_at
                      ? new Date(notification.scheduled_at).toLocaleString()
                      : '-'
                  }
                  icon={Clock}
                />
                <DetailItem label="Current State" value={notification.state} icon={Bell} />
                <DetailItem label="Call ID" value={notification.call_id} icon={Database} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, opacity: 0.1 }} />

            <Typography variant="h6" fontWeight={800} mb={3}>
              Timeline & Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Created At"
                  value={new Date(notification.createdAt).toLocaleString()}
                  icon={Clock}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Last Updated"
                  value={new Date(notification.updatedAt).toLocaleString()}
                  icon={Clock}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Sent Status"
                  value={notification.notification_sent ? 'Already Sent' : 'Pending/Not Sent'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Cycle Completed"
                  value={notification.thirty_min_cycle_completed ? 'Yes' : 'No'}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3} height="100%">
            <Card sx={{ ...getPixelEyeCardSx(mode as any), p: 3 }}>
              <Typography variant="h6" fontWeight={800} mb={2}>
                Raw State Data
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                  borderRadius: '12px',
                  maxHeight: 400,
                  overflow: 'auto',
                }}
              >
                <pre
                  style={{
                    fontSize: '0.75rem',
                    margin: 0,
                    color: PIXELEYE_COLORS.mutedText,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(notification, null, 2)}
                </pre>
              </Paper>
            </Card>

            <Card sx={{ ...getPixelEyeCardSx(mode as any), p: 3, flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={800} mb={2}>
                Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={getPixelEyeButtonSx(mode as any, 'primary')}
                >
                  Reschedule Manually
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={getPixelEyeButtonSx(mode as any, 'secondary')}
                >
                  Send Test Webhook
                </Button>
                {notification.state !== 'cancelled' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={getPixelEyeButtonSx(mode as any, 'danger')}
                  >
                    Cancel Future Notifications
                  </Button>
                )}
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NotificationDetails;
