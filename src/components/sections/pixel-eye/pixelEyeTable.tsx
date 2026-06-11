import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useState, useMemo } from 'react';
import { ALL_STATUSES, getDayDropdownStatuses, isStatusTerminalForDays } from './pixelEyeStatuses';
import IconifyIcon from 'components/base/IconifyIcon';

const DAY_FIELDS = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'] as const;

const stopRowNavigation = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
};

const shouldIgnoreRowClick = (event: any) => {
    const target = event?.target as HTMLElement | null;
    return Boolean(
        target?.closest(
            'button,a,input,select,textarea,[role="button"],[role="menuitem"],[data-stop-row-click="true"],.MuiSelect-select,.MuiMenuItem-root',
        ),
    );
};

const editableChipSx = {
    maxWidth: '100%',
    fontWeight: 700,
    fontSize: '0.72rem',
    cursor: 'pointer',
    '& .MuiChip-label': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};

const CustomerCell = ({ row }: { row: PixelEyeRow }) => (
    <Box sx={{ minWidth: 0, width: '100%' }}>
        <Typography variant="body2" fontWeight={700} noWrap title={row.customer_name || ''}>
            {row.customer_name || '---'}
        </Typography>
        {/* {row.call_id && (
            <Typography variant="caption" color="text.secondary" noWrap title={row.call_id}>
                Call ID: {row.call_id}
            </Typography>
        )} */}
    </Box>
);

export interface PixelEyeRow {
    id: number;
    client_id?: number | null;
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
    createdAt?: string | null;
    updatedAt?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

interface PixelEyeTableProps {
    rows: PixelEyeRow[];
    onEdit: (row: PixelEyeRow) => void;
    onDelete: (row: PixelEyeRow) => void;
    onStatusChange: (id: number, value: string) => void;
    onDayChange: (id: number, day: string, value: string) => void;
    onFollowUpDateChange: (id: number, value: string) => void;
    onRowClick?: (row: PixelEyeRow) => void;
}

const StatusCell = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
    const [editing, setEditing] = useState(false);

