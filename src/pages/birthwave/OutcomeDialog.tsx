import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { BirthwaveTask, BirthwaveWorkItem } from 'services/birthwave';
import { useBirthwaveDispositionOptionsQuery, useBirthwaveDoctorsQuery, useBirthwaveTaskOutcomeMutation } from 'components/hooks/useBirthwaveQuery';

const GREEN = '#29AF81';
const taskIdOf = (task: BirthwaveTask | BirthwaveWorkItem) => 'id' in task ? task.id : task.task_id;
const makeEventId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};
const label = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());

export default function OutcomeDialog({ open, task, clientKey, onClose }: { open: boolean; task: BirthwaveTask | BirthwaveWorkItem | null; clientKey?: string; onClose: () => void }) {
  const [eventId, setEventId] = useState(makeEventId());
  const [contactResult, setContactResult] = useState<'CONNECTED' | 'NOT_REACHED' | ''>('');
  const [notReachedReason, setNotReachedReason] = useState('NO_ANSWER');
  const [disposition, setDisposition] = useState('');
  const [nextActionType, setNextActionType] = useState('FOLLOW_UP');
  const [dueAt, setDueAt] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [notes, setNotes] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentAt, setAppointmentAt] = useState('');
  const [appointmentService, setAppointmentService] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [error, setError] = useState('');
  const { data: options } = useBirthwaveDispositionOptionsQuery(clientKey, { enabled: open });
  const { data: doctors = [] } = useBirthwaveDoctorsQuery(clientKey, { active: true }, { enabled: open });
  const taskLeadId = task ? task.lead_id : undefined;
  const taskId = task ? taskIdOf(task) : undefined;
  const mutation = useBirthwaveTaskOutcomeMutation(clientKey, taskLeadId);

  useEffect(() => {
    if (!open) return;
    setEventId(makeEventId());
    setContactResult('');
    setNotReachedReason('NO_ANSWER');
    setDisposition('');
    setNextActionType('FOLLOW_UP');
    setDueAt('');
    setLostReason('');
    setNotes('');
    setDoctorId('');
    setAppointmentAt('');
    setAppointmentService('');
    setAppointmentNotes('');
    setError('');
  }, [open, taskId]);

  const appointmentRequired = disposition === 'APPOINTMENT_REQUIRED' || (disposition === 'INTERESTED' && nextActionType === 'APPOINTMENT');
  const dueRequired = contactResult === 'NOT_REACHED' || ['FOLLOW_UP_REQUIRED', 'CALL_LATER'].includes(disposition) || disposition === 'OTHER' || (disposition === 'INTERESTED' && nextActionType === 'FOLLOW_UP');
  const availableNextActions = useMemo(() => disposition === 'OTHER' ? ['FOLLOW_UP', 'RETRY_CALL', 'MANUAL_TASK'] : ['FOLLOW_UP', 'APPOINTMENT'], [disposition]);

  const submit = () => {
    if (!task) return;
    if (!contactResult) { setError('Choose whether the customer was reached.'); return; }
    if (dueRequired && !dueAt) { setError('Choose the next action date and time.'); return; }
    if (appointmentRequired && !appointmentAt) { setError('Choose the appointment date and time.'); return; }
    if (['NOT_INTERESTED'].includes(disposition) && !lostReason) { setError('Choose a lost reason.'); return; }
    if (['WRONG_NUMBER', 'INVALID_LEAD'].includes(disposition) && !lostReason.trim()) { setError('Enter a reason.'); return; }
    if (disposition === 'OTHER' && !notes.trim()) { setError('Notes are required for Other.'); return; }
    mutation.mutate({
      taskId: taskIdOf(task),
      data: {
        outcome_event_id: eventId,
        contact_result: contactResult,
        ...(contactResult === 'NOT_REACHED' ? { not_reached_reason: notReachedReason, next_action_due_at: new Date(dueAt).toISOString() } : {}),
        ...(contactResult === 'CONNECTED' ? {
          disposition: disposition as any,
          ...(nextActionType ? { next_action_type: nextActionType } : {}),
          ...(dueAt ? { next_action_due_at: new Date(dueAt).toISOString() } : {}),
          ...(lostReason ? { lost_reason: lostReason } : {}),
          ...(appointmentRequired ? { appointment: { doctor_id: doctorId ? Number(doctorId) : null, scheduled_at: new Date(appointmentAt).toISOString(), service: appointmentService || undefined, notes: appointmentNotes || undefined } } : {}),
        } : {}),
        notes: notes.trim() || undefined,
      },
    }, { onSuccess: onClose });
  };

  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { m: { xs: 1, sm: 3 }, maxHeight: 'calc(100% - 16px)' } }}>
    <DialogTitle sx={{ pb: 1 }}>Record interaction outcome</DialogTitle>
    <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Alert severity="info">This is manual operational evidence. It is not a provider-verified call.</Alert>
        <FormControl fullWidth size="small" required error={Boolean(error && !contactResult)}>
          <InputLabel>Did you reach the customer?</InputLabel>
          <Select label="Did you reach the customer?" value={contactResult} onChange={(event) => setContactResult(event.target.value as 'CONNECTED' | 'NOT_REACHED')}>
            <MenuItem value="CONNECTED">Yes — connected</MenuItem>
            <MenuItem value="NOT_REACHED">No — not reached</MenuItem>
          </Select>
        </FormControl>
        {contactResult === 'NOT_REACHED' && <>
          <FormControl fullWidth size="small"><InputLabel>Reason</InputLabel><Select label="Reason" value={notReachedReason} onChange={(event) => setNotReachedReason(event.target.value)}>{(options?.not_reached_reasons || ['NO_ANSWER', 'BUSY', 'UNREACHABLE', 'OTHER']).map((item) => <MenuItem key={item} value={item}>{label(item)}</MenuItem>)}</Select></FormControl>
          <TextField fullWidth size="small" type="datetime-local" label="Retry date and time" value={dueAt} onChange={(event) => setDueAt(event.target.value)} InputLabelProps={{ shrink: true }} />
        </>}
        {contactResult === 'CONNECTED' && <>
          <FormControl fullWidth size="small" required><InputLabel>Business disposition</InputLabel><Select label="Business disposition" value={disposition} onChange={(event) => { setDisposition(event.target.value); setError(''); }}><MenuItem value=""><em>Select a disposition</em></MenuItem>{(options?.dispositions || []).map((item) => <MenuItem key={item} value={item}>{label(item)}</MenuItem>)}</Select></FormControl>
          {disposition === 'INTERESTED' && <FormControl fullWidth size="small"><InputLabel>Next action</InputLabel><Select label="Next action" value={nextActionType} onChange={(event) => setNextActionType(event.target.value)}><MenuItem value="FOLLOW_UP">Follow-up</MenuItem><MenuItem value="APPOINTMENT">Appointment</MenuItem></Select></FormControl>}
          {disposition === 'OTHER' && <FormControl fullWidth size="small"><InputLabel>Next action</InputLabel><Select label="Next action" value={nextActionType} onChange={(event) => setNextActionType(event.target.value)}>{availableNextActions.map((item) => <MenuItem key={item} value={item}>{label(item)}</MenuItem>)}</Select></FormControl>}
          {dueRequired && <TextField fullWidth size="small" type="datetime-local" label="Next action date and time" value={dueAt} onChange={(event) => setDueAt(event.target.value)} InputLabelProps={{ shrink: true }} />}
          {['NOT_INTERESTED'].includes(disposition) && <FormControl fullWidth size="small"><InputLabel>Lost reason</InputLabel><Select label="Lost reason" value={lostReason} onChange={(event) => setLostReason(event.target.value)}>{(options?.lost_reasons || []).map((item) => <MenuItem key={item} value={item}>{label(item)}</MenuItem>)}</Select></FormControl>}
          {['WRONG_NUMBER', 'INVALID_LEAD'].includes(disposition) && <TextField fullWidth size="small" label="Reason" value={lostReason} onChange={(event) => setLostReason(event.target.value)} />}
          {appointmentRequired && <>
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700 }}>Appointment details</Typography>
            <TextField fullWidth size="small" type="datetime-local" label="Appointment date and time" value={appointmentAt} onChange={(event) => setAppointmentAt(event.target.value)} InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth size="small"><InputLabel>Doctor (optional)</InputLabel><Select label="Doctor (optional)" value={doctorId} onChange={(event) => setDoctorId(String(event.target.value))}><MenuItem value="">Unassigned</MenuItem>{doctors.map((doctor) => <MenuItem key={doctor.id} value={doctor.id}>{doctor.name}{doctor.specialty ? ` · ${doctor.specialty}` : ''}</MenuItem>)}</Select></FormControl>
            <TextField fullWidth size="small" label="Appointment service" value={appointmentService} onChange={(event) => setAppointmentService(event.target.value)} />
            <TextField fullWidth size="small" label="Appointment notes" value={appointmentNotes} onChange={(event) => setAppointmentNotes(event.target.value)} multiline minRows={2} />
          </>}
        </>}
        {contactResult && <TextField fullWidth size="small" label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} multiline minRows={2} />}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </DialogContent>
    <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, px: { xs: 2, sm: 3 }, py: 2 }}><Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button><Button fullWidth={false} variant="contained" onClick={submit} disabled={!task || mutation.isLoading} sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}>{mutation.isLoading ? 'Saving...' : 'Save outcome'}</Button></DialogActions>
  </Dialog>;
}
