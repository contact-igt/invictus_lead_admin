import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, FormControl, IconButton, InputLabel, MenuItem, Select, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useBirthwaveScope } from '../useBirthwaveScope';
import {
  useBirthwaveAppointmentsQuery,
  useBirthwaveDoctorsQuery,
  useBirthwaveLeadDetailQuery,
  useBirthwaveLeadTimelineQuery,
  useBirthwaveLeadOutcomesQuery,
  useAddBirthwaveLeadNoteMutation,
  useAssignBirthwaveLeadMutation,
  useBirthwaveLeadAssignmentsQuery,
  useBirthwaveTeamContextQuery,
  useBirthwaveTeamQuery,
  useBirthwaveTeamsQuery,
  useBirthwaveTasksQuery,
  useStartBirthwaveTaskMutation,
  useCompleteBirthwaveTaskMutation,
  useRescheduleBirthwaveTaskMutation,
  useCancelBirthwaveTaskMutation,
} from 'components/hooks/useBirthwaveQuery';
import { BirthwaveAppointment, BirthwaveDoctor, BirthwaveLead, BirthwaveLeadActivity, BirthwaveTask } from 'services/birthwave';
import { useCrmFieldsQuery } from 'components/hooks/useCrmQuery';
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS, LEAD_SOURCE_LABELS, LEAD_STAGE_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from '../constants';
import { buildClientPortalPath } from 'routes/paths';
import AppointmentFormDrawer from '../AppointmentFormDrawer';
import LeadFormDrawer from '../LeadFormDrawer';
import { formatCrmFieldValue } from '../crm/formatCrmFieldValue';
import OutcomeDialog from '../OutcomeDialog';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';

const cardSx = {
  bgcolor: 'var(--bw-surface)',
  border: '1px solid',
  borderColor: CARD_BORDER,
  borderRadius: '14px',
  p: { xs: 2.5, sm: 3 },
};

const EVENT_ICON: Record<BirthwaveLeadActivity['event_type'], string> = {
  lead_created: 'hugeicons:user-add-01',
  status_changed: 'hugeicons:refresh',
  assignment_changed: 'hugeicons:stethoscope-02',
  follow_up_scheduled: 'hugeicons:calendar-add-01',
  appointment_created: 'hugeicons:calendar-03',
  custom_field_changed: 'hugeicons:pencil-edit-02',
  call_logged: 'hugeicons:call-02',
  lead_source_activity: 'hugeicons:share-01',
  note_added: 'hugeicons:note-02',
  team_selected: 'hugeicons:user-group',
  assigned: 'hugeicons:user-check-01',
  reassigned: 'hugeicons:refresh-02',
  assignment_failed: 'hugeicons:alert-02',
  routing_failed: 'hugeicons:alert-02',
  task_created: 'hugeicons:task-01',
  task_started: 'hugeicons:play-circle-02',
  task_completed: 'hugeicons:checkmark-circle-02',
  task_rescheduled: 'hugeicons:calendar-03',
  task_cancelled: 'hugeicons:cancel-circle',
  primary_task_changed: 'hugeicons:arrow-reload-horizontal',
  missing_next_action: 'hugeicons:alert-02',
  contact_attempt_recorded: 'hugeicons:call-02',
  customer_connected: 'hugeicons:user-check-01',
  customer_not_reached: 'hugeicons:call-cancel-01',
  disposition_recorded: 'hugeicons:check-list',
  follow_up_created: 'hugeicons:calendar-add-01',
  retry_created: 'hugeicons:call-ringing-01',
  appointment_confirmed: 'hugeicons:calendar-check-in-01',
  appointment_attended: 'hugeicons:checkmark-circle-02',
  appointment_no_show: 'hugeicons:calendar-remove-01',
  appointment_cancelled: 'hugeicons:cancel-circle',
  lead_lost: 'hugeicons:cancel-01',
  lead_invalid: 'hugeicons:alert-02',
};


