import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useState, useMemo } from 'react';
import { ALL_STATUSES, getDayDropdownStatuses, isStatusTerminalForDays } from './pixelEyeStatuses';
import IconifyIcon from 'components/base/IconifyIcon';

const DAY_FIELDS = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'] as const;

export interface PixelEyeRow {
    id: number;
    date?: string;
    time?: string;
    call_id?: string;
    customer_name?: string;
    phone_number?: string;
    agent_name?: string;
    source?: string;
    type_of_enquiry?: string;
    follow_up_date?: string;
    status?: string;
    day_1?: string;
    day_2?: string;
    day_3?: string;
    day_4?: string;
    day_5?: string;
    createdAt?: string;
    updatedAt?: string;
    created_at?: string;
    updated_at?: string;
}

interface PixelEyeTableProps {
    rows: PixelEyeRow[];
    onEdit: (row: PixelEyeRow) => void;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, value: string) => void;
    onDayChange: (id: number, day: string, value: string) => void;
    onFollowUpDateChange: (id: number, value: string) => void;
}



const StatusCell = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
    const [editing, setEditing] = useState(false);
    return editing ? (
        <Select
            value={value || ''}
            onClick={(e) => e.stopPropagation()}
            onChange={e => {
                const newValue = e.target.value;
                if (newValue !== value) {
                    onChange(newValue);
                }
                setEditing(false);
            }}
            onClose={() => setEditing(false)}
            autoFocus
            size="medium"
            sx={{ minWidth: 120, minHeight: 48 }}
        >
            {ALL_STATUSES.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
        </Select>
    ) : (
        <span style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => setEditing(true)}>
            {value || 'Set Status'}
        </span>
    );
};

const DayCell = ({
    value,
    onChange,
    dayNumber,
    disabled,
}: {
    value: string;
    onChange: (val: string) => void;
    dayNumber: number;
    disabled?: boolean;
}) => {
    const [editing, setEditing] = useState(false);
    const statuses = getDayDropdownStatuses(dayNumber);
    console.log("DayCell rendered - dayNumber:", dayNumber, "statuses:", statuses);

    if (disabled) {
        return <span style={{ color: '#aaa', cursor: 'not-allowed' }}>{value || '—'}</span>;
    }

    return editing ? (
        <Select
            value={value || ''}
            onClick={(e) => e.stopPropagation()}
            onChange={e => {
                const newValue = e.target.value;
                if (newValue !== value) {
                    onChange(newValue);
                }
                setEditing(false);
            }}
            onClose={() => setEditing(false)}
            autoFocus
            size="medium"
            sx={{ minWidth: 120, minHeight: 48 }}
        >
            {statuses.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
        </Select>
    ) : (
        <span style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => setEditing(true)}>
            {value || 'Set Day'}
        </span>
    );
};

const normalizeDateValue = (value?: string) => {
    if (!value) return '';
    const text = String(value).trim();

    const lowered = text.toLowerCase();
    if (['---', '-', 'na', 'n/a', 'null', 'undefined'].includes(lowered)) {
        return '';
    }

    const short = text.length >= 10 ? text.slice(0, 10) : text;
    if (/^\d{4}-\d{2}-\d{2}$/.test(short)) {
        return short;
    }

    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
    }

    return '';
};

const FollowUpDateCell = ({ value, onChange }: { value?: string; onChange: (val: string) => void }) => {
    const [editing, setEditing] = useState(false);
    const normalized = normalizeDateValue(value);

    return editing ? (
        <TextField
            type="date"
            value={normalized}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
                const newValue = e.target.value;
                if (newValue !== normalized) {
                    onChange(newValue);
                }
                setEditing(false);
            }}
            onBlur={() => setEditing(false)}
            autoFocus
            size="small"
        />
    ) : (
        <span style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => setEditing(true)}>
            {normalized || 'Set Follow-up'}
        </span>
    );
};



const getColumns = (
    onEdit: any,
    onDelete: any,
    onStatusChange: any,
    onDayChange: any,
    onFollowUpDateChange: any,
): GridColDef[] => [
        { field: 'date', headerName: 'Date', flex: 1 },
        { field: 'time', headerName: 'Time', flex: 1 },
        { field: 'call_id', headerName: 'Call ID', flex: 1 },
        { field: 'customer_name', headerName: 'Customer Name', flex: 1 },
        { field: 'phone_number', headerName: 'Phone Number', flex: 1 },
        { field: 'agent_name', headerName: 'Agent Name', flex: 1 },
        {
            field: 'follow_up_date',
            headerName: 'Follow-up Date',
            flex: 1,
            renderCell: (params) => (
                <FollowUpDateCell
                    value={params.value}
                    onChange={val => onFollowUpDateChange(params.row.id, val)}
                />
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            renderCell: (params) => (
                <StatusCell value={params.value} onChange={val => onStatusChange(params.row.id, val)} />
            ),
        },
        ...DAY_FIELDS.map((day, idx) => ({
            field: day,
            headerName: day.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            flex: 1,
            renderCell: (params: any) => {
                const dayNumber = idx + 1;
                let isParentTerminal = false;

                if (isStatusTerminalForDays(params.row.status)) {
                    isParentTerminal = true;
                }

                for (let i = 0; i < idx; i++) {
                    const priorDayField = DAY_FIELDS[i];
                    const priorValue = params.row[priorDayField];
                    if (isStatusTerminalForDays(priorValue)) {
                        isParentTerminal = true;
                    }
                }

                return (
                    <DayCell
                        value={params.value}
                        onChange={val => onDayChange(params.row.id, day, val)}
                        dayNumber={dayNumber}
                        disabled={isParentTerminal}
                    />
                );
            },
        })),
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => onEdit(params.row)} size="small">
                        <IconifyIcon icon="mingcute:edit-2-line" width={18} />
                    </IconButton>
                    <IconButton onClick={() => onDelete(params.row.id)} size="small" color="error">
                        <IconifyIcon icon="mingcute:delete-2-line" width={18} />
                    </IconButton>
                </>
            ),
            flex: 1,
        },
    ];




const PixelEyeTable = ({ rows, onEdit, onDelete, onStatusChange, onDayChange, onFollowUpDateChange }: PixelEyeTableProps) => {
    const columns = useMemo(
        () => getColumns(onEdit, onDelete, onStatusChange, onDayChange, onFollowUpDateChange),
        [onEdit, onDelete, onStatusChange, onDayChange, onFollowUpDateChange],
    );

    return (
        <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
        />
    );
};

export default PixelEyeTable;
