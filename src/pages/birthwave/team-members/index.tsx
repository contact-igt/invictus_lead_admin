import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { BirthwaveTeamMember } from 'services/birthwave';
import {
  useAddBirthwaveTeamMemberMutation,
  useBirthwaveAllTeamMembersQuery,
  useBirthwaveManagementCandidatesQuery,
  useBirthwaveTeamsQuery,
  useUpdateBirthwaveTeamMemberMutation,
} from 'components/hooks/useBirthwaveQuery';
import { useBirthwaveScope } from '../useBirthwaveScope';
import PortalPageHeader from '../PortalPageHeader';
import BirthwaveDrawerLayout, { BirthwaveFormGrid, BirthwaveFormGridItem } from '../BirthwaveDrawerLayout';

const GREEN = '#29AF81';
const TEXT = 'var(--bw-text)';
const MUTED = 'var(--bw-text-muted)';
const BORDER = 'var(--bw-border)';
const cardSx = { bgcolor: 'var(--bw-surface)', border: '1px solid', borderColor: BORDER, borderRadius: '14px' };
const roleLabel = (role: string) => role === 'TEAM_MANAGER' ? 'Team Manager' : 'Telecaller';
const statusLabel = (status: string) => status === 'ASSIGNMENT_PAUSED' ? 'Assignment Paused' : status === 'INACTIVE' ? 'Inactive' : 'Active';

type MembershipRow = BirthwaveTeamMember & { team: { id: number; name: string; code: string } };

const TeamMemberForm = ({
  open,
  onClose,
  clientKey,
  teams,
  candidates,
  member,
}: {
  open: boolean;
  onClose: () => void;
  clientKey?: string;
  teams: Array<{ id: number; name: string; code: string }>;
  candidates: Array<{ id: number; username: string; email: string }>;
  member?: MembershipRow | null;
}) => {
  const editing = Boolean(member);
  const [managementId, setManagementId] = useState(member ? String(member.management_id) : '');
  const [teamId, setTeamId] = useState(member ? String(member.team.id) : '');
  const [role, setRole] = useState(member?.operational_role || 'TELECALLER');
  const [status, setStatus] = useState(member?.status || 'ACTIVE');
  const [services, setServices] = useState((member?.service_access || []).join(', '));
  const [sources, setSources] = useState((member?.source_access || []).join(', '));
  const add = useAddBirthwaveTeamMemberMutation(clientKey, teamId || undefined);
  const update = useUpdateBirthwaveTeamMemberMutation(clientKey, member?.team.id);
  const saving = add.isLoading || update.isLoading;
  const error = (add.error || update.error) as { response?: { data?: { message?: string } } } | null;
  const submit = () => {
    if (!teamId || !role || !managementId) return;
    const data = { operational_role: role, status, service_access: services.split(',').map((item) => item.trim()).filter(Boolean), source_access: sources.split(',').map((item) => item.trim()).filter(Boolean) };
    if (editing && member) update.mutate({ memberId: member.id, data }, { onSuccess: onClose });
    else add.mutate({ management_id: Number(managementId), ...data }, { onSuccess: onClose });
  };
  useEffect(() => {
    setManagementId(member ? String(member.management_id) : '');
    setTeamId(member ? String(member.team.id) : '');
    setRole(member?.operational_role || 'TELECALLER');
    setStatus(member?.status || 'ACTIVE');
    setServices((member?.service_access || []).join(', '));
    setSources((member?.source_access || []).join(', '));
  }, [member, open]);
  return <BirthwaveDrawerLayout open={open} onClose={onClose} title={editing ? 'Edit Team Membership' : 'Add Team Member'} subtitle="Assign an existing Birthwave user to a Team" width={440} footer={<><Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none', color: MUTED }}>Cancel</Button><Button onClick={submit} variant="contained" disabled={saving || !managementId || !teamId} sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Team Member'}</Button></>}>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error.response?.data?.message || 'Unable to save membership.'}</Alert>}
    {!editing && candidates.length === 0 && <Alert severity="info" sx={{ mb: 2 }}>No eligible Birthwave users are available. Create the user from Invictus User Management first.</Alert>}
    <BirthwaveFormGrid>
      <BirthwaveFormGridItem><FormControl fullWidth size="small" required disabled={editing}><InputLabel>Staff Member</InputLabel><Select value={managementId} label="Staff Member" onChange={(event) => setManagementId(String(event.target.value))}><MenuItem value=""><em>Select an existing Birthwave user</em></MenuItem>{candidates.map((candidate) => <MenuItem key={candidate.id} value={candidate.id}>{candidate.username} · {candidate.email}</MenuItem>)}</Select></FormControl></BirthwaveFormGridItem>
      <BirthwaveFormGridItem><FormControl fullWidth size="small" required><InputLabel>Team</InputLabel><Select value={teamId} label="Team" onChange={(event) => setTeamId(String(event.target.value))}><MenuItem value=""><em>Select a Team</em></MenuItem>{teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</Select></FormControl></BirthwaveFormGridItem>
      <BirthwaveFormGridItem><FormControl fullWidth size="small"><InputLabel>Operational Role</InputLabel><Select value={role} label="Operational Role" onChange={(event) => setRole(event.target.value)}><MenuItem value="TELECALLER">Telecaller</MenuItem><MenuItem value="TEAM_MANAGER">Team Manager</MenuItem></Select></FormControl></BirthwaveFormGridItem>
      <BirthwaveFormGridItem><FormControl fullWidth size="small"><InputLabel>Assignment Status</InputLabel><Select value={status} label="Assignment Status" onChange={(event) => setStatus(event.target.value)}><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="ASSIGNMENT_PAUSED">Assignment Paused</MenuItem><MenuItem value="INACTIVE">Inactive</MenuItem></Select></FormControl></BirthwaveFormGridItem>
      <BirthwaveFormGridItem><TextField fullWidth size="small" label="Service Access" placeholder="Leave empty for all services" value={services} onChange={(event) => setServices(event.target.value)} /></BirthwaveFormGridItem>
      <BirthwaveFormGridItem><TextField fullWidth size="small" label="Source Access" placeholder="Leave empty for all sources" value={sources} onChange={(event) => setSources(event.target.value)} /></BirthwaveFormGridItem>
    </BirthwaveFormGrid>
  </BirthwaveDrawerLayout>;
};