const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 1.1, borderBottom: '1px solid', borderColor: CARD_BORDER }}>
    <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED, flexShrink: 0 }}>{label}</Typography>
    <Typography
      sx={{
        fontSize: '0.82rem',
        fontWeight: 600,
        color: TEXT_DARK,
        textAlign: 'right',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        minWidth: 0,
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const AssignmentPanel = ({ lead, clientKey, enabled }: { lead: BirthwaveLead; clientKey?: string; enabled: boolean }) => {
  const { data: context } = useBirthwaveTeamContextQuery(clientKey, { enabled });
  const { data: teams = [] } = useBirthwaveTeamsQuery(clientKey, {}, { enabled });
  const [open, setOpen] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [reason, setReason] = useState('');
  const { data: team } = useBirthwaveTeamQuery(clientKey, teamId || undefined, { enabled: Boolean(teamId) });
  const { data: assignments = [] } = useBirthwaveLeadAssignmentsQuery(clientKey, lead.id, { enabled });
  const assign = useAssignBirthwaveLeadMutation(clientKey, lead.id);
  const canAssign = Boolean(context?.is_admin || context?.memberships.some((member) => member.operational_role === 'TEAM_MANAGER' && member.status === 'ACTIVE'));

  const openDrawer = () => {
    setTeamId(lead.current_team_id ? String(lead.current_team_id) : '');
    setOwnerId(lead.current_owner_id ? String(lead.current_owner_id) : '');
    setOpen(true);
  };
  const submit = () => {
    if (!teamId || !ownerId) return;
    assign.mutate({ team_id: Number(teamId), owner_id: Number(ownerId), reason: reason.trim() || undefined }, { onSuccess: () => setOpen(false) });
  };

  return <>
    <Box sx={{ ...cardSx, mt: 2.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} mb={1.2}><Box><Typography sx={{ fontWeight: 800, color: TEXT_DARK }}>Ownership</Typography><Typography sx={{ color: TEXT_MUTED, fontSize: '0.78rem' }}>Assignment history is preserved separately from Lead fields.</Typography></Box>{canAssign && <Button size="small" onClick={openDrawer} sx={{ color: GREEN, textTransform: 'none', fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }}>{lead.current_owner_id ? 'Reassign' : 'Assign'}</Button>}</Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 0, sm: 4 } }}><Box><InfoRow label="Team" value={lead.current_team?.name || 'Unassigned'} /><InfoRow label="Owner" value={lead.current_owner?.username || 'Unassigned'} /></Box><Box><InfoRow label="Assignment Type" value={assignments[0]?.assignment_type || '—'} /><InfoRow label="Assigned At" value={assignments[0]?.assigned_at ? formatDateTime(assignments[0].assigned_at) : '—'} /></Box></Box>
      {assignments.length > 0 && <Box sx={{ mt: 1.5, pt: 1.2, borderTop: '1px solid', borderColor: CARD_BORDER }}><Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: TEXT_DARK, mb: 0.6 }}>Assignment history</Typography>{assignments.slice(0, 5).map((item) => <Stack key={item.id} direction="row" spacing={1} justifyContent="space-between" sx={{ py: 0.55 }}><Typography sx={{ color: TEXT_MUTED, fontSize: '0.74rem' }}>{item.team?.name} · {item.owner?.username}</Typography><Typography sx={{ color: TEXT_MUTED, fontSize: '0.7rem' }}>{item.assignment_type}</Typography></Stack>)}</Box>}
    </Box>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 3, bgcolor: 'var(--bw-bg)' } }}><Stack spacing={2}><Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: TEXT_DARK }}>{lead.current_owner_id ? 'Reassign Lead' : 'Assign Lead'}</Typography><FormControl size="small"><InputLabel>Team</InputLabel><Select label="Team" value={teamId} onChange={(e) => { setTeamId(String(e.target.value)); setOwnerId(''); }}>{teams.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</Select></FormControl><FormControl size="small" disabled={!teamId}><InputLabel>Member</InputLabel><Select label="Member" value={ownerId} onChange={(e) => setOwnerId(String(e.target.value))}>{(team?.members || []).filter((member) => member.status === 'ACTIVE' && member.assignment_enabled).map((member) => <MenuItem key={member.management_id} value={member.management_id}>{member.management?.username || `User ${member.management_id}`} · {member.operational_role}</MenuItem>)}</Select></FormControl><TextField size="small" label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} multiline minRows={2} /><Button variant="contained" onClick={submit} disabled={!teamId || !ownerId || assign.isLoading} sx={{ alignSelf: 'flex-start', textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}>Save Assignment</Button></Stack></Drawer>
  </>;
};

const taskLabel = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (character: string) => character.toUpperCase());