    return editing ? (
        <span
            data-stop-row-click="true"
            onClick={stopRowNavigation}
            onMouseDown={stopRowNavigation}
            onPointerDown={stopRowNavigation}
        >
            <Select
                value={value || ''}
                onClick={stopRowNavigation}
                onMouseDown={stopRowNavigation}
                onPointerDown={stopRowNavigation}
                onChange={(e) => {
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
                {ALL_STATUSES.map((status) => (
                    <MenuItem key={status} value={status} onClick={stopRowNavigation}>
                        {status}
                    </MenuItem>
                ))}
            </Select>
        </span>
    ) : (
        <Chip
            data-stop-row-click="true"
            label={value || 'Set Status'}
            size="small"
            color={value ? 'primary' : 'default'}
            variant={value ? 'filled' : 'outlined'}
            onClick={(event) => {
                stopRowNavigation(event);
                setEditing(true);
            }}
            onMouseDown={stopRowNavigation}
            onPointerDown={stopRowNavigation}
            sx={editableChipSx}
        />
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

    if (disabled) {
        return (
            <Chip
                data-stop-row-click="true"
                label={value || '---'}
                size="small"
                variant="outlined"
                onClick={stopRowNavigation}
                onMouseDown={stopRowNavigation}
                onPointerDown={stopRowNavigation}
                sx={{ ...editableChipSx, cursor: 'not-allowed', opacity: 0.65 }}
            />
        );
    }

    return editing ? (
        <span
            data-stop-row-click="true"
            onClick={stopRowNavigation}
            onMouseDown={stopRowNavigation}
            onPointerDown={stopRowNavigation}
        >
            <Select
                value={value || ''}
                onClick={stopRowNavigation}
                onMouseDown={stopRowNavigation}
                onPointerDown={stopRowNavigation}
                onChange={(e) => {
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
                {statuses.map((status) => (
                    <MenuItem key={status} value={status} onClick={stopRowNavigation}>
                        {status}
                    </MenuItem>
                ))}
            </Select>
        </span>
    ) : (
        <Chip
            data-stop-row-click="true"
            label={value || `Set Day ${dayNumber}`}
            size="small"
            color={value ? 'primary' : 'default'}
            variant={value ? 'filled' : 'outlined'}
            onClick={(event) => {
                stopRowNavigation(event);
                setEditing(true);
            }}
            onMouseDown={stopRowNavigation}
            onPointerDown={stopRowNavigation}
            sx={editableChipSx}
        />
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
        <span
            data-stop-row-click="true"
            onClick={stopRowNavigation}
            onMouseDown={stopRowNavigation}
            onPointerDown={stopRowNavigation}
        >
            <TextField
                type="date"
                value={normalized}
                onClick={stopRowNavigation}
                onMouseDown={stopRowNavigation}
                onPointerDown={stopRowNavigation}
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
        </span>
    ) : (
        <Chip
            data-stop-row-click="true"
            label={normalized || 'Set Follow-up'}
            size="small"
            color={normalized ? 'primary' : 'default'}
            variant={normalized ? 'filled' : 'outlined'}
            onClick={(event) => {
                stopRowNavigation(event);
                setEditing(true);
            }}
            onMouseDown={stopRowNavigation}
            onPointerDown={stopRowNavigation}
            sx={editableChipSx}
        />
    );
};

const getColumns = (
    onEdit: any,
    onDelete: any,
    onStatusChange: any,
    onDayChange: any,
    onFollowUpDateChange: any,
): GridColDef[] => [
    { field: 'date', headerName: 'Date', minWidth: 120, flex: 0.75 },
    {
        field: 'customer_name',
        headerName: 'Customer',
        minWidth: 190,
        flex: 1.25,
        renderCell: (params) => <CustomerCell row={params.row} />,
    },
    { field: 'phone_number', headerName: 'Phone', minWidth: 140, flex: 0.9 },
    { field: 'agent_name', headerName: 'Agent', minWidth: 145, flex: 0.9 },
    {
        field: 'follow_up_date',
        headerName: 'Follow-up Date',
        minWidth: 190,
        flex: 1.15,
        renderCell: (params) => (
            <FollowUpDateCell
                value={params.value}
                onChange={(val) => onFollowUpDateChange(params.row.id, val)}
            />
        ),
    },
    {
        field: 'status',
        headerName: 'Status',
        minWidth: 160,
        flex: 1,
        renderCell: (params) => (
            <StatusCell value={params.value} onChange={(val) => onStatusChange(params.row.id, val)} />
        ),
    },
    ...DAY_FIELDS.map((day, idx) => ({
        field: day,
        headerName: day.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        minWidth: 135,
        flex: 0.85,
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
                    onChange={(val) => onDayChange(params.row.id, day, val)}
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
                <IconButton
                    data-stop-row-click="true"
                    onClick={(event) => {
                        event.preventDefault();
                        stopRowNavigation(event);
                        onEdit(params.row);
                    }}
                    onMouseDown={stopRowNavigation}
                    onPointerDown={stopRowNavigation}
                    size="small"
                >
                    <IconifyIcon icon="mingcute:edit-2-line" width={18} />
                </IconButton>
                <IconButton
                    data-stop-row-click="true"
                    onClick={(event) => {
                        event.preventDefault();
                        stopRowNavigation(event);
                        onDelete(params.row);
                    }}
                    onMouseDown={stopRowNavigation}
                    onPointerDown={stopRowNavigation}
                    size="small"
                    color="error"
                >
                    <IconifyIcon icon="mingcute:delete-2-line" width={18} />
                </IconButton>
            </>
        ),
        minWidth: 95,
        flex: 0.55,
    },
];

const PixelEyeTable = ({
    rows,
    onEdit,
    onDelete,
    onStatusChange,
    onDayChange,
    onFollowUpDateChange,
    onRowClick,
}: PixelEyeTableProps) => {
    const handleRowClick = (params: any, event: any) => {
        if (shouldIgnoreRowClick(event)) return;
        onRowClick?.(params.row as PixelEyeRow);
    };

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
            rowHeight={72}
            columnHeaderHeight={54}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            sx={{
                border: 0,
                '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                },
                '& .MuiDataGrid-cell': {
                    display: 'flex',
                    alignItems: 'center',
                    py: 1,
                    outline: 'none !important',
                },
                '& .MuiDataGrid-row': {
                    cursor: onRowClick ? 'pointer' : 'default',
                },
            }}
        />
    );
};

export default PixelEyeTable;