const TeamMembersPage = () => {
  const { user } = useAuth();
  const { hasScope, scopedClientKey } = useBirthwaveScope();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = String(user?.role || '').toLowerCase();
  const canConfigure = ['super-admin', 'admin', 'client'].includes(role);
  const { data: teams = [], isLoading: teamsLoading } = useBirthwaveTeamsQuery(scopedClientKey, {}, { enabled: hasScope });
  const { members, isLoading: membersLoading, isError: membersError } = useBirthwaveAllTeamMembersQuery(scopedClientKey, teams, { enabled: hasScope });
  const { data: candidates = [] } = useBirthwaveManagementCandidatesQuery(scopedClientKey, { enabled: hasScope && canConfigure });
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState(searchParams.get('team_id') || '');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MembershipRow | null>(null);
  const rows = members as MembershipRow[];
  const filtered = useMemo(() => rows.filter((member) => {
    const haystack = `${member.management?.username || ''} ${member.management?.email || ''} ${member.team.name}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) && (!teamFilter || String(member.team.id) === teamFilter) && (!roleFilter || member.operational_role === roleFilter) && (!statusFilter || member.status === statusFilter);
  }), [rows, search, teamFilter, roleFilter, statusFilter]);
  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (member: MembershipRow) => { setEditing(member); setFormOpen(true); };
  const updateTeamFilter = (value: string) => { setTeamFilter(value); setSearchParams(value ? { team_id: value } : {}); };
  if (!hasScope) return <Box sx={{ p: 4 }}><Typography color="text.secondary">Please select a client.</Typography></Box>;
  return <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
    <PortalPageHeader title="Team Members" subtitle="Manage Birthwave team membership assignments" action={canConfigure ? <Button variant="contained" onClick={openAdd} startIcon={<Icon icon="mdi:plus" />} sx={{ textTransform: 'none', bgcolor: GREEN, boxShadow: 'none' }}>Add Team Member</Button> : undefined} />
    <Box sx={{ ...cardSx, p: 2, mb: 2 }}><Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}><TextField size="small" fullWidth label="Search" placeholder="Name, email, or team" value={search} onChange={(event) => setSearch(event.target.value)} /><FormControl size="small" sx={{ minWidth: { md: 190 } }}><InputLabel>Team</InputLabel><Select value={teamFilter} label="Team" onChange={(event) => updateTeamFilter(String(event.target.value))}><MenuItem value="">All Teams</MenuItem>{teams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}</Select></FormControl><FormControl size="small" sx={{ minWidth: { md: 180 } }}><InputLabel>Operational Role</InputLabel><Select value={roleFilter} label="Operational Role" onChange={(event) => setRoleFilter(String(event.target.value))}><MenuItem value="">All Roles</MenuItem><MenuItem value="TELECALLER">Telecaller</MenuItem><MenuItem value="TEAM_MANAGER">Team Manager</MenuItem></Select></FormControl><FormControl size="small" sx={{ minWidth: { md: 170 } }}><InputLabel>Status</InputLabel><Select value={statusFilter} label="Status" onChange={(event) => setStatusFilter(String(event.target.value))}><MenuItem value="">All Statuses</MenuItem><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="ASSIGNMENT_PAUSED">Assignment Paused</MenuItem><MenuItem value="INACTIVE">Inactive</MenuItem></Select></FormControl></Stack></Box>
    <Box sx={{ ...cardSx, overflowX: 'auto' }}>{teamsLoading || membersLoading ? <Box sx={{ p: 3 }}><Typography sx={{ color: MUTED }}>Loading Team Members...</Typography></Box> : membersError ? <Box sx={{ p: 3 }}><Alert severity="error">Unable to load Team Members.</Alert></Box> : filtered.length === 0 ? <Box sx={{ p: 4, textAlign: 'center' }}><Typography sx={{ color: MUTED }}>No Team Members found.</Typography>{(search || teamFilter || roleFilter || statusFilter) && <Typography sx={{ color: MUTED, fontSize: '0.82rem', mt: 0.5 }}>No members match these filters.</Typography>}{canConfigure && <Button onClick={openAdd} sx={{ mt: 1, textTransform: 'none', color: GREEN }}>+ Add Team Member</Button>}</Box> : <Box component="table" sx={{ width: '100%', minWidth: 880, borderCollapse: 'collapse' }}><Box component="thead"><Box component="tr">{['Staff Member', 'Team', 'Operational Role', 'Assignment Status', 'Service Access', 'Source Access', 'Actions'].map((heading) => <Box component="th" key={heading} sx={{ textAlign: 'left', px: 2, py: 1.5, color: MUTED, fontSize: '0.7rem', textTransform: 'uppercase', borderBottom: '1px solid', borderColor: BORDER }}>{heading}</Box>)}</Box></Box><Box component="tbody">{filtered.map((member) => <Box component="tr" key={member.id} sx={{ '&:hover td': { bgcolor: 'var(--bw-hover)' } }}><Box component="td" sx={{ px: 2, py: 1.6, borderBottom: '1px solid', borderColor: BORDER }}><Typography sx={{ color: TEXT, fontWeight: 700, fontSize: '0.84rem' }}>{member.management?.username || 'Unknown member'}</Typography><Typography sx={{ color: MUTED, fontSize: '0.74rem' }}>{member.management?.email || 'No email'}</Typography></Box><Box component="td" sx={{ px: 2, py: 1.6, color: TEXT, borderBottom: '1px solid', borderColor: BORDER }}>{member.team.name}</Box><Box component="td" sx={{ px: 2, py: 1.6, color: TEXT, borderBottom: '1px solid', borderColor: BORDER }}>{roleLabel(member.operational_role)}</Box><Box component="td" sx={{ px: 2, py: 1.6, borderBottom: '1px solid', borderColor: BORDER }}><Chip label={statusLabel(member.status)} size="small" sx={{ bgcolor: member.status === 'ACTIVE' ? 'var(--bw-tint-green)' : 'var(--bw-surface-2)', color: member.status === 'ACTIVE' ? '#15803D' : MUTED, fontWeight: 700 }} /></Box><Box component="td" sx={{ px: 2, py: 1.6, color: MUTED, fontSize: '0.78rem', borderBottom: '1px solid', borderColor: BORDER }}>{member.service_access?.length ? member.service_access.join(', ') : 'All services'}</Box><Box component="td" sx={{ px: 2, py: 1.6, color: MUTED, fontSize: '0.78rem', borderBottom: '1px solid', borderColor: BORDER }}>{member.source_access?.length ? member.source_access.join(', ') : 'All sources'}</Box><Box component="td" sx={{ px: 2, py: 1.6, borderBottom: '1px solid', borderColor: BORDER }}>{canConfigure && <Button size="small" onClick={() => openEdit(member)} sx={{ textTransform: 'none', color: GREEN }}>Edit</Button>}</Box></Box>)}</Box></Box>}</Box>
    <TeamMemberForm open={formOpen} onClose={() => setFormOpen(false)} clientKey={scopedClientKey} teams={teams} candidates={candidates} member={editing} />
  </Box>;
};

export default TeamMembersPage;
