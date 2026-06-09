
import {
    usePixelEyeQuery,
    useCreatePixelEyeMutation,
    useUpdatePixelEyeMutation,
    useDeletePixelEyeMutation,
    CreatePixelEyePayload,
    UpdatePixelEyePayload,
} from 'components/hooks/usePixelEyeQuery';
import PixelEyeTable, { PixelEyeRow } from './pixelEyeTable';
import PixelEyeForm, { PixelEyeFormValues } from './PixelEyeForm';
import NotificationTracker from './NotificationTracker';
import Paper from '@mui/material/Paper';
import PageTitle from 'components/common/PageTitle';
import PageLoader from 'components/loader/PageLoader';
import { Popup } from 'components/common/Popup';
import ConfirmAlert from 'components/common/ConfirmAlert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useState, useMemo } from 'react';
import { Box, Grid, Typography, Paper as MuiPaper, TextField, MenuItem } from '@mui/material';
import { ALL_STATUSES } from './pixelEyeStatuses';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { useParams } from 'react-router-dom';
import { normalizeClientKey } from 'utils/clientKey';


const PixelEyeSection = () => {
    const { user } = useAuth();
    const { clientKey: urlClientKey } = useParams<{ clientKey?: string }>();
    const createMutation = useCreatePixelEyeMutation();
    const updateMutation = useUpdatePixelEyeMutation();
    const deleteMutation = useDeletePixelEyeMutation();

    const activeClientKey = normalizeClientKey(
        user?.role === 'super-admin' ? (urlClientKey || 'pixeleye') : user?.clientKey,
    );

    const { data: leads = [], isLoading } = usePixelEyeQuery(
        user?.role === 'super-admin' ? activeClientKey : undefined,
    );

    const [activeTab, setActiveTab] = useState<'leads' | 'notifications'>('leads');
    const [formOpen, setFormOpen] = useState(false);
    const [editRow, setEditRow] = useState<PixelEyeRow | null>(null);
    const [openConfirmAlertModal, setOpenConfirmAlertModal] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

    const handleAdd = () => {
        setEditRow(null);
        setFormOpen(true);
    };

    const handleEdit = (row: PixelEyeRow) => {
        setEditRow(row);
        setFormOpen(true);
    };

    const handleOpenConfirmAlertModal = (id: number) => {
        setSelectedLeadId(id);
        setOpenConfirmAlertModal(true);
    };

    const handleDelete = () => {
        if (!selectedLeadId) return;

        deleteMutation.mutate(selectedLeadId, {
            onSuccess: () => {
                setOpenConfirmAlertModal(false);
                setSelectedLeadId(null);
            },
        });
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditRow(null);
    };

    const handleFormSubmit = (values: PixelEyeFormValues) => {
        if (editRow && editRow.id) {
            // Close only after the API call succeeds so the user sees errors if it fails.
            updateMutation.mutate(
                { id: editRow.id, ...values } as UpdatePixelEyePayload,
                { onSuccess: closeForm },
            );
        } else {
            const payload: CreatePixelEyePayload = activeClientKey
                ? { ...values, _client_key: activeClientKey }
                : values;
            createMutation.mutate(payload, { onSuccess: closeForm });
        }
    };

    const handleFormCancel = closeForm;


    // --- Summary Bar ---
    const today = new Date().toISOString().slice(0, 10);
    const summary = useMemo(() => {
        let total = leads.length;
        let todayCount = leads.filter((l: PixelEyeRow) => l.date === today).length;
        let followUp = leads.filter((l: PixelEyeRow) => l.status === 'Follow-up Required' || l.status === 'Hot Follow-up').length;
        let appointments = leads.filter((l: PixelEyeRow) => l.status === 'Appointment Fixed').length;
        let closed = leads.filter((l: PixelEyeRow) => l.status === 'Closed').length;
        return { total, todayCount, followUp, appointments, closed };
    }, [leads, today]);

    // --- Filtering ---
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const filteredLeads = useMemo(() => {
        return leads.filter((l: PixelEyeRow) =>
            (!search || l.customer_name?.toLowerCase().includes(search.toLowerCase()) || l.phone_number?.includes(search)) &&
            (!statusFilter || l.status === statusFilter)
        );
    }, [leads, search, statusFilter]);

    if (isLoading) return <PageLoader />;

    return (
        <Paper sx={{ p: 2, width: '100%' }}>
            <PageTitle title="PixelEye Dashboard" />

            {/* --- Tab Switcher --- */}
            <Tabs
                value={activeTab}
                onChange={(_e, v) => setActiveTab(v)}
                sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
            >
                <Tab label="Leads" value="leads" />
                <Tab label="Notification Tracker" value="notifications" />
            </Tabs>

            {/* --- Notification Tracker View --- */}
            {activeTab === 'notifications' && (
                <NotificationTracker clientKey={user?.role === 'super-admin' ? activeClientKey : undefined} />
            )}

            {/* --- Leads View --- */}
            {activeTab === 'leads' && <>
            {/* --- Summary Bar --- */}
            <MuiPaper elevation={2} sx={{ mb: 3, p: 2, background: '#6a6d70ff' }}>
                <Grid container spacing={2} justifyContent="space-between">
                    <Grid item xs={6} sm={2}><Typography variant="subtitle2">Total</Typography><Typography variant="h5">{summary.total}</Typography></Grid>
                    <Grid item xs={6} sm={2}><Typography variant="subtitle2">Today</Typography><Typography variant="h5">{summary.todayCount}</Typography></Grid>
                    <Grid item xs={6} sm={2}><Typography variant="subtitle2">Follow-up</Typography><Typography variant="h5">{summary.followUp}</Typography></Grid>
                    <Grid item xs={6} sm={2}><Typography variant="subtitle2">Appointments</Typography><Typography variant="h5">{summary.appointments}</Typography></Grid>
                    <Grid item xs={6} sm={2}><Typography variant="subtitle2">Closed</Typography><Typography variant="h5">{summary.closed}</Typography></Grid>
                </Grid>
            </MuiPaper>

            {/* --- Filters --- */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    label="Search by Name or Phone"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    size="small"
                    sx={{ minWidth: 220 }}
                />
                <TextField
                    select
                    label="Status"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 180 }}
                >
                    <MenuItem value="">All Statuses</MenuItem>
                    {ALL_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
                <Box sx={{ flex: 1 }} />
                <Button variant="contained" onClick={handleAdd}>Add Lead</Button>
            </Box>

            {/* --- Table --- */}
            <PixelEyeTable
                rows={filteredLeads}
                onEdit={handleEdit}
                onDelete={handleOpenConfirmAlertModal}
                onStatusChange={(id, value) => updateMutation.mutate({ id, status: value })}
                onDayChange={(id, day, value) => updateMutation.mutate({
                    id,
                    [day]: value,
                })}
                onFollowUpDateChange={(id, value) =>
                    updateMutation.mutate({
                        id,
                        follow_up_date: value,
                    })
                }
            />

            <Popup
                open={openConfirmAlertModal}
                onClose={() => {
                    setOpenConfirmAlertModal(false);
                    setSelectedLeadId(null);
                }}
                showOnClose={false}
            >
                <ConfirmAlert
                    title="Are you sure you want to delete this lead?"
                    onConfirm={handleDelete}
                    onCancel={() => {
                        setOpenConfirmAlertModal(false);
                        setSelectedLeadId(null);
                    }}
                    isLoading={deleteMutation.isLoading}
                />
            </Popup>

            {/* --- Dialog --- */}
            </>}
            <Dialog open={formOpen} onClose={handleFormCancel} maxWidth="sm" fullWidth>
                <DialogTitle>{editRow ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
                <DialogContent>
                    <PixelEyeForm
                        initialValues={editRow || undefined}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        isLoading={createMutation.isLoading || updateMutation.isLoading}
                    />
                </DialogContent>
            </Dialog>
        </Paper>
    );
};

export default PixelEyeSection;
