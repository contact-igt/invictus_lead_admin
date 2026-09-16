import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, Switch, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { buildClientPortalPath } from 'routes/paths';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { BirthwaveInitialTeamMember, BirthwaveTeam } from 'services/birthwave';
import {
  useBirthwaveAssignmentRulesQuery,
  useBirthwaveManagementCandidatesQuery,
  useBirthwaveTeamMembersQuery,
  useBirthwaveTeamQuery,
  useBirthwaveTeamWorkQuery,
  useBirthwaveTeamContextQuery,
  useBirthwaveTeamsQuery,
  useCreateBirthwaveTeamMutation,
  useUpdateBirthwaveTeamMutation,
} from 'components/hooks/useBirthwaveQuery';
import { useBirthwaveScope } from '../useBirthwaveScope';
import PortalPageHeader from '../PortalPageHeader';
import BirthwaveDrawerLayout, { BirthwaveFormGrid, BirthwaveFormGridItem } from '../BirthwaveDrawerLayout';

const GREEN = '#29AF81';
const DARK = 'var(--bw-text)';
const MUTED = 'var(--bw-text-muted)';
const BORDER = 'var(--bw-border)';
const cardSx = { bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: BORDER, borderRadius: '14px' };
const roleLabel = (role: string) => role === 'TEAM_MANAGER' ? 'Team Manager' : 'Telecaller';
const statusLabel = (status: string) => status === 'ASSIGNMENT_PAUSED' ? 'Assignment Paused' : status === 'INACTIVE' ? 'Inactive' : 'Active';
type Draft = BirthwaveInitialTeamMember & { username: string; email: string };

