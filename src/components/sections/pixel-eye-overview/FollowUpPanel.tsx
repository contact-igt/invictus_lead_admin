import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { FollowUpMetrics, FollowUpReminder } from './types';

interface FollowUpPanelProps {
  followUps: FollowUpMetrics;
  loading?: boolean;
}

const statusColor = (status: string): 'default' | 'warning' | 'error' | 'success' | 'info' => {
  const s = status.toLowerCase();
  if (s === 'appointment fixed') return 'success';
  if (s === 'hot follow-up' || s === 'follow-up required') return 'error';
  if (s === 'visited' || s === 'walk-in' || s === 'closed') return 'success';
  if (s === 'not interested' || s === 'not willing to come now') return 'error';
  return 'warning';
};

const relativeLabel = (days: number): string => {
  if (days === 0) return 'Today';
  if (days === -1) return '1 day overdue';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
};

const relativeLabelColor = (days: number): string => {
  if (days < 0) return '#D32F2F';
  if (days === 0) return '#ED6C02';
  return '#0288D1';
};

const LeadRow = ({ lead }: { lead: FollowUpReminder }) => (
  <ListItem
    alignItems="flex-start"
    sx={{
      border: '1px solid',
      borderColor: lead.daysRelative < 0 ? 'rgba(211,47,47,0.2)' : 'divider',
      borderRadius: 2,
      mb: 1,
      px: 1.4,
      bgcolor: lead.daysRelative < 0 ? 'rgba(211,47,47,0.03)' : 'transparent',
    }}
  >
    <ListItemText
      primary={
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ flex: 1 }}>
            {lead.customer_name}
          </Typography>
          <Chip size="small" label={lead.status} color={statusColor(lead.status)} sx={{ flexShrink: 0 }} />
        </Stack>
      }
      secondary={
        <Stack direction="column" spacing={0.2} mt={0.3}>
          <Typography variant="caption" color="text.secondary">
            {lead.phone_number} &bull; {lead.agent_name}
          </Typography>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: relativeLabelColor(lead.daysRelative) }}
          >
            {relativeLabel(lead.daysRelative)} &mdash; {lead.follow_up_date}
          </Typography>
        </Stack>
      }
    />
  </ListItem>
);

const EmptyState = ({ message }: { message: string }) => (
  <Typography variant="body2" color="text.secondary" sx={{ py: 1.5, textAlign: 'center' }}>
    {message}
  </Typography>
);

const FollowUpPanel = ({ followUps, loading = false }: FollowUpPanelProps) => {
  const [tab, setTab] = useState<0 | 1 | 2>(0);

  const tabs = [
    {
      label: 'Overdue',
      count: followUps.overdueCount,
      leads: followUps.overdueLeads,
      color: '#D32F2F' as const,
      empty: 'No overdue follow-ups.',
    },
    {
      label: 'Today',
      count: followUps.todayCount,
      leads: followUps.todayLeads,
      color: '#ED6C02' as const,
      empty: 'No follow-ups scheduled for today.',
    },
    {
      label: 'This Week',
      count: followUps.upcomingCount,
      leads: followUps.upcomingLeads,
      color: '#0288D1' as const,
      empty: 'No upcoming follow-ups in the next 7 days.',
    },
  ] as const;

  const active = tabs[tab];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFCFF 100%)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} mb={1.2}>
          Follow-up Reminders
        </Typography>

        {loading ? (
          <Stack spacing={1}>
            <Skeleton variant="rounded" height={36} />
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} variant="rounded" height={60} />
            ))}
          </Stack>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.5 }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v as 0 | 1 | 2)}
                variant="fullWidth"
                sx={{ minHeight: 36 }}
              >
                {tabs.map((t, i) => (
                  <Tab
                    key={t.label}
                    value={i}
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.6}>
                        <span>{t.label}</span>
                        {t.count > 0 && (
                          <Box
                            component="span"
                            sx={{
                              fontSize: 11,
                              fontWeight: 800,
                              px: 0.7,
                              py: 0.1,
                              borderRadius: 10,
                              bgcolor: t.color,
                              color: '#fff',
                              lineHeight: 1.6,
                            }}
                          >
                            {t.count}
                          </Box>
                        )}
                      </Stack>
                    }
                    sx={{ minHeight: 36, fontSize: 12, fontWeight: 700, textTransform: 'none' }}
                  />
                ))}
              </Tabs>
            </Box>

            {active.leads.length > 0 ? (
              <>
                {active.count > active.leads.length && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Showing first {active.leads.length} of {active.count}
                  </Typography>
                )}
                <List disablePadding dense>
                  {active.leads.map((lead) => (
                    <LeadRow key={lead.id} lead={lead} />
                  ))}
                </List>
              </>
            ) : (
              <EmptyState message={active.empty} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowUpPanel;
