import {
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { HighPriorityLead } from './types';

interface ActionPanelProps {
  todayFollowUps: number;
  notAnswering: number;
  highPriorityCount: number;
  highPriorityLeads: HighPriorityLead[];
  loading?: boolean;
}

const ActionPanel = ({
  todayFollowUps,
  notAnswering,
  highPriorityCount,
  highPriorityLeads,
  loading = false,
}: ActionPanelProps) => {
  const hiddenHighPriorityCount = Math.max(highPriorityCount - highPriorityLeads.length, 0);

  const summaryItems = [
    { key: 'followups', label: 'Today Follow-ups', value: todayFollowUps, color: 'primary' as const },
    { key: 'notanswering', label: 'Not Answering', value: notAnswering, color: 'warning' as const },
    { key: 'priority', label: 'High Priority', value: highPriorityCount, color: 'error' as const },
  ].filter((item) => item.value > 0);

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
          Action Panel
        </Typography>

        {loading ? (
          <Stack direction="column" spacing={1.4} mb={2}>
            <Skeleton variant="rounded" height={28} />
            <Skeleton variant="rounded" height={28} />
          </Stack>
        ) : summaryItems.length > 0 ? (
          <Stack direction="row" gap={1} flexWrap="wrap" mb={2}>
            {summaryItems.map((item) => (
              <Chip
                key={item.key}
                label={`${item.label}: ${item.value}`}
                color={item.color}
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" mb={2}>
            No pending actions for the selected filters.
          </Typography>
        )}

        <Divider sx={{ mb: 1.4 }} />

        <Typography variant="subtitle2" color="text.secondary" fontWeight={700} mb={1}>
          Priority Lead Queue
        </Typography>

        {!loading && hiddenHighPriorityCount > 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Showing first {highPriorityLeads.length} leads (+{hiddenHighPriorityCount} more)
          </Typography>
        ) : null}

        {loading ? (
          <Stack direction="column" spacing={1.1}>
            {[1, 2, 3, 4].map((key) => (
              <Skeleton key={key} variant="rounded" height={52} />
            ))}
          </Stack>
        ) : highPriorityLeads.length > 0 ? (
          <List disablePadding dense>
            {highPriorityLeads.map((lead) => (
              <ListItem
                key={lead.id}
                alignItems="flex-start"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 1,
                  px: 1.2,
                }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {lead.customer_name}
                      </Typography>
                      <Chip size="small" label={lead.status} color="warning" sx={{ ml: 1 }} />
                    </Stack>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                      {lead.phone_number} | {lead.agent_name} | Follow-up: {lead.follow_up_date}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No high-priority leads in this view.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionPanel;