const TeamFormDrawer = ({ open, onClose, clientKey, team }: { open: boolean; onClose: () => void; clientKey?: string; team?: BirthwaveTeam | null }) => {
  const editing = Boolean(team);
  const create = useCreateBirthwaveTeamMutation(clientKey);
  const update = useUpdateBirthwaveTeamMutation(clientKey);
  const { data: candidates = [], isLoading: candidatesLoading } = useBirthwaveManagementCandidatesQuery(clientKey, { enabled: open && !editing });
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState('');
  const [members, setMembers] = useState<Draft[]>([]);
  const busy = create.isLoading || update.isLoading;
  const error = (create.error || update.error) as { response?: { data?: { message?: string } } } | null;

  useEffect(() => {
    setName(team?.name || '');
    setCode(team?.code || '');
    setDescription(team?.description || '');
    setActive(team?.is_active ?? true);
    setStep(1);
    setSelected('');
    setMembers([]);
  }, [team, open]);

  const add = (id: string) => {
    const candidate = candidates.find((item) => String(item.id) === id);
    if (!candidate || members.some((item) => item.management_id === candidate.id)) return;
    setMembers((current) => [...current, { management_id: candidate.id, username: candidate.username, email: candidate.email, operational_role: 'TELECALLER', assignment_enabled: true, status: 'ACTIVE', service_access: [], source_access: [] }]);
    setSelected('');
  };
  const patchMember = (id: number, patch: Partial<Draft>) => setMembers((current) => current.map((item) => item.management_id === id ? { ...item, ...patch } : item));
  const submit = (initialMembers = members) => {
    if (!name.trim()) return;
    const data = { name: name.trim(), code: code.trim() || undefined, description: description.trim() || null, is_active: active, ...(editing ? {} : { initial_members: initialMembers.map((member) => ({ management_id: member.management_id, operational_role: member.operational_role, assignment_enabled: member.assignment_enabled, status: member.status, service_access: member.service_access, source_access: member.source_access })) }) };
    if (editing && team) update.mutate({ id: team.id, data }, { onSuccess: onClose });
    else create.mutate(data, { onSuccess: onClose });
  };

  const footer = editing ? <><Button onClick={onClose} disabled={busy} sx={{ textTransform: 'none', color: MUTED }}>Cancel</Button><Button variant="contained" onClick={() => submit()} disabled={busy || !name.trim()} sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}>{busy ? 'Saving...' : 'Save Changes'}</Button></> : step === 1 ? <><Button onClick={onClose} disabled={busy} sx={{ textTransform: 'none', color: MUTED }}>Cancel</Button><Button variant="contained" onClick={() => name.trim() && setStep(2)} disabled={busy || !name.trim()} sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}>{busy ? 'Saving...' : 'Next: Add Members'}</Button></> : <><Button onClick={() => setStep(1)} disabled={busy} sx={{ textTransform: 'none', color: MUTED }}>Back</Button><Button onClick={() => submit([])} disabled={busy} sx={{ textTransform: 'none', color: MUTED }}>Skip for Now</Button><Button variant="contained" onClick={() => submit()} disabled={busy} sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}>{busy ? 'Creating...' : 'Create Team'}</Button></>;
  return <BirthwaveDrawerLayout open={open} onClose={onClose} title={editing ? 'Edit Team' : step === 1 ? 'Create Team' : 'Add Initial Members'} subtitle={editing ? 'Update team details' : step === 1 ? 'Step 1 of 2 · Team details' : 'Step 2 of 2 · Optional membership setup'} width={600} footer={footer}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error.response?.data?.message || 'Unable to save Team.'}</Alert>}
    {!editing && step === 2 ? <Stack spacing={2.25} sx={{ width: '100%', minWidth: 0, alignItems: 'stretch' }}>
      <Typography sx={{ color: DARK, fontWeight: 800 }}>Select Team Members</Typography>
      <Typography sx={{ color: MUTED, fontSize: '0.875rem', lineHeight: 1.5, mt: 0.5 }}>Choose existing Birthwave users only. You can skip this step and add members later.</Typography>
      {candidatesLoading ? <Typography sx={{ color: MUTED }}>Loading eligible Birthwave users...</Typography> : candidates.length === 0 ? <Alert severity="info">No eligible Birthwave users are available. Create the user from Invictus User Management first.</Alert> : <FormControl fullWidth size="small"><InputLabel>Add Staff Member</InputLabel><Select value={selected} label="Add Staff Member" onChange={(event) => add(String(event.target.value))}><MenuItem value=""><em>Select an existing Birthwave user</em></MenuItem>{candidates.filter((item) => !members.some((member) => member.management_id === item.id)).map((item) => <MenuItem key={item.id} value={item.id}>{item.username} · {item.email}</MenuItem>)}</Select></FormControl>}
      <Box sx={{ width: '100%', minWidth: 0 }}><Typography sx={{ color: MUTED, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1 }}>Selected Members</Typography>{members.length === 0 ? <Box sx={{ ...cardSx, width: '100%', boxSizing: 'border-box', p: 2, bgcolor: 'var(--bw-surface-2)' }}><Typography sx={{ color: DARK, fontSize: '0.875rem', fontWeight: 700 }}>No initial members selected.</Typography><Typography sx={{ color: MUTED, fontSize: '0.825rem', lineHeight: 1.5, mt: 0.35 }}>This Team can be created with zero members. You can also add members later from Team Members.</Typography></Box> : <Stack spacing={1.5} sx={{ width: '100%' }}>{members.map((member) => <Box key={member.management_id} sx={{ ...cardSx, width: '100%', boxSizing: 'border-box', p: 2 }}><Stack spacing={1.35} sx={{ width: '100%', minWidth: 0 }}><Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}><Typography sx={{ color: DARK, fontWeight: 700, fontSize: '0.95rem' }}>{member.username}</Typography><Typography sx={{ color: MUTED, fontSize: '0.8rem', overflowWrap: 'anywhere' }}>{member.email}</Typography></Box><FormControl fullWidth size="small"><InputLabel>Operational Role</InputLabel><Select value={member.operational_role} label="Operational Role" onChange={(event) => patchMember(member.management_id, { operational_role: event.target.value })}><MenuItem value="TELECALLER">Telecaller</MenuItem><MenuItem value="TEAM_MANAGER">Team Manager</MenuItem></Select></FormControl><FormControl fullWidth size="small"><InputLabel>Assignment Status</InputLabel><Select value={member.status} label="Assignment Status" onChange={(event) => patchMember(member.management_id, { status: event.target.value })}><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="ASSIGNMENT_PAUSED">Assignment Paused</MenuItem><MenuItem value="INACTIVE">Inactive</MenuItem></Select></FormControl><TextField fullWidth size="small" label="Service Access" value={(member.service_access || []).join(', ')} onChange={(event) => patchMember(member.management_id, { service_access: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /><TextField fullWidth size="small" label="Source Access" value={(member.source_access || []).join(', ')} onChange={(event) => patchMember(member.management_id, { source_access: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} /><Button size="small" onClick={() => setMembers((current) => current.filter((item) => item.management_id !== member.management_id))} sx={{ alignSelf: 'flex-start', color: '#B42318', textTransform: 'none' }}>Remove Member</Button></Stack></Box>)}</Stack>}</Box>
    </Stack> : <BirthwaveFormGrid>
      <BirthwaveFormGridItem><TextField required fullWidth label="Team Name" value={name} onChange={(event) => setName(event.target.value)} /></BirthwaveFormGridItem>
      <BirthwaveFormGridItem><TextField fullWidth label="Team Code" helperText="Optional; generated when blank." value={code} onChange={(event) => setCode(event.target.value)} /></BirthwaveFormGridItem>
      <BirthwaveFormGridItem fullWidth><TextField fullWidth multiline minRows={3} label="Description" value={description} onChange={(event) => setDescription(event.target.value)} /></BirthwaveFormGridItem>
      <BirthwaveFormGridItem fullWidth><FormControlLabel control={<Switch checked={active} onChange={(event) => setActive(event.target.checked)} />} label={active ? 'Active' : 'Inactive'} /></BirthwaveFormGridItem>
    </BirthwaveFormGrid>}
  </BirthwaveDrawerLayout>;
};

const TeamDetail = ({ teamId, clientKey, canConfigure, onEdit, onClose }: { teamId: number; clientKey?: string; canConfigure: boolean; onEdit: (team: BirthwaveTeam) => void; onClose: () => void }) => {
  const navigate = useNavigate();
  const { data: team, isLoading, isError, refetch } = useBirthwaveTeamQuery(clientKey, teamId, { enabled: Boolean(teamId) });
  const { data: members = [], isLoading: membersLoading, isError: membersError, refetch: refetchMembers } = useBirthwaveTeamMembersQuery(clientKey, teamId, { enabled: Boolean(teamId) });
  const { data: rules = [] } = useBirthwaveAssignmentRulesQuery(clientKey, { enabled: canConfigure });
  const { data: work } = useBirthwaveTeamWorkQuery(clientKey, { team_id: teamId }, { enabled: Boolean(teamId) });
  const go = (path: string) => navigate(buildClientPortalPath(clientKey || 'birthwave', path));
  const activeRules = rules.filter((rule) => rule.is_active && Number(rule.team_id) === teamId);
  const openTasks = work ? Object.values(work.sections || {}).reduce((total, section) => total + (section?.pagination?.total || 0), 0) : null;
  const overdue = work?.counts?.overdue ?? null;
  return <BirthwaveDrawerLayout open onClose={onClose} title={team?.name || 'Team detail'} subtitle={team?.code ? `Team code: ${team.code}` : 'Operational team details'} width={520} footer={<Button onClick={onClose} sx={{ textTransform: 'none', color: MUTED }}>Close</Button>}>
    {isLoading && <Typography sx={{ color: MUTED }}>Loading team...</Typography>}
    {isError && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => { void refetch(); void refetchMembers(); }}>Retry</Button>}>Unable to load team.</Alert>}
    {!isLoading && !isError && !team && <Typography sx={{ color: MUTED }}>Team not found.</Typography>}
    {team && !isLoading && !isError && <Stack spacing={2.5} sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ ...cardSx, p: 2 }}><Stack direction="row" justifyContent="space-between" spacing={2}><Box><Typography sx={{ color: MUTED, fontSize: '0.7rem', textTransform: 'uppercase' }}>Team Name</Typography><Typography sx={{ color: DARK, fontWeight: 800, fontSize: '1.1rem' }}>{team.name}</Typography><Typography sx={{ color: MUTED, fontSize: '0.8rem', mt: 1 }}>{team.description || 'No description provided.'}</Typography></Box><Chip label={team.is_active ? 'Active' : 'Inactive'} size="small" /></Stack><Stack direction="row" spacing={3} mt={2}><Box><Typography sx={{ color: MUTED, fontSize: '0.72rem' }}>Members</Typography><Typography sx={{ color: DARK, fontWeight: 800 }}>{team.member_count}</Typography></Box><Box><Typography sx={{ color: MUTED, fontSize: '0.72rem' }}>Assigned Leads</Typography><Typography sx={{ color: DARK, fontWeight: 800 }}>{team.assigned_lead_count}</Typography></Box></Stack>{canConfigure && <Button size="small" onClick={() => onEdit(team)} sx={{ mt: 1.5, textTransform: 'none', color: GREEN }}>Edit Team</Button>}</Box>
      <Box><Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}><Box><Typography sx={{ color: DARK, fontWeight: 800 }}>Members</Typography><Typography sx={{ color: MUTED, fontSize: '0.78rem' }}>Concise operational preview</Typography></Box><Button size="small" onClick={() => go(`team-members?team_id=${team.id}`)} sx={{ textTransform: 'none', color: GREEN, fontWeight: 700 }}>Manage Team Members</Button></Stack>{membersLoading && <Typography sx={{ color: MUTED }}>Loading members...</Typography>}{membersError && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void refetchMembers()}>Retry</Button>}>Unable to load members.</Alert>}{!membersLoading && !membersError && members.length === 0 && <Box sx={{ ...cardSx, p: 2 }}><Typography sx={{ color: MUTED, fontSize: '0.84rem' }}>No members have been added to this Team yet.</Typography></Box>}{members.slice(0, 3).map((member) => <Box key={member.id} sx={{ ...cardSx, p: 1.5, mb: 1 }}><Typography sx={{ color: DARK, fontWeight: 700 }}>{member.management?.username || 'Unknown member'} <Typography component="span" sx={{ color: MUTED, fontSize: '0.78rem', fontWeight: 400 }}>· {roleLabel(member.operational_role)}</Typography></Typography><Typography sx={{ color: MUTED, fontSize: '0.76rem' }}>{member.management?.email || 'No email'} · {statusLabel(member.status)}</Typography></Box>)}</Box>
      <Box sx={{ ...cardSx, p: 2 }}><Typography sx={{ color: DARK, fontWeight: 800 }}>Routing</Typography><Typography sx={{ color: MUTED, fontSize: '0.78rem' }}>{activeRules.length} active assignment rules</Typography><Button size="small" onClick={() => go('assignment-rules')} sx={{ mt: 1, textTransform: 'none', color: GREEN }}>View Assignment Rules</Button></Box>
      <Box sx={{ ...cardSx, p: 2 }}><Typography sx={{ color: DARK, fontWeight: 800 }}>Operations</Typography><Stack direction="row" spacing={3} mt={1}><Box><Typography sx={{ color: MUTED, fontSize: '0.72rem' }}>Assigned Leads</Typography><Typography sx={{ color: DARK, fontWeight: 800 }}>{team.assigned_lead_count}</Typography></Box>{openTasks !== null && <Box><Typography sx={{ color: MUTED, fontSize: '0.72rem' }}>Open Tasks</Typography><Typography sx={{ color: DARK, fontWeight: 800 }}>{openTasks}</Typography></Box>}{overdue !== null && <Box><Typography sx={{ color: MUTED, fontSize: '0.72rem' }}>Overdue Tasks</Typography><Typography sx={{ color: DARK, fontWeight: 800 }}>{overdue}</Typography></Box>}</Stack><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mt={1}><Button size="small" onClick={() => go(`leads?team_id=${team.id}`)} sx={{ textTransform: 'none', color: GREEN }}>View Team Leads</Button><Button size="small" onClick={() => go(`my-work?view=team&team_id=${team.id}`)} sx={{ textTransform: 'none', color: GREEN }}>View Team Work</Button></Stack></Box>
    </Stack>}
  </BirthwaveDrawerLayout>;
};

