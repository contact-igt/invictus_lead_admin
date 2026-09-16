import { useMemo } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useBirthwaveScope } from '../useBirthwaveScope';
import { useBirthwaveTasksQuery } from 'components/hooks/useBirthwaveQuery';
import { BirthwaveTask } from 'services/birthwave';
import { buildClientPortalPath } from 'routes/paths';
import PortalPageHeader from '../PortalPageHeader';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';

// BW-FIX-003: Follow-ups is a view over the canonical Next Action store
// (birthwave_tasks where task_type = FOLLOW_UP), not over the legacy
// birthwave_leads.next_follow_up column. Only birthwave_tasks is written by
// the outcome engine when a telecaller records FOLLOW_UP_REQUIRED /
// CALL_LATER (birthwaveOutcome.service.js -> taskType "FOLLOW_UP"); the
// legacy column is only ever set by the manual Lead form and is never
// updated by the task engine, so binding this page to it made every
// engine-created follow-up invisible here. See
// BIRTHWAVE_V1_FINAL_RECONCILIATION_LEDGER.md (BW-FIX-003).
const ACTIVE_TASK_STATUSES = ['PENDING', 'IN_PROGRESS'];

const dayDiff = (value: string) => {
  const target = new Date(value);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

interface GroupProps {
  title: string;
  tone: { bg: string; fg: string };
  tasks: BirthwaveTask[];
  onOpen: (leadId: number) => void;
}

const Group = ({ title, tone, tasks, onOpen }: GroupProps) => (
  <Box sx={{ bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', overflow: 'hidden', mb: 2.5 }}>
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: TEXT_DARK }}>{title}</Typography>
      <Chip label={tasks.length} size="small" sx={{ bgcolor: tone.bg, color: tone.fg, fontWeight: 700, fontSize: '0.7rem' }} />
    </Stack>
    {tasks.length === 0 ? (
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography sx={{ color: TEXT_MUTED, fontSize: '0.85rem' }}>Nothing here.</Typography>
      </Box>
    ) : (
      tasks.map((task, index) => (
        <Stack
          key={task.id}
          direction="row"
          alignItems="center"
          spacing={2}
          onClick={() => onOpen(task.lead_id)}
          sx={{
            px: 3,
            py: 1.75,
            borderTop: index === 0 ? 'none' : '1px solid',
            borderColor: CARD_BORDER,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'var(--bw-surface-hover, rgba(0,0,0,0.02))' },
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT_DARK }}>
              {task.lead?.name || `Lead #${task.lead_id}`}
            </Typography>
            <Typography noWrap sx={{ fontSize: '0.75rem', color: TEXT_MUTED }}>
              {task.lead?.phone || '—'} · {task.lead?.service || 'General enquiry'}
              {task.owner?.username ? ` · ${task.owner.username}` : ''}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: tone.fg }}>
            {formatDate(task.due_at)}
          </Typography>
        </Stack>
      ))
    )}
  </Box>
);

const FollowUpsPage = () => {
  const { hasScope, scopedClientKey, activeClientKey } = useBirthwaveScope();
  const navigate = useNavigate();

  // The list endpoint filters by a single status value, so active follow-ups
  // (PENDING + IN_PROGRESS) are narrowed client-side from one task_type page.
  const { data, isLoading } = useBirthwaveTasksQuery(
    scopedClientKey,
    { task_type: 'FOLLOW_UP', limit: 200 },
    { enabled: hasScope },
  );

  const openLead = (leadId: number) =>
    navigate(buildClientPortalPath(activeClientKey, `leads/${leadId}`));

  const activeFollowUps = useMemo(
    () => (data?.data ?? []).filter((task) => ACTIVE_TASK_STATUSES.includes(task.status)),
    [data],
  );

  const { overdue, today, upcoming } = useMemo(() => {
    const groups = { overdue: [] as BirthwaveTask[], today: [] as BirthwaveTask[], upcoming: [] as BirthwaveTask[] };
    activeFollowUps.forEach((task) => {
      const diff = dayDiff(task.due_at);
      if (diff < 0) groups.overdue.push(task);
      else if (diff === 0) groups.today.push(task);
      else groups.upcoming.push(task);
    });
    const byDate = (a: BirthwaveTask, b: BirthwaveTask) =>
      new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    groups.overdue.sort(byDate);
    groups.today.sort(byDate);
    groups.upcoming.sort(byDate);
    return groups;
  }, [activeFollowUps]);

  if (!hasScope) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Please select a client.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <PortalPageHeader title="Follow-ups" subtitle="Every open FOLLOW_UP task, grouped by urgency" />

      {isLoading ? (
        <Typography sx={{ color: TEXT_MUTED }}>Loading...</Typography>
      ) : (
        <>
          <Group title="Overdue" tone={{ bg: 'var(--bw-tint-red)', fg: '#EF4444' }} tasks={overdue} onOpen={openLead} />
          <Group title="Today" tone={{ bg: 'var(--bw-tint-amber)', fg: '#F59E0B' }} tasks={today} onOpen={openLead} />
          <Group title="Upcoming" tone={{ bg: 'var(--bw-tint-blue)', fg: '#2563EB' }} tasks={upcoming} onOpen={openLead} />
        </>
      )}
    </Box>
  );
};

export default FollowUpsPage;
