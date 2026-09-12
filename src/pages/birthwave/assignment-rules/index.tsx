import { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, FormControl, FormControlLabel, FormHelperText, InputLabel, MenuItem, Select, Switch, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { useBirthwaveScope } from '../useBirthwaveScope';
import { useBirthwaveTeamContextQuery, useBirthwaveTeamsQuery, useBirthwaveAssignmentRulesQuery, useBirthwaveServicesQuery, useCreateBirthwaveAssignmentRuleMutation, useUpdateBirthwaveAssignmentRuleMutation } from 'components/hooks/useBirthwaveQuery';
import BirthwaveDrawerLayout, { BirthwaveFormGrid, BirthwaveFormGridItem } from '../BirthwaveDrawerLayout';
import PortalPageHeader from '../PortalPageHeader';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';
const GREEN = '#29AF81';

type RuleForm = { name: string; priority: string; service_id: string; source: string; team_id: string; assignment_method: string; is_active: boolean };
const emptyForm = (): RuleForm => ({ name: '', priority: '100', service_id: '', source: '', team_id: '', assignment_method: 'ROUND_ROBIN', is_active: true });

const AssignmentRulesPage = () => {
  const { user } = useAuth();
  const { hasScope, scopedClientKey } = useBirthwaveScope();
  const { data: context } = useBirthwaveTeamContextQuery(scopedClientKey, { enabled: hasScope });
  const role = String(user?.role || '').toLowerCase();
  const canConfigure = ['super-admin', 'admin', 'client'].includes(role);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RuleForm>(emptyForm);
  const { data: rules = [], isLoading } = useBirthwaveAssignmentRulesQuery(scopedClientKey, { enabled: hasScope && canConfigure });
  const { data: teams = [] } = useBirthwaveTeamsQuery(scopedClientKey, {}, { enabled: hasScope && canConfigure });
  // All services (not just active) so an existing rule on a retired service still shows it.
  const { data: services = [] } = useBirthwaveServicesQuery(scopedClientKey, {}, { enabled: hasScope && canConfigure });
  const serviceOptions = useMemo(() => {
    const active = services.filter((service) => service.is_active);
    const current = editingId ? rules.find((rule) => rule.id === editingId)?.service_ref : null;
    if (current && !current.is_active && !active.some((service) => service.id === current.id)) {
      return [...active, { ...current, sort_order: Number.MAX_SAFE_INTEGER, is_system: false }];
    }
    return active;
  }, [editingId, rules, services]);
  const createRule = useCreateBirthwaveAssignmentRuleMutation(scopedClientKey);
  const updateRule = useUpdateBirthwaveAssignmentRuleMutation(scopedClientKey);
  const isSaving = createRule.isLoading || updateRule.isLoading;
  const mutationError = (createRule.error || updateRule.error) as { response?: { data?: { message?: string } } } | null;

  if (!hasScope) return <Box sx={{ p: 4 }}><Typography color="text.secondary">Please select a client.</Typography></Box>;
  if (!canConfigure || (context && !context.is_admin)) return <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}><Alert severity="info">Assignment rules are managed by Birthwave administrators.</Alert></Box>;

  const update = (key: keyof RuleForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setOpen(true); };
  const openEdit = (rule: typeof rules[number]) => {
    setEditingId(rule.id);
    setForm({ name: rule.name, priority: String(rule.priority), service_id: rule.service_id ? String(rule.service_id) : '', source: rule.source || '', team_id: String(rule.team_id), assignment_method: rule.assignment_method, is_active: rule.is_active });
    setOpen(true);
  };
  const close = () => { if (!isSaving) setOpen(false); };
  const submit = () => {
    if (!form.name.trim() || !form.team_id) return;
    const data = { name: form.name.trim(), priority: Number(form.priority) || 100, service_id: form.service_id ? Number(form.service_id) : null, source: form.source.trim() || null, team_id: Number(form.team_id), assignment_method: form.assignment_method, is_active: form.is_active };
    const options = { onSuccess: () => { setOpen(false); setForm(emptyForm()); } };
    if (editingId) updateRule.mutate({ id: editingId, data }, options);
    else createRule.mutate(data, options);
  };

  return <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
    <PortalPageHeader title="Assignment Rules" subtitle="Control how incoming Leads are routed to counselling teams" action={<Button variant="contained" onClick={openCreate} sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none', fontWeight: 700, borderRadius: '10px', bgcolor: GREEN, boxShadow: 'none' }}><Icon icon="mdi:plus" width={18} />&nbsp; Add Rule</Button>} />
    <Box sx={{ bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: CARD_BORDER, borderRadius: '14px', overflowX: 'auto' }}>
      {isLoading ? <Box sx={{ p: 3 }}><Typography sx={{ color: TEXT_MUTED }}>Loading assignment rules...</Typography></Box> : rules.length === 0 ? <Box sx={{ p: 4, textAlign: 'center' }}><Typography sx={{ color: TEXT_MUTED }}>No assignment rules created yet.</Typography><Typography sx={{ color: TEXT_MUTED, mt: 0.5, mb: 2 }}>Create a rule to route new Leads to the right team.</Typography><Button variant="outlined" onClick={openCreate} sx={{ textTransform: 'none', color: GREEN, borderColor: GREEN }}>+ Add Rule</Button></Box> : <Box component="table" sx={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
        <Box component="thead"><Box component="tr">{['Rule Name', 'Service / Source', 'Team', 'Method', 'Priority', 'Active', 'Action'].map((heading) => <Box component="th" key={heading} sx={{ textAlign: 'left', px: 2, py: 1.5, color: TEXT_MUTED, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid', borderColor: CARD_BORDER }}>{heading}</Box>)}</Box></Box>
        <Box component="tbody">{rules.map((rule) => <Box component="tr" key={rule.id} sx={{ '&:hover td': { bgcolor: 'var(--bw-hover)' } }}>
          <Box component="td" sx={{ px: 2, py: 1.6, color: TEXT_DARK, fontWeight: 700 }}>{rule.name}<Typography sx={{ color: TEXT_MUTED, fontSize: '0.72rem' }}>#{rule.id}</Typography></Box>
          <Box component="td" sx={{ px: 2, py: 1.6, color: TEXT_DARK, fontSize: '0.82rem' }}>{rule.service_ref?.name || rule.service || 'Any service'}{rule.source ? ` · ${rule.source}` : ''}</Box>
          <Box component="td" sx={{ px: 2, py: 1.6, color: TEXT_DARK, fontSize: '0.82rem' }}>{rule.team?.name || '—'}</Box>
          <Box component="td" sx={{ px: 2, py: 1.6, color: TEXT_DARK, fontSize: '0.82rem' }}>{rule.assignment_method === 'ROUND_ROBIN' ? 'Round Robin' : 'Manual'}</Box>
          <Box component="td" sx={{ px: 2, py: 1.6, color: TEXT_DARK }}>{rule.priority}</Box>
          <Box component="td" sx={{ px: 2, py: 1.6 }}><Chip label={rule.is_active ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: rule.is_active ? 'var(--bw-tint-green)' : 'var(--bw-surface-2)', color: rule.is_active ? '#15803D' : TEXT_MUTED, fontWeight: 700 }} /></Box>
          <Box component="td" sx={{ px: 2, py: 1.6 }}><Button size="small" onClick={() => openEdit(rule)} sx={{ textTransform: 'none', color: GREEN, fontWeight: 700 }}>Edit</Button></Box>
        </Box>)}</Box>
      </Box>}
    </Box>

    <BirthwaveDrawerLayout open={open} onClose={close} title={editingId ? 'Edit Assignment Rule' : 'Add Assignment Rule'} subtitle="Match service/source values to a routing team" width={440} footer={<><Button onClick={close} disabled={isSaving} sx={{ textTransform: 'none', color: TEXT_MUTED }}>Cancel</Button><Button type="submit" form="birthwave-assignment-rule-form" variant="contained" disabled={!form.name.trim() || !form.team_id || isSaving} sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}>{isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Rule'}</Button></>}>
      <Box id="birthwave-assignment-rule-form" component="form" onSubmit={(event) => { event.preventDefault(); submit(); }} noValidate>
        {mutationError && <Alert severity="error" sx={{ mb: 2 }}>{mutationError.response?.data?.message || 'Unable to save this assignment rule.'}</Alert>}
        <BirthwaveFormGrid>
          <BirthwaveFormGridItem fullWidth><TextField required fullWidth label="Rule name" value={form.name} onChange={(event) => update('name', event.target.value)} /></BirthwaveFormGridItem>
          {/*
            BW-SVC-001: the rule's service criterion was free text, so a rule
            only matched Leads whose service string was spelled identically, and
            renaming a service silently stopped the rule matching. It now selects
            from the service master and stores service_id.
          */}
          <BirthwaveFormGridItem><FormControl fullWidth>
            <InputLabel id="rule-service-label">Service (optional)</InputLabel>
            <Select
              labelId="rule-service-label"
              label="Service (optional)"
              value={form.service_id}
              onChange={(event) => update('service_id', String(event.target.value))}
            >
              <MenuItem value=""><em>Any service</em></MenuItem>
              {serviceOptions.map((service) => (
                <MenuItem key={service.id} value={String(service.id)}>
                  {service.name}{!service.is_active ? ' (inactive)' : ''}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Leave empty to match any service.</FormHelperText>
          </FormControl></BirthwaveFormGridItem>
          <BirthwaveFormGridItem><TextField fullWidth label="Source (optional)" value={form.source} onChange={(event) => update('source', event.target.value)} helperText="Example: Instagram or Website." /></BirthwaveFormGridItem>
          <BirthwaveFormGridItem><FormControl required fullWidth>
            <InputLabel id="assignment-rule-team-label">Team</InputLabel>
            <Select labelId="assignment-rule-team-label" label="Team" value={form.team_id} onChange={(event) => update('team_id', String(event.target.value))}><MenuItem value=""><em>Select a team</em></MenuItem>{teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</Select>
          </FormControl></BirthwaveFormGridItem>
          <BirthwaveFormGridItem><FormControl fullWidth><InputLabel id="assignment-rule-method-label">Assignment method</InputLabel><Select labelId="assignment-rule-method-label" label="Assignment method" value={form.assignment_method} onChange={(event) => update('assignment_method', event.target.value)}><MenuItem value="ROUND_ROBIN">Round Robin</MenuItem><MenuItem value="MANUAL">Manual</MenuItem></Select></FormControl></BirthwaveFormGridItem>
          <BirthwaveFormGridItem><TextField required fullWidth type="number" label="Priority" value={form.priority} onChange={(event) => update('priority', event.target.value)} helperText="Lower numbers are evaluated first." /></BirthwaveFormGridItem>
          <BirthwaveFormGridItem sx={{ display: 'flex', alignItems: 'center' }}><FormControlLabel control={<Switch checked={form.is_active} onChange={(event) => update('is_active', event.target.checked)} />} label={form.is_active ? 'Active rule' : 'Inactive rule'} /></BirthwaveFormGridItem>
        </BirthwaveFormGrid>
      </Box>
    </BirthwaveDrawerLayout>
  </Box>;
};

export default AssignmentRulesPage;