const TeamsPage = () => {
  const { user } = useAuth();
  const { hasScope, scopedClientKey } = useBirthwaveScope();
  const { data: context } = useBirthwaveTeamContextQuery(scopedClientKey, { enabled: hasScope });
  const { data: teams = [], isLoading } = useBirthwaveTeamsQuery(scopedClientKey, {}, { enabled: hasScope });
  const role = String(user?.role || '').toLowerCase();
  const canConfigure = ['super-admin', 'admin', 'client'].includes(role);
  const [selected, setSelected] = useState<number>();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BirthwaveTeam | null>(null);
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  if (!hasScope) return <Box sx={{ p: 4 }}><Typography color="text.secondary">Please select a client.</Typography></Box>;
  return <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
    <PortalPageHeader title="Teams" subtitle="Manage counselling teams and operational ownership" action={canConfigure ? <Button variant="contained" onClick={openCreate} sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}>+ Add Team</Button> : undefined} />
    {!canConfigure && context && <Alert severity="info" sx={{ mb: 2 }}>You can view teams and Leads assigned to your operational membership.</Alert>}
    <Box sx={{ ...cardSx, overflowX: 'auto' }}>{isLoading ? <Box sx={{ p: 3 }}><Typography sx={{ color: MUTED }}>Loading teams...</Typography></Box> : teams.length === 0 ? <Box sx={{ p: 4, textAlign: 'center' }}><Typography sx={{ color: MUTED }}>No teams created yet.</Typography>{canConfigure && <Button onClick={openCreate} sx={{ mt: 1, textTransform: 'none', color: GREEN }}>+ Add Team</Button>}</Box> : <Box component="table" sx={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}><Box component="thead"><Box component="tr">{['Team Name', 'Status', 'Members', 'Assigned Leads', 'Actions'].map((heading) => <Box component="th" key={heading} sx={{ textAlign: 'left', px: 2.5, py: 1.5, bgcolor: 'var(--bw-surface-2)', color: MUTED, fontSize: '0.7rem', textTransform: 'uppercase' }}>{heading}</Box>)}</Box></Box><Box component="tbody">{teams.map((team) => <Box component="tr" key={team.id}><Box component="td" sx={{ px: 2.5, py: 1.8, borderTop: '1px solid', borderColor: BORDER }}><Typography sx={{ fontWeight: 700, color: DARK }}>{team.name}</Typography><Typography sx={{ color: MUTED, fontSize: '0.72rem' }}>{team.code}</Typography></Box><Box component="td" sx={{ px: 2.5, borderTop: '1px solid', borderColor: BORDER }}><Chip label={team.is_active ? 'Active' : 'Inactive'} size="small" /></Box><Box component="td" sx={{ px: 2.5, color: DARK, borderTop: '1px solid', borderColor: BORDER }}>{team.member_count}</Box><Box component="td" sx={{ px: 2.5, color: DARK, borderTop: '1px solid', borderColor: BORDER }}>{team.assigned_lead_count}</Box><Box component="td" sx={{ px: 2.5, borderTop: '1px solid', borderColor: BORDER }}><Button size="small" onClick={() => setSelected(team.id)} sx={{ textTransform: 'none', color: GREEN }}>Open Team</Button>{canConfigure && <Button size="small" onClick={() => { setEditing(team); setFormOpen(true); }} sx={{ textTransform: 'none', color: DARK }}>Edit</Button>}</Box></Box>)}</Box></Box>}</Box>
    {selected && <TeamDetail teamId={selected} clientKey={scopedClientKey} canConfigure={canConfigure} onEdit={(team) => { setEditing(team); setFormOpen(true); }} onClose={() => setSelected(undefined)} />}
    <TeamFormDrawer open={formOpen} onClose={() => setFormOpen(false)} clientKey={scopedClientKey} team={editing} />
  </Box>;
};

export default TeamsPage;
