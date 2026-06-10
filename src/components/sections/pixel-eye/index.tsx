
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
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';

const EXPORT_COLUMNS: Array<{ key: keyof PixelEyeRow; label: string; width: number }> = [
    { key: 'date', label: 'Date', width: 54 },
    { key: 'time', label: 'Time', width: 42 },
    { key: 'customer_name', label: 'Customer Name', width: 82 },
    { key: 'phone_number', label: 'Phone', width: 64 },
    { key: 'agent_name', label: 'Agent', width: 58 },
    { key: 'status', label: 'Status', width: 70 },
    { key: 'follow_up_date', label: 'Follow Up', width: 56 },
    { key: 'source', label: 'Source', width: 45 },
    { key: 'type_of_enquiry', label: 'Enquiry', width: 68 },
    { key: 'call_id', label: 'Call ID', width: 70 },
    { key: 'createdAt', label: 'Created At', width: 68 },
    { key: 'updatedAt', label: 'Updated At', width: 68 },
];

const normalizeDateForCompare = (value?: string | null): string => {
    const text = String(value || '').trim();
    if (!text) return '';

    const directDate = text.match(/^\d{4}-\d{2}-\d{2}/);
    if (directDate) return directDate[0];

    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return '';

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getLeadBusinessDate = (lead: PixelEyeRow): string =>
    normalizeDateForCompare(lead.date) ||
    normalizeDateForCompare(lead.createdAt) ||
    normalizeDateForCompare(lead.created_at);

const getLeadValue = (lead: PixelEyeRow, key: keyof PixelEyeRow): string => {
    if (key === 'createdAt') {
        return String(lead.createdAt || lead.created_at || '');
    }
    if (key === 'updatedAt') {
        return String(lead.updatedAt || lead.updated_at || '');
    }
    return String(lead[key] ?? '');
};

const escapeCsvValue = (value: string): string => {
    const text = value.replace(/\r?\n|\r/g, ' ').trim();
    return /[",]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const buildCsv = (rows: PixelEyeRow[]): string => {
    const header = EXPORT_COLUMNS.map((column) => escapeCsvValue(column.label)).join(',');
    const body = rows.map((row) =>
        EXPORT_COLUMNS.map((column) => escapeCsvValue(getLeadValue(row, column.key))).join(','),
    );
    return [header, ...body].join('\n');
};

const escapePdfText = (value: string): string =>
    value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\r?\n|\r/g, ' ');

const truncateText = (value: string, maxChars: number): string => {
    const text = String(value || '').trim();
    if (text.length <= maxChars) return text;
    return `${text.slice(0, Math.max(maxChars - 3, 0))}...`;
};

const addPdfText = (commands: string[], x: number, y: number, text: string, fontSize = 7) => {
    commands.push(`BT /F1 ${fontSize} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
};

const buildSimplePdf = (rows: PixelEyeRow[], fromDate: string, toDate: string): Blob => {
    const pageWidth = 842;
    const pageHeight = 595;
    const margin = 24;
    const rowHeight = 16;
    const topY = pageHeight - 82;
    const minY = 34;
    const pages: string[] = [];
    let commands: string[] = [];
    let y = topY;

    const drawHeader = () => {
        commands = [];
        addPdfText(commands, margin, pageHeight - 30, 'PixelEye Lead Report', 14);
        addPdfText(commands, margin, pageHeight - 48, `Date range: ${fromDate} to ${toDate}`, 8);
        addPdfText(commands, margin, pageHeight - 62, `Generated: ${new Date().toLocaleString()}`, 8);
        let x = margin;
        EXPORT_COLUMNS.forEach((column) => {
            addPdfText(commands, x, pageHeight - 78, column.label, 6.5);
            x += column.width;
        });
        commands.push(`${margin} ${pageHeight - 84} m ${pageWidth - margin} ${pageHeight - 84} l S`);
        y = topY;
    };

    const finishPage = () => {
        pages.push(commands.join('\n'));
    };

    drawHeader();
    rows.forEach((row) => {
        if (y < minY) {
            finishPage();
            drawHeader();
        }

        let x = margin;
        EXPORT_COLUMNS.forEach((column) => {
            const maxChars = Math.max(Math.floor(column.width / 4.2), 6);
            const value = truncateText(getLeadValue(row, column.key), maxChars);
            addPdfText(commands, x, y, value || '-', 6);
            x += column.width;
        });
        y -= rowHeight;
    });
    finishPage();

    const objects: string[] = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`,
    ];

    pages.forEach((content, index) => {
        const pageObjectId = 3 + index * 2;
        const contentObjectId = pageObjectId + 1;
        objects.push(
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObjectId} 0 R >>`,
        );
        objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    });

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(pdf.length);
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
        pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: 'application/pdf' });
};


const PixelEyeSection = () => {
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
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
    const [exportFromDate, setExportFromDate] = useState('');
    const [exportToDate, setExportToDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);

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

    const buildLeadPayload = (values: PixelEyeFormValues): PixelEyeFormValues => {
        const payload = { ...values };
        if (!String(payload.follow_up_date || '').trim()) {
            delete payload.follow_up_date;
        }
        return payload;
    };

    const handleFormSubmit = (values: PixelEyeFormValues) => {
        const leadPayload = buildLeadPayload(values);

        if (editRow && editRow.id) {
            // Close only after the API call succeeds so the user sees errors if it fails.
            updateMutation.mutate(
                { id: editRow.id, ...leadPayload } as UpdatePixelEyePayload,
                { onSuccess: closeForm },
            );
        } else {
            const payload: CreatePixelEyePayload = activeClientKey
                ? { ...leadPayload, _client_key: activeClientKey }
                : leadPayload;
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

    const getExportRows = (): PixelEyeRow[] | null => {
        if (!exportFromDate || !exportToDate) {
            enqueueSnackbar('Please select date range', { variant: 'warning' });
            return null;
        }

        if (exportFromDate > exportToDate) {
            enqueueSnackbar('From Date cannot be after To Date', { variant: 'warning' });
            return null;
        }

        const rows = filteredLeads.filter((lead: PixelEyeRow) => {
            const leadDate = getLeadBusinessDate(lead);
            return Boolean(leadDate) && leadDate >= exportFromDate && leadDate <= exportToDate;
        });

        if (rows.length === 0) {
            enqueueSnackbar('No leads found for selected date range', { variant: 'info' });
            return null;
        }

        return rows;
    };

    const exportFileBaseName = `pixel-eye-leads-${exportFromDate}-to-${exportToDate}`;

    const handleExportCsv = () => {
        const rows = getExportRows();
        if (!rows) return;

        setIsExporting(true);
        try {
            const csv = buildCsv(rows);
            const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
            saveAs(blob, `${exportFileBaseName}.csv`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportPdf = () => {
        const rows = getExportRows();
        if (!rows) return;

        setIsExporting(true);
        try {
            const blob = buildSimplePdf(rows, exportFromDate, exportToDate);
            saveAs(blob, `${exportFileBaseName}.pdf`);
        } finally {
            setIsExporting(false);
        }
    };

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
                <TextField
                    label="From Date"
                    type="date"
                    value={exportFromDate}
                    onChange={e => setExportFromDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="To Date"
                    type="date"
                    value={exportToDate}
                    onChange={e => setExportToDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />
                <Button
                    variant="outlined"
                    onClick={handleExportCsv}
                    disabled={isLoading || isExporting}
                >
                    Export CSV
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleExportPdf}
                    disabled={isLoading || isExporting}
                >
                    Export PDF
                </Button>
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
