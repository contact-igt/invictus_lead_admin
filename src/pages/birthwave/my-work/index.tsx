import { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildClientPortalPath } from 'routes/paths';
import {
  useBirthwaveMyWorkQuery,
  useBirthwaveTeamContextQuery,
  useBirthwaveTeamsQuery,
  useBirthwaveTeamWorkQuery,
  useCompleteBirthwaveTaskMutation,
  useRescheduleBirthwaveTaskMutation,
  useStartBirthwaveTaskMutation,
} from 'components/hooks/useBirthwaveQuery';
import { BirthwaveWorkItem, BirthwaveWorkResponse } from 'services/birthwave';
import { useBirthwaveScope } from '../useBirthwaveScope';
import PortalPageHeader from '../PortalPageHeader';
import OutcomeDialog from '../OutcomeDialog';

const BORDER = 'var(--bw-border)';
const TEXT = 'var(--bw-text)';
const MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';
const SECTIONS = [
  { key: 'NOW', label: 'Now', empty: 'No tasks due right now.' },
  { key: 'TODAY', label: 'Today', empty: "You're caught up for today." },
  { key: 'FOLLOW_UPS', label: 'Follow-ups', empty: 'No follow-ups scheduled.' },
  { key: 'RETRIES', label: 'Retries', empty: 'No retries scheduled.' },
  { key: 'UPCOMING', label: 'Upcoming', empty: 'No upcoming tasks.' },
  { key: 'OVERDUE', label: 'Overdue', empty: 'No overdue tasks.' },
] as const;

type ActionDialog = 'complete' | 'reschedule' | null;

const label = (value: string | null | undefined) => String(value || '').replace(/_/g, ' ');
const formatDateTime = (value: string | null | undefined) => value
  ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  : '—';