// BW-UI-003: Lead Detail previously had no appointment surface at all — a
// telecaller could not see whether the patient had an appointment, nor book one,
// without leaving for the global Appointments page and finding the Lead again.
// This panel answers "do they have an appointment?" and books one in place.
const AppointmentsPanel = ({
  lead,
  clientKey,
  doctors,
  enabled,
}: {
  lead: BirthwaveLead;
  clientKey?: string;
  doctors: BirthwaveDoctor[];
  enabled: boolean;
}) => {
  const { data: page, isLoading } = useBirthwaveAppointmentsQuery(
    clientKey,
    { lead_id: lead.id, limit: 50 },
    { enabled },
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BirthwaveAppointment | null>(null);
  const appointments = page?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (appointment: BirthwaveAppointment) => {
    setEditing(appointment);
    setFormOpen(true);
  };

  return (
    <Box sx={{ ...cardSx, mt: 2.5 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        mb={1.5}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, color: TEXT_DARK }}>Appointments</Typography>
          <Typography sx={{ color: TEXT_MUTED, fontSize: '0.78rem' }}>
            Completing an appointment marks the Lead as Attended — it never converts it automatically.
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={openCreate}
          startIcon={<Icon icon="mdi:plus" width={16} height={16} />}
          sx={{ color: GREEN, textTransform: 'none', fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          Book Appointment
        </Button>
      </Stack>

      {isLoading ? (
        <Skeleton variant="rounded" height={64} sx={{ borderRadius: '10px' }} />
      ) : appointments.length === 0 ? (
        <Typography sx={{ color: TEXT_MUTED, fontSize: '0.82rem' }}>No appointments booked for this Lead.</Typography>
      ) : (
        <Stack spacing={1}>
          {appointments.map((appointment) => {
            const tone = APPOINTMENT_STATUS_COLORS[appointment.status] || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED };
            return (
              <Stack
                key={appointment.id}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
                sx={{ border: '1px solid', borderColor: CARD_BORDER, borderRadius: '10px', p: 1.5 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, color: TEXT_DARK, fontSize: '0.85rem' }}>
                    {formatDateTime(appointment.scheduled_at)}
                  </Typography>
                  <Typography sx={{ color: TEXT_MUTED, fontSize: '0.76rem' }}>
                    {appointment.service || lead.service || 'General consultation'}
                    {appointment.doctor?.name ? ` · ${appointment.doctor.name}` : ' · No doctor assigned'}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={APPOINTMENT_STATUS_LABELS[appointment.status] || appointment.status}
                    sx={{ bgcolor: tone.bg, color: tone.fg, fontWeight: 700 }}
                  />
                  <Button size="small" onClick={() => openEdit(appointment)} sx={{ textTransform: 'none', color: TEXT_DARK }}>
                    Update
                  </Button>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      )}

      <AppointmentFormDrawer
        clientKey={clientKey}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        leads={[lead]}
        doctors={doctors}
        appointment={editing}
        lockedLeadId={lead.id}
      />
    </Box>
  );
};

const NextActionPanel = ({ lead, clientKey, enabled }: { lead: BirthwaveLead; clientKey?: string; enabled: boolean }) => {
  const { data: taskPage } = useBirthwaveTasksQuery(clientKey, { lead_id: lead.id, limit: 100 }, { enabled });
  const tasks = taskPage?.data || [];
  const primary = tasks.find((task) => task.is_primary_active);
  const start = useStartBirthwaveTaskMutation(clientKey, lead.id);
  const complete = useCompleteBirthwaveTaskMutation(clientKey, lead.id);
  const reschedule = useRescheduleBirthwaveTaskMutation(clientKey, lead.id);
  const cancel = useCancelBirthwaveTaskMutation(clientKey, lead.id);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<'complete' | 'reschedule' | 'cancel' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionDueAt, setActionDueAt] = useState('');
  const [actionError, setActionError] = useState('');
  const terminalLead = ['CONVERTED', 'LOST', 'INVALID'].includes(lead.stage || '');
  const outcomeTask = Boolean(primary && ['INITIAL_CALL', 'RETRY_CALL', 'FOLLOW_UP'].includes(primary.task_type));

  const openTaskAction = (type: 'complete' | 'reschedule' | 'cancel') => {
    if (!primary) return;
    setActionDialog(type);
    setActionReason('');
    setActionError('');
    setActionDueAt(type === 'reschedule' || (type === 'complete' && primary.is_primary_active) ? new Date(new Date(primary.due_at).getTime() - new Date(primary.due_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
  };

  const submitTaskAction = () => {
    if (!primary || !actionDialog || !actionReason.trim()) {
      setActionError('A reason is required.');
      return;
    }
    if ((actionDialog === 'reschedule' || actionDialog === 'complete') && !actionDueAt) {
      setActionError(actionDialog === 'complete' ? 'Choose the next action due date and time.' : 'Choose a new due date and time.');
      return;
    }
    const onSuccess = () => {
      setActionDialog(null);
      setActionError('');
    };
    if (actionDialog === 'reschedule') {
      reschedule.mutate({ taskId: primary.id, data: { due_at: new Date(actionDueAt).toISOString(), reason: actionReason.trim() } }, { onSuccess });
    } else if (actionDialog === 'cancel') {
      cancel.mutate({ taskId: primary.id, data: { reason: actionReason.trim() } }, { onSuccess });
    } else {
      complete.mutate({ taskId: primary.id, data: { completion_reason: actionReason.trim(), ...(actionDueAt ? { successor: { task_type: 'MANUAL_TASK', due_at: new Date(actionDueAt).toISOString() } } : {}) } }, { onSuccess });
    }
  };

  return (
    <Box sx={{ ...cardSx, mt: 2.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} mb={1.5}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: TEXT_DARK }}>Next Action</Typography>
          <Typography sx={{ color: TEXT_MUTED, fontSize: '0.78rem' }}>One primary operational action is maintained for active Leads.</Typography>
        </Box>
        {primary && <Chip size="small" label={primary.priority} sx={{ fontWeight: 700, bgcolor: primary.priority === 'HIGH' ? 'rgba(214,76,76,0.12)' : 'var(--bw-surface-2)', color: primary.priority === 'HIGH' ? '#B42318' : TEXT_MUTED }} />}
      </Stack>

      {primary ? (
        <Box sx={{ border: '1px solid', borderColor: CARD_BORDER, borderRadius: '10px', p: 1.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
            <Box>
              <Typography sx={{ fontWeight: 800, color: TEXT_DARK, fontSize: '0.9rem' }}>{taskLabel(primary.task_type)}</Typography>
              <Typography sx={{ color: TEXT_MUTED, fontSize: '0.78rem', mt: 0.35 }}>Status: {taskLabel(primary.status)}</Typography>
              <Typography sx={{ color: TEXT_MUTED, fontSize: '0.78rem' }}>Owner: {primary.owner?.username || '—'}</Typography>
              <Typography sx={{ color: TEXT_MUTED, fontSize: '0.78rem' }}>Due: {formatDateTime(primary.due_at)}</Typography>
              {primary.started_at && <Typography sx={{ color: TEXT_MUTED, fontSize: '0.78rem' }}>Started: {formatDateTime(primary.started_at)}</Typography>}
            </Box>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end" alignContent="flex-start">
              {primary.status === 'PENDING' && <Button size="small" onClick={() => start.mutate(primary.id)} sx={{ color: GREEN, textTransform: 'none' }}>Start</Button>}
              {outcomeTask ? <Button size="small" disabled={primary.status === 'PENDING'} onClick={() => setOutcomeOpen(true)} sx={{ color: GREEN, textTransform: 'none' }}>Record Outcome</Button> : <Button size="small" onClick={() => openTaskAction('complete')} sx={{ color: GREEN, textTransform: 'none' }}>Complete</Button>}
              <Button size="small" onClick={() => openTaskAction('reschedule')} sx={{ color: TEXT_DARK, textTransform: 'none' }}>Reschedule</Button>
              <Button size="small" onClick={() => openTaskAction('cancel')} sx={{ color: '#B42318', textTransform: 'none' }}>Cancel</Button>
            </Stack>
          </Stack>
        </Box>
      ) : !terminalLead && lead.current_owner_id ? (
        <Typography sx={{ color: '#B42318', fontSize: '0.82rem', fontWeight: 700 }}>No primary next action is currently attached to this assigned Lead.</Typography>
      ) : (
        <Typography sx={{ color: TEXT_MUTED, fontSize: '0.82rem' }}>No primary task.</Typography>
      )}

      {tasks.length > 0 && (
        <Box sx={{ mt: 1.5, pt: 1.25, borderTop: '1px solid', borderColor: CARD_BORDER }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: TEXT_DARK, mb: 0.5 }}>Task History</Typography>
          <Stack spacing={0.45}>
            {tasks.slice(0, 8).map((task: BirthwaveTask) => (
              <Stack key={task.id} direction="row" justifyContent="space-between" spacing={1}>
                <Typography sx={{ fontSize: '0.74rem', color: TEXT_MUTED }}>{taskLabel(task.task_type)}{task.parent_task_id ? ` · successor of #${task.parent_task_id}` : ''}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: TEXT_MUTED }}>{taskLabel(task.status)}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
      <OutcomeDialog open={outcomeOpen} task={primary || null} clientKey={clientKey} onClose={() => setOutcomeOpen(false)} />
      <Dialog open={Boolean(actionDialog)} onClose={() => setActionDialog(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { m: { xs: 1, sm: 3 }, borderRadius: { xs: 2, sm: 3 } } }}>
        <DialogTitle>{actionDialog === 'complete' ? 'Complete task' : actionDialog === 'reschedule' ? 'Reschedule task' : 'Cancel task'}</DialogTitle>
        <DialogContent dividers>
          {actionDialog === 'complete' && primary?.is_primary_active && <Alert severity="info" sx={{ mb: 2 }}>This Lead requires a next action. Completing this task will create a successor Manual Task.</Alert>}
          <TextField autoFocus required fullWidth multiline minRows={2} label="Reason" value={actionReason} onChange={(event) => setActionReason(event.target.value)} error={Boolean(actionError && !actionReason.trim())} helperText={actionError && !actionReason.trim() ? actionError : 'Explain the task result or change.'} sx={{ mt: 1 }} />
          {(actionDialog === 'reschedule' || actionDialog === 'complete') && <TextField required fullWidth type="datetime-local" label={actionDialog === 'complete' ? 'Next action due' : 'New due date and time'} value={actionDueAt} onChange={(event) => setActionDueAt(event.target.value)} InputLabelProps={{ shrink: true }} error={Boolean(actionError && !actionDueAt)} helperText={actionError && !actionDueAt ? actionError : undefined} sx={{ mt: 2 }} />}
          {actionError && actionReason.trim() && actionDueAt && <Typography color="error" sx={{ mt: 1, fontSize: '0.82rem' }}>{actionError}</Typography>}
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, px: 3, py: 2 }}>
          <Button onClick={() => setActionDialog(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={submitTaskAction} disabled={complete.isLoading || reschedule.isLoading || cancel.isLoading} sx={{ textTransform: 'none', bgcolor: actionDialog === 'cancel' ? '#B42318' : GREEN, boxShadow: 'none' }}>{complete.isLoading || reschedule.isLoading || cancel.isLoading ? 'Saving…' : actionDialog === 'complete' ? 'Complete task' : actionDialog === 'reschedule' ? 'Reschedule' : 'Cancel task'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const LeadDetailPage = () => {
  const { hasScope, scopedClientKey, activeClientKey } = useBirthwaveScope();
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);
  const [note, setNote] = useState('');

  // Return to whichever list the user came from (Instagram Leads / a website
  // source), preserved via ?view= on the detail URL. Defaults to All Leads.
  const originView = searchParams.get('view');
  const backToLeadsPath = `leads${originView && originView !== 'crm' ? `?view=${encodeURIComponent(originView)}` : ''}`;

  const { data: lead, isLoading, isError } = useBirthwaveLeadDetailQuery(scopedClientKey, leadId, { enabled: hasScope });
  // BW-UI-004: "Next Follow-up" is derived from the canonical FOLLOW_UP task, not
  // from birthwave_leads.next_follow_up — that column is only ever written by the
  // manual Lead form and is never updated by the task engine, so it showed "—"
  // even when the Lead had a live follow-up scheduled. Same query key/params as
  // NextActionPanel, so React Query serves both panels from one request.
  const { data: leadTaskPage } = useBirthwaveTasksQuery(
    scopedClientKey,
    { lead_id: Number(leadId), limit: 100 },
    { enabled: hasScope && Boolean(leadId) },
  );
  const nextFollowUpDue = (leadTaskPage?.data ?? [])
    .filter((task) => task.task_type === 'FOLLOW_UP' && ['PENDING', 'IN_PROGRESS'].includes(task.status))
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())[0]?.due_at ?? null;
  const { data: timeline = [], isLoading: isTimelineLoading } = useBirthwaveLeadTimelineQuery(scopedClientKey, leadId, { enabled: hasScope });
  const { data: outcomes = [] } = useBirthwaveLeadOutcomesQuery(scopedClientKey, leadId, { enabled: hasScope });
  const addNoteMutation = useAddBirthwaveLeadNoteMutation(scopedClientKey, leadId);
  const { data: doctors = [] } = useBirthwaveDoctorsQuery(scopedClientKey, { active: true }, { enabled: hasScope });
  const { data: customFieldDefs = [] } = useCrmFieldsQuery(scopedClientKey, 'birthwave_lead', { enabled: hasScope });
  const detailVisibleFields = customFieldDefs.filter((f) => f.show_in_detail);

  if (!hasScope) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Please select a client.</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
        <Typography sx={{ color: TEXT_MUTED }}>Lead not found.</Typography>
        <Button
          size="small"
          onClick={() => navigate(buildClientPortalPath(activeClientKey, backToLeadsPath))}
          sx={{ mt: 1, textTransform: 'none', color: GREEN }}
        >
          Back to Leads
        </Button>
      </Box>
    );
  }

  const statusColor = lead ? LEAD_STATUS_COLORS[lead.status] || LEAD_STATUS_COLORS[lead.stage || ''] || { bg: 'var(--bw-surface-2)', fg: TEXT_MUTED } : null;

  // Repli/Instagram integration metadata — reuses the existing lead's
  // integration_metadata JSON, no separate Repli lead architecture.
  // Repli's payload shape varies by automation flow, so beyond the
  // handful of well-known keys everything else is rendered dynamically
  // rather than hardcoded, so new/renamed keys still show up.
  const meta = lead?.integration_metadata;
  const isRepliLead = lead?.source_provider === 'REPLI';

  const ISO_DATE_KEY_HINT = /(_at|_date|timestamp)$/i;
  const humanizeKey = (key: string) =>
    key
      .replace(/^repli_/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  const formatMetaValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && ISO_DATE_KEY_HINT.test(key)) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return formatDateTime(value);
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Collected-data keys are the raw questionnaire questions and vary per flow,
  // so they're rendered dynamically. Well-known intents get a short label;
  // anything unrecognised falls back to the question text verbatim.
  const friendlyQuestionLabel = (question: string): string => {
    const q = question.toLowerCase();
    if (/\bname\b/.test(q)) return 'Name';
    if (/e-?mail/.test(q)) return 'Email';
    if (/phone|mobile|whatsapp|contact number|\bnumber\b/.test(q)) return 'Phone';
    if (/service|treatment|reason|help/.test(q)) return 'Service';
    return question.trim();
  };

  const collectedData =
    meta?.collected_data && typeof meta.collected_data === 'object' && !Array.isArray(meta.collected_data)
      ? (meta.collected_data as Record<string, unknown>)
      : null;
  const collectedEntries = collectedData ? Object.entries(collectedData) : [];

  // Keys shown elsewhere (mandatory rows / collected details section) so they
  // aren't duplicated in the dynamic metadata list below.
  const KNOWN_META_KEYS = new Set([
    'collected_data',
    'source',
    'source_provider',
    'provider',
    'instagram_username',
    'answers',
  ]);
  // Raw/nested payloads (Repli's full webhook body, etc.) are unbounded and
  // not meant for a label/value row — kept out of the detail view entirely.
  const RAW_PAYLOAD_KEY_HINT = /(response|payload|raw|webhook)/i;
  const dynamicMetaEntries = meta
    ? Object.entries(meta).filter(([key, value]) => {
        if (KNOWN_META_KEYS.has(key)) return false;
        if (RAW_PAYLOAD_KEY_HINT.test(key)) return false;
        if (value === null || value === undefined || value === '') return false;
        return true;
      })
    : [];
  const instagramUsername =
    typeof meta?.instagram_username === 'string' && meta.instagram_username ? meta.instagram_username : null;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <IconButton
          size="small"
          aria-label="Back to Leads"
          onClick={() => navigate(buildClientPortalPath(activeClientKey, backToLeadsPath))}
          sx={{ border: '1px solid', borderColor: CARD_BORDER, borderRadius: '8px' }}
        >
          <Icon icon="hugeicons:arrow-left-01" width={18} height={18} />
        </IconButton>
        <Typography sx={{ fontSize: '0.82rem', color: TEXT_MUTED }}>Back to Leads</Typography>
      </Stack>

      {isLoading || !lead ? (
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: '14px' }} />
      ) : (
        <>
        <Box sx={{ ...cardSx, mb: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={2}>
            <Box>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: TEXT_DARK }}>{lead.name}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED, mt: 0.5 }}>{lead.phone || '—'}{lead.email ? ` · ${lead.email}` : ''}</Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {statusColor && (
                <Chip
                  label={LEAD_STAGE_LABELS[lead.stage || ''] || LEAD_STATUS_LABELS[lead.status] || lead.status}
                  size="small"
                  sx={{ bgcolor: statusColor.bg, color: statusColor.fg, fontWeight: 700 }}
                />
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={() => setEditOpen(true)}
                startIcon={<Icon icon="hugeicons:edit-02" width={16} height={16} />}
                sx={{ textTransform: 'none', fontWeight: 700, borderColor: CARD_BORDER, color: TEXT_DARK }}
              >
                Edit
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 0, sm: 4 } }}>
            <Box>
              <InfoRow label="Service" value={lead.service || '—'} />
              <InfoRow label="Source Page" value={lead.source_key || '—'} />
              <InfoRow label="Campaign" value={String(lead.integration_metadata?.campaign || '—')} />
              <InfoRow label="Source" value={lead.source ? LEAD_SOURCE_LABELS[lead.source] || lead.source : '—'} />
              {lead.source_provider && !isRepliLead && <InfoRow label="Provider" value={lead.source_provider} />}
              <InfoRow label="Assigned Doctor" value={lead.assignedDoctor?.name || 'Unassigned'} />
            </Box>
            <Box>
              <InfoRow label="Created" value={formatDate(lead.created_at)} />
              <InfoRow label="Next Follow-up" value={nextFollowUpDue ? formatDateTime(nextFollowUpDue) : '—'} />
              <InfoRow label="Enquiry Message" value={lead.notes || '—'} />
            </Box>
          </Box>

          <Box sx={{ mt: 1, pt: 2, borderTop: '1px solid', borderColor: CARD_BORDER }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: TEXT_DARK, mb: 0.5 }}>Contact linkage</Typography>
            <InfoRow label="Contact Name" value={lead.contact?.display_name || lead.name || '—'} />
            <InfoRow label="Contact Phone" value={lead.contact?.normalized_phone || lead.phone || '—'} />
            <InfoRow label="Contact Email" value={lead.contact?.normalized_email || lead.email || '—'} />
          </Box>

          {detailVisibleFields.length > 0 && (
            <Box sx={{ mt: 1, pt: 2, borderTop: '1px solid', borderColor: CARD_BORDER, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 0, sm: 4 } }}>
              {detailVisibleFields.map((field) => (
                <InfoRow
                  key={field.id}
                  label={field.label}
                  value={formatCrmFieldValue(field, lead.custom_fields?.[field.field_key])}
                />
              ))}
            </Box>
          )}
        </Box>

        <AssignmentPanel lead={lead} clientKey={scopedClientKey} enabled={hasScope} />
        <NextActionPanel lead={lead} clientKey={scopedClientKey} enabled={hasScope} />
        <AppointmentsPanel lead={lead} clientKey={scopedClientKey} doctors={doctors} enabled={hasScope} />
        <Box sx={{ ...cardSx, mt: 2.5 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: TEXT_DARK }}>Outcome History</Typography>
          <Typography sx={{ color: TEXT_MUTED, fontSize: '0.78rem', mb: 1.25 }}>Manual interaction evidence and business dispositions.</Typography>
          {outcomes.length === 0 ? <Typography sx={{ color: TEXT_MUTED, fontSize: '0.82rem' }}>No outcomes recorded yet.</Typography> : <Stack spacing={1}>
            {outcomes.slice(0, 8).map((outcome) => <Box key={outcome.id} sx={{ borderTop: '1px solid', borderColor: CARD_BORDER, pt: 1 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={0.5}><Typography sx={{ color: TEXT_DARK, fontSize: '0.82rem', fontWeight: 700 }}>{outcome.contact_result === 'CONNECTED' ? (outcome.disposition || 'Connected') : `Not reached · ${outcome.not_reached_reason || '—'}`}</Typography><Typography sx={{ color: TEXT_MUTED, fontSize: '0.72rem' }}>{formatDateTime(outcome.created_at)}</Typography></Stack>
              <Typography sx={{ color: TEXT_MUTED, fontSize: '0.75rem' }}>{outcome.evidence_source} {outcome.next_action_type ? `· Next: ${taskLabel(outcome.next_action_type)}` : ''}{outcome.notes ? ` · ${outcome.notes}` : ''}</Typography>
            </Box>)}
          </Stack>}
        </Box>

        {isRepliLead && (
          <Box sx={{ ...cardSx, mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: TEXT_DARK, mb: 2 }}>Integration Details</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 0, sm: 4 } }}>
              <Box>
                <InfoRow label="Source" value={lead.source ? LEAD_SOURCE_LABELS[lead.source] || lead.source : '—'} />
                <InfoRow label="Provider" value="Repli" />
              </Box>
              <Box>
                <InfoRow label="Instagram Username" value={instagramUsername ? `@${instagramUsername}` : '—'} />
              </Box>
            </Box>

            {dynamicMetaEntries.length > 0 && (
              <Box sx={{ mt: 1, pt: 2, borderTop: '1px solid', borderColor: CARD_BORDER, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: 0, sm: 4 } }}>
                <Box>
                  {dynamicMetaEntries
                    .filter((_, index) => index % 2 === 0)
                    .map(([key, value]) => (
                      <InfoRow key={key} label={humanizeKey(key)} value={formatMetaValue(key, value)} />
                    ))}
                </Box>
                <Box>
                  {dynamicMetaEntries
                    .filter((_, index) => index % 2 === 1)
                    .map(([key, value]) => (
                      <InfoRow key={key} label={humanizeKey(key)} value={formatMetaValue(key, value)} />
                    ))}
                </Box>
              </Box>
            )}

          </Box>
        )}

        {collectedEntries.length > 0 && (
          <Box sx={{ ...cardSx, mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: TEXT_DARK, mb: 2 }}>Collected Details</Typography>
            <Stack direction="column" spacing={1.75}>
              {collectedEntries.map(([question, answer]) => (
                <Box key={question} sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.78rem', color: TEXT_MUTED }}>{friendlyQuestionLabel(question)}</Typography>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: TEXT_DARK, wordBreak: 'break-word' }}>
                    {answer === null || answer === undefined || answer === '' ? '—' : String(answer)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        {lead?.other_leads && lead.other_leads.length > 0 && (
          <Box sx={{ ...cardSx, mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: TEXT_DARK, mb: 2 }}>Other Enquiries</Typography>
            <Stack spacing={1}>
              {lead.other_leads.map((other) => (
                <Button
                  key={other.id}
                  onClick={() => navigate(buildClientPortalPath(activeClientKey, `leads/${other.id}`))}
                  sx={{ justifyContent: 'space-between', textTransform: 'none', color: TEXT_DARK, border: '1px solid', borderColor: CARD_BORDER, borderRadius: '10px', px: 1.5, py: 1 }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{other.service || 'General enquiry'}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED }}>{other.source || '—'} · {formatDate(other.created_at)}</Typography>
                  </Box>
                  <Chip size="small" label={LEAD_STAGE_LABELS[other.stage || ''] || LEAD_STATUS_LABELS[other.status] || other.status} />
                </Button>
              ))}
            </Stack>
          </Box>
        )}
        </>
      )}

      <Box sx={cardSx}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: TEXT_DARK }}>Lead Timeline</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: TEXT_MUTED }}>Append-only activity</Typography>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mb={2.5}>
          <TextField
            fullWidth
            size="small"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a note to the timeline"
            multiline
            maxRows={3}
          />
          <Button
            variant="contained"
            disabled={!note.trim() || addNoteMutation.isLoading}
            onClick={() => addNoteMutation.mutate(note.trim(), { onSuccess: () => setNote('') })}
            sx={{ textTransform: 'none', bgcolor: GREEN, minWidth: { sm: 110 }, '&:hover': { bgcolor: GREEN } }}
          >
            Add note
          </Button>
        </Stack>

        {isTimelineLoading ? (
          <Stack direction="column" spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: '10px' }} />
            ))}
          </Stack>
        ) : timeline.length === 0 ? (
          <Typography sx={{ color: TEXT_MUTED, fontSize: '0.85rem' }}>No activity recorded yet.</Typography>
        ) : (
          <Stack direction="column" spacing={0}>
            {timeline.map((event, index) => (
              <Stack key={event.id} direction="row" spacing={1.5}>
                <Stack direction="column" alignItems="center" sx={{ flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'rgba(41,175,129,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon icon={EVENT_ICON[event.event_type] || 'hugeicons:circle'} width={16} height={16} color={GREEN} />
                  </Box>
                  {index < timeline.length - 1 && (
                    <Box sx={{ width: '2px', flexGrow: 1, minHeight: 24, bgcolor: CARD_BORDER, my: 0.5 }} />
                  )}
                </Stack>
                <Box sx={{ pb: 3, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT_DARK }}>{event.title}</Typography>
                  {event.description && (
                    <Typography sx={{ fontSize: '0.78rem', color: TEXT_MUTED, mt: 0.25 }}>{event.description}</Typography>
                  )}
                  <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED, mt: 0.5 }}>
                    {formatDateTime(event.occurred_at)}{event.actor_name ? ` · ${event.actor_name}` : ''}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      {lead && (
        <LeadFormDrawer
          clientKey={scopedClientKey}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          doctors={doctors}
          lead={lead}
        />
      )}
    </Box>
  );
};

export default LeadDetailPage;