const localInputValue = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const TaskCard = ({
  task,
  onOpenLead,
  onStart,
  onComplete,
  onReschedule,
  onOutcome,
  starting,
}: {
  task: BirthwaveWorkItem;
  onOpenLead: (task: BirthwaveWorkItem) => void;
  onStart: (task: BirthwaveWorkItem) => void;
  onComplete: (task: BirthwaveWorkItem) => void;
  onReschedule: (task: BirthwaveWorkItem) => void;
  onOutcome: (task: BirthwaveWorkItem) => void;
  starting: boolean;
}) => {
  const actionable = task.task_status === 'PENDING' || task.task_status === 'IN_PROGRESS';
  const outcomeTask = ['INITIAL_CALL', 'RETRY_CALL', 'FOLLOW_UP'].includes(task.task_type);
  return (
    <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2, borderTop: '1px solid', borderColor: BORDER }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography sx={{ color: TEXT, fontWeight: 750, fontSize: '0.95rem' }}>{task.customer_name}</Typography>
            <Chip size="small" label={task.is_overdue ? 'OVERDUE' : label(task.task_status)} color={task.is_overdue ? 'error' : task.task_status === 'IN_PROGRESS' ? 'info' : 'default'} sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem' }} />
            <Chip size="small" label={label(task.priority)} sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', bgcolor: task.priority === 'HIGH' ? 'var(--bw-tint-amber)' : 'var(--bw-tint-blue)' }} />
          </Stack>
          <Typography sx={{ color: MUTED, fontSize: '0.8rem', mt: 0.45 }}>
            {task.service || 'General enquiry'} · {label(task.task_type)} · Due {formatDateTime(task.due_at)}
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
            <Typography sx={{ color: MUTED, fontSize: '0.76rem' }}>{task.phone || 'No phone'}</Typography>
            {task.source && <Typography sx={{ color: MUTED, fontSize: '0.76rem' }}>Source: {task.source}</Typography>}
            {task.team && <Typography sx={{ color: MUTED, fontSize: '0.76rem' }}>Team: {task.team.name}</Typography>}
          </Stack>
          {task.last_note && (
            <Typography sx={{ color: TEXT, fontSize: '0.78rem', mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              <strong>Last note:</strong> {task.last_note.text || '—'}{task.last_note.author ? ` · ${task.last_note.author}` : ''}
            </Typography>
          )}
          {task.last_activity && !task.last_note && (
            <Typography sx={{ color: MUTED, fontSize: '0.78rem', mt: 1 }}>
              {task.last_activity.title} · {formatDateTime(task.last_activity.timestamp)}
            </Typography>
          )}
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
          <Button size="small" variant="outlined" onClick={() => onOpenLead(task)} sx={{ textTransform: 'none', borderColor: BORDER, color: TEXT }}>
            Open Lead
          </Button>
          {actionable && task.task_status === 'PENDING' && (
            <Button size="small" variant="contained" disabled={starting} onClick={() => onStart(task)} sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none', '&:hover': { bgcolor: '#218D68', boxShadow: 'none' } }}>
              {starting ? 'Starting…' : 'Start'}
            </Button>
          )}
          {actionable && (
            <>
              {outcomeTask ? <Button size="small" variant="outlined" disabled={task.task_status === 'PENDING'} onClick={() => onOutcome(task)} sx={{ textTransform: 'none', borderColor: GREEN, color: GREEN }}>
                Record Outcome
              </Button> : <Button size="small" variant="outlined" onClick={() => onComplete(task)} sx={{ textTransform: 'none', borderColor: GREEN, color: GREEN }}>Complete</Button>}
              <Button size="small" variant="text" onClick={() => onReschedule(task)} sx={{ textTransform: 'none', color: MUTED }}>
                Reschedule
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

const QueueSection = ({
  section,
  response,
  handlers,
}: {
  section: typeof SECTIONS[number];
  response?: BirthwaveWorkResponse;
  handlers: {
    openLead: (task: BirthwaveWorkItem) => void;
    start: (task: BirthwaveWorkItem) => void;
    complete: (task: BirthwaveWorkItem) => void;
    reschedule: (task: BirthwaveWorkItem) => void;
    outcome: (task: BirthwaveWorkItem) => void;
    starting: boolean;
  };
}) => {
  const data = response?.sections?.[section.key];
  return (
    <Box sx={{ bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: BORDER, borderRadius: '14px', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: { xs: 2, sm: 2.5 }, py: 1.75 }}>
        <Typography sx={{ color: TEXT, fontWeight: 750 }}>{section.label}</Typography>
        <Chip size="small" label={data?.pagination.total ?? 0} sx={{ bgcolor: section.key === 'OVERDUE' ? 'var(--bw-tint-red)' : 'var(--bw-tint-blue)', color: section.key === 'OVERDUE' ? '#EF4444' : '#2563EB', fontWeight: 750 }} />
      </Stack>
      {!data?.tasks.length ? (
        <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2, borderTop: '1px solid', borderColor: BORDER }}>
          <Typography sx={{ color: MUTED, fontSize: '0.84rem' }}>{section.empty}</Typography>
        </Box>
      ) : data.tasks.map((task) => <TaskCard key={task.task_id} task={task} onOpenLead={handlers.openLead} onStart={handlers.start} onComplete={handlers.complete} onReschedule={handlers.reschedule} onOutcome={handlers.outcome} starting={handlers.starting} />)}
    </Box>
  );
};

const MyWorkPage = () => {
  const { hasScope, scopedClientKey } = useBirthwaveScope();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<'my' | 'team'>(() => searchParams.get('view') === 'team' ? 'team' : 'my');
  const [section, setSection] = useState<typeof SECTIONS[number]['key']>('NOW');
  const [search, setSearch] = useState('');
  const [teamTaskType, setTeamTaskType] = useState('');
  const [teamPriority, setTeamPriority] = useState('');
  const [teamOwnerId, setTeamOwnerId] = useState('');
  const [teamId, setTeamId] = useState(() => searchParams.get('team_id') || '');
  const [dialog, setDialog] = useState<ActionDialog>(null);
  const [selectedTask, setSelectedTask] = useState<BirthwaveWorkItem | null>(null);
  const [outcomeTask, setOutcomeTask] = useState<BirthwaveWorkItem | null>(null);
  const [reason, setReason] = useState('');
  const [nextDueAt, setNextDueAt] = useState('');
  const [error, setError] = useState('');
  const { data: teamContext } = useBirthwaveTeamContextQuery(scopedClientKey, { enabled: hasScope });
  const canTeamWork = Boolean(teamContext?.is_admin || teamContext?.memberships?.some((member) => member.status === 'ACTIVE' && member.operational_role === 'TEAM_MANAGER'));
  const params = useMemo(() => ({ limit: 25, page: 1, search: search || undefined }), [search]);
  const teamParams = useMemo(
    () => ({
      limit: 25,
      page: 1,
      search: search || undefined,
      task_type: teamTaskType || undefined,
      priority: teamPriority || undefined,
      owner_id: teamOwnerId || undefined,
      team_id: teamId || undefined,
    }),
    [search, teamTaskType, teamPriority, teamOwnerId, teamId],
  );
  const myQuery = useBirthwaveMyWorkQuery(scopedClientKey, params, { enabled: hasScope });
  const teamQuery = useBirthwaveTeamWorkQuery(scopedClientKey, teamParams, { enabled: hasScope && canTeamWork && view === 'team' });
  const teamsQuery = useBirthwaveTeamsQuery(scopedClientKey, { active: true, limit: 100 }, { enabled: hasScope && canTeamWork });
  const response = view === 'team' ? teamQuery.data : myQuery.data;
  const loading = view === 'team' ? teamQuery.isLoading : myQuery.isLoading;
  const start = useStartBirthwaveTaskMutation(scopedClientKey);
  const complete = useCompleteBirthwaveTaskMutation(scopedClientKey);
  const reschedule = useRescheduleBirthwaveTaskMutation(scopedClientKey);

  const openDialog = (type: ActionDialog, task: BirthwaveWorkItem) => {
    setSelectedTask(task);
    setDialog(type);
    setReason('');
    setError('');
    setNextDueAt(type === 'reschedule' ? localInputValue(task.due_at) : '');
  };

  const submitAction = () => {
    if (!selectedTask || !reason.trim()) { setError('Please enter a reason.'); return; }
    if (dialog === 'reschedule') {
      if (!nextDueAt) { setError('Choose a new date and time.'); return; }
      reschedule.mutate({ taskId: selectedTask.task_id, data: { due_at: new Date(nextDueAt).toISOString(), reason: reason.trim() } }, { onSuccess: () => setDialog(null) });
      return;
    }
    const successorDueAt = selectedTask.primary_next_action ? nextDueAt : '';
    if (selectedTask.primary_next_action && !successorDueAt) { setError('This Lead requires a next action. Choose its due date and time.'); return; }
    complete.mutate({
      taskId: selectedTask.task_id,
      data: {
        completion_reason: reason.trim(),
        ...(successorDueAt ? { successor: { task_type: 'MANUAL_TASK', due_at: new Date(successorDueAt).toISOString() } } : {}),
      },
    }, { onSuccess: () => setDialog(null) });
  };

  if (!hasScope) return <Box sx={{ p: 4 }}><Typography color="text.secondary">Please select a client.</Typography></Box>;
  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <PortalPageHeader title={view === 'team' ? 'Team Work' : 'My Work'} subtitle={view === 'team' ? 'Operational queue for your authorized Birthwave teams' : 'Your next actionable Birthwave tasks, prioritized by due time'} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2 }}>
        {canTeamWork && <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, value) => value && setView(value)}>
          <ToggleButton value="my" sx={{ textTransform: 'none' }}>My Work</ToggleButton>
          <ToggleButton value="team" sx={{ textTransform: 'none' }}>Team Work</ToggleButton>
        </ToggleButtonGroup>}
        <TextField size="small" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, phone, or Lead ID" sx={{ minWidth: { sm: 300 } }} />
        {view === 'team' && (
          <>
            <FormControl size="small" sx={{ minWidth: { sm: 160 } }}>
              <InputLabel id="birthwave-team-work-team-label">Team</InputLabel>
              <Select labelId="birthwave-team-work-team-label" label="Team" value={teamId} onChange={(event) => setTeamId(event.target.value)}>
                <MenuItem value="">All teams</MenuItem>
                {(teamsQuery.data || []).map((team) => <MenuItem key={team.id} value={String(team.id)}>{team.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { sm: 160 } }}>
              <InputLabel id="birthwave-team-work-task-label">Task type</InputLabel>
              <Select labelId="birthwave-team-work-task-label" label="Task type" value={teamTaskType} onChange={(event) => setTeamTaskType(event.target.value)}>
                <MenuItem value="">All task types</MenuItem>
                {['INITIAL_CALL', 'RETRY_CALL', 'FOLLOW_UP', 'APPOINTMENT_CONFIRMATION', 'NO_SHOW_RECOVERY', 'MANUAL_TASK'].map((value) => (
                  <MenuItem key={value} value={value}>{label(value)}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { sm: 130 } }}>
              <InputLabel id="birthwave-team-work-priority-label">Priority</InputLabel>
              <Select labelId="birthwave-team-work-priority-label" label="Priority" value={teamPriority} onChange={(event) => setTeamPriority(event.target.value)}>
                <MenuItem value="">All priority</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="NORMAL">Normal</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { sm: 160 } }}>
              <InputLabel id="birthwave-team-work-owner-label">Owner</InputLabel>
              <Select labelId="birthwave-team-work-owner-label" label="Owner" value={teamOwnerId} onChange={(event) => setTeamOwnerId(event.target.value)}>
                <MenuItem value="">All owners</MenuItem>
                {(teamQuery.data?.summary?.by_owner || []).map((row) => (
                  <MenuItem key={row.owner.id} value={String(row.owner.id)}>{row.owner.username}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Chip label={`Due Today ${response?.counts.due_today ?? 0}`} />
        <Chip label={`Follow-ups ${response?.counts.follow_ups ?? 0}`} />
        <Chip label={`Retries ${response?.counts.retries ?? 0}`} />
        <Chip label={`Overdue ${response?.counts.overdue ?? 0}`} color={response?.counts.overdue ? 'error' : 'default'} />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 0.5 }}>
        {SECTIONS.map((item) => <Button key={item.key} size="small" variant={section === item.key ? 'contained' : 'outlined'} onClick={() => setSection(item.key)} sx={{ flexShrink: 0, textTransform: 'none' }}>{item.label}</Button>)}
      </Stack>
      {view === 'team' && response?.summary?.by_owner?.length ? (
        <Box sx={{ mb: 2.5, bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: BORDER, borderRadius: '14px', p: { xs: 2, sm: 2.5 } }}>
          <Typography sx={{ color: TEXT, fontWeight: 750, mb: 1.25 }}>By Telecaller</Typography>
          <Stack divider={<Divider flexItem />}>
            {response.summary.by_owner.map((row) => <Stack key={row.owner.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
              <Typography sx={{ color: TEXT, fontSize: '0.86rem', fontWeight: 650 }}>{row.owner.username}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                <Chip size="small" label={`Today: ${row.today}`} />
                <Chip size="small" label={`Completed: ${row.completed}`} color="success" variant="outlined" />
                <Chip size="small" label={`Remaining: ${row.remaining}`} />
                <Chip size="small" label={`Overdue: ${row.overdue}`} color={row.overdue ? 'error' : 'default'} />
              </Stack>
            </Stack>)}
          </Stack>
        </Box>
      ) : null}
      <Stack spacing={2}>
        {(myQuery.isError || teamQuery.isError) && <Alert severity="error">Unable to load the work queue. Please try again.</Alert>}
        {loading ? <Box sx={{ p: 3 }}><Typography sx={{ color: MUTED }}>Loading work queue…</Typography></Box> : SECTIONS.map((item) => (
          <Box key={item.key} sx={{ display: section === item.key ? 'block' : 'none' }}>
            <QueueSection section={item} response={response} handlers={{
              openLead: (task) => navigate(buildClientPortalPath(scopedClientKey || 'birthwave', `leads/${task.lead_id}`)),
              start: (task) => start.mutate(task.task_id),
              complete: (task) => openDialog('complete', task),
              reschedule: (task) => openDialog('reschedule', task),
              outcome: (task) => setOutcomeTask(task),
              starting: start.isLoading,
            }} />
          </Box>
        ))}
      </Stack>
      <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { m: { xs: 1, sm: 3 } } }}>
        <DialogTitle>{dialog === 'complete' ? 'Complete task' : 'Reschedule task'}</DialogTitle>
        <DialogContent dividers>
          {dialog === 'complete' && selectedTask?.primary_next_action && <Alert severity="info" sx={{ mb: 2 }}>This Lead requires a next action. Completing this task will create a successor Manual Task.</Alert>}
          <TextField autoFocus required fullWidth multiline minRows={2} label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} error={Boolean(error && !reason.trim())} helperText={error && !reason.trim() ? error : undefined} sx={{ mt: 1 }} />
          {(dialog === 'reschedule' || selectedTask?.primary_next_action) && <TextField fullWidth type="datetime-local" label={dialog === 'reschedule' ? 'New date and time' : 'Next action due'} value={nextDueAt} onChange={(event) => setNextDueAt(event.target.value)} InputLabelProps={{ shrink: true }} sx={{ mt: 2 }} />}
          {error && <Typography color="error" sx={{ mt: 1, fontSize: '0.82rem' }}>{error}</Typography>}
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, px: 3, py: 2 }}>
          <Button onClick={() => setDialog(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={submitAction} disabled={complete.isLoading || reschedule.isLoading} sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}>{dialog === 'complete' ? 'Complete' : 'Reschedule'}</Button>
        </DialogActions>
      </Dialog>
      <OutcomeDialog open={Boolean(outcomeTask)} task={outcomeTask} clientKey={scopedClientKey} onClose={() => setOutcomeTask(null)} />
    </Box>
  );
};

export default MyWorkPage;
