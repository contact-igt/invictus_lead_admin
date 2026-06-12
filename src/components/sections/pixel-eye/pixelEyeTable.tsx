import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useState, useMemo } from 'react';
import { ALL_STATUSES, getDayDropdownStatuses, isStatusTerminalForDays } from './pixelEyeStatuses';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import PixelEyeDatePicker from './PixelEyeDatePicker';
import PixelEyeField from './PixelEyeField';
import DataGridFooter from 'components/common/DataGridFooter';

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
  fontWeight: 800,
  fontSize: '0.68rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  cursor: 'pointer',
  borderRadius: '8px',
  minHeight: 28,
  px: 0.5,
  '& .MuiChip-label': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    px: 1,
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

const getStatusChipStyles = (status: string, mode: 'dark' | 'light') => {
  const s = String(status || '').trim();
  if (!s) {
    return {
      bgcolor: mode === 'dark' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(100, 116, 139, 0.05)',
      color: mode === 'dark' ? '#94A3B8' : '#64748B',
      border: `1px solid ${mode === 'dark' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.12)'}`,
    };
  }

  const lower = s.toLowerCase();

  // Success / Completed
  if (
    [
      'appointment fixed',
      'visited',
      'walk-in',
      'appointment post-appointment',
      'handled',
      'completed',
    ].some((v) => lower.includes(v))
  ) {
    return {
      bgcolor: mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : '#E8F5E9',
      color: mode === 'dark' ? '#86EFAC' : '#1B5E20',
      border: `1px solid ${mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : '#A5D6A7'}`,
    };
  }

  // Pending / Follow-up / Warning
  if (
    [
      'follow-up',
      'hot follow-up',
      'will call later',
      'rescheduling',
      'doctor time',
      'want to speak with doctor',
      'enquiry',
      'rescheduled',
    ].some((v) => lower.includes(v))
  ) {
    return {
      bgcolor: mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#FFF3E0',
      color: mode === 'dark' ? '#FDE047' : '#E65100',
      border: `1px solid ${mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#FFB74D'}`,
    };
  }

  // Neutral / Busy / Contact
  if (
    [
      'busy',
      'not answering',
      'switched off',
      'missed call',
      'on another call',
      'dnd',
      'dnp 1',
      'dnp 2',
      'dnp 3',
      'dnp 4',
      'not speaking',
      'disconnecting',
      'not in network',
      'incoming call not available',
    ].some((v) => lower.includes(v))
  ) {
    return {
      bgcolor: mode === 'dark' ? 'rgba(56, 189, 248, 0.1)' : '#E0F7FA',
      color: mode === 'dark' ? '#7DD3FC' : '#006064',
      border: `1px solid ${mode === 'dark' ? 'rgba(56, 189, 248, 0.2)' : '#4DD0E1'}`,
    };
  }

  // Terminal / Closed / Uninterested
  if (
    [
      'closed',
      'cancelled',
      'not interested',
      'not willing',
      'wrong number',
      'wrongly dialed',
      'fraud call',
      'number not in service',
      'long distance',
      'going to other hospital',
      'searching for specific hospital',
      'others',
    ].some((v) => lower.includes(v))
  ) {
    return {
      bgcolor: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#FFEBEE',
      color: mode === 'dark' ? '#FCA5A5' : '#C62828',
      border: `1px solid ${mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#EF9A9A'}`,
    };
  }

  return {
    bgcolor: mode === 'dark' ? 'rgba(168, 85, 247, 0.1)' : '#F3E5F5',
    color: mode === 'dark' ? '#D8B4FE' : '#4A148C',
    border: `1px solid ${mode === 'dark' ? 'rgba(168, 85, 247, 0.2)' : '#CE93D8'}`,
  };
};

const StatusCell = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const { mode } = useColorMode();
  const [editing, setEditing] = useState(false);
  const chipStyles = getStatusChipStyles(value, mode);

  return editing ? (
    <span
      data-stop-row-click="true"
      onClick={stopRowNavigation}
      onMouseDown={stopRowNavigation}
      onPointerDown={stopRowNavigation}
    >
      <PixelEyeField
        select
        compact
        value={value || ''}
        onClick={stopRowNavigation}
        onMouseDown={stopRowNavigation}
        onPointerDown={stopRowNavigation}
        onChange={(e) => {
          const newValue = e.target.value;
          if (newValue !== value) {
            onChange(newValue as string);
          }
          setEditing(false);
        }}
        autoFocus
        size="small"
        sx={{ minWidth: 140 }}
      >
        {ALL_STATUSES.map((status) => (
          <MenuItem key={status} value={status} onClick={stopRowNavigation}>
            {status}
          </MenuItem>
        ))}
      </PixelEyeField>
    </span>
  ) : (
    <Chip
      data-stop-row-click="true"
      label={value || 'Set Status'}
      size="small"
      onClick={(event) => {
        stopRowNavigation(event);
        setEditing(true);
      }}
      onMouseDown={stopRowNavigation}
      onPointerDown={stopRowNavigation}
      sx={{
        ...editableChipSx,
        ...chipStyles,
        borderRadius: 2,
        px: 1,
      }}
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
  const { mode } = useColorMode();
  const [editing, setEditing] = useState(false);
  const statuses = getDayDropdownStatuses(dayNumber);
  const chipStyles = getStatusChipStyles(value, mode);

  if (disabled) {
    return (
      <Chip
        data-stop-row-click="true"
        label={value || '---'}
        size="small"
        onClick={stopRowNavigation}
        onMouseDown={stopRowNavigation}
        onPointerDown={stopRowNavigation}
        sx={{
          ...editableChipSx,
          borderRadius: 2,
          cursor: 'not-allowed',
          opacity: 0.4,
          bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          color: 'text.disabled',
          border: '1px dashed currentColor',
        }}
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
      <PixelEyeField
        select
        compact
        value={value || ''}
        onClick={stopRowNavigation}
        onMouseDown={stopRowNavigation}
        onPointerDown={stopRowNavigation}
        onChange={(e) => {
          const newValue = e.target.value as string;
          if (newValue !== value) {
            onChange(newValue);
          }
          setEditing(false);
        }}
        autoFocus
        size="small"
        sx={{ minWidth: 140 }}
      >
        {statuses.map((status) => (
          <MenuItem key={status} value={status} onClick={stopRowNavigation}>
            {status}
          </MenuItem>
        ))}
      </PixelEyeField>
    </span>
  ) : (
    <Chip
      data-stop-row-click="true"
      label={value || `Set Day ${dayNumber}`}
      size="small"
      onClick={(event) => {
        stopRowNavigation(event);
        setEditing(true);
      }}
      onMouseDown={stopRowNavigation}
      onPointerDown={stopRowNavigation}
      sx={{
        ...editableChipSx,
        ...chipStyles,
        borderRadius: 2,
        px: 1,
      }}
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

const FollowUpDateCell = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (val: string) => void;
}) => {
  const { mode } = useColorMode();
  const [editing, setEditing] = useState(false);
  const normalized = normalizeDateValue(value);

  return editing ? (
    <span
      data-stop-row-click="true"
      onClick={stopRowNavigation}
      onMouseDown={stopRowNavigation}
      onPointerDown={stopRowNavigation}
    >
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          maxWidth: '100%',
          display: 'flex',
          alignItems: 'center',
          overflow: 'visible',
        }}
      >
        <PixelEyeDatePicker
          value={normalized}
          compact
          fullWidth
          sx={{
            width: '100%',
            minWidth: 0,
            maxWidth: '100%',
          }}
          onChange={(newValue) => {
            if (newValue !== normalized) {
              onChange(newValue);
            }
            setEditing(false);
          }}
        />
      </Box>
    </span>
  ) : (
    <Chip
      data-stop-row-click="true"
      label={normalized || 'Set Follow-up'}
      size="small"
      onClick={(event) => {
        stopRowNavigation(event);
        setEditing(true);
      }}
      onMouseDown={stopRowNavigation}
      onPointerDown={stopRowNavigation}
      sx={{
        ...editableChipSx,
        borderRadius: 2,
        px: 1,
        bgcolor: normalized
          ? mode === 'dark'
            ? 'rgba(34, 197, 94, 0.08)'
            : '#E8F5E9'
          : mode === 'dark'
            ? 'rgba(148, 163, 184, 0.08)'
            : 'rgba(100, 116, 139, 0.05)',
        color: normalized
          ? mode === 'dark'
            ? '#86EFAC'
            : '#156A45'
          : mode === 'dark'
            ? '#94A3B8'
            : '#64748B',
        border: normalized
          ? `1px solid ${mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : '#A5D6A7'}`
          : `1px dashed ${mode === 'dark' ? 'rgba(148, 163, 184, 0.25)' : 'rgba(100, 116, 139, 0.2)'}`,
      }}
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
  { field: 'date', headerName: 'Date', minWidth: 118, flex: 0.75 },
  {
    field: 'customer_name',
    headerName: 'Customer',
    minWidth: 210,
    flex: 1.25,
    renderCell: (params) => <CustomerCell row={params.row} />,
  },
  { field: 'phone_number', headerName: 'Phone', minWidth: 140, flex: 0.9 },
  { field: 'agent_name', headerName: 'Agent', minWidth: 145, flex: 0.9 },
  {
    field: 'follow_up_date',
    headerName: 'Follow-up Date',
    minWidth: 168,
    flex: 1.05,
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
    minWidth: 122,
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
  const { mode } = useColorMode();
  const handleRowClick = (params: any, event: any) => {
    if (shouldIgnoreRowClick(event)) return;
    onRowClick?.(params.row as PixelEyeRow);
  };

  const columns = useMemo(
    () => getColumns(onEdit, onDelete, onStatusChange, onDayChange, onFollowUpDateChange),
    [onEdit, onDelete, onStatusChange, onDayChange, onFollowUpDateChange],
  );

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[10, 20, 50]}
        rowHeight={68}
        columnHeaderHeight={54}
        disableRowSelectionOnClick
        onRowClick={handleRowClick}
        slots={{ pagination: DataGridFooter }}
        sx={{
          minWidth: 1620,
          border: 0,
          backgroundColor: 'transparent',
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
            {
              outline: 'none',
            },
          '& .MuiDataGrid-cell:focus-visible, & .MuiDataGrid-columnHeader:focus-visible': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(80, 120, 100, 0.22)' : '#E2E8F0'}`,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 800,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            color: mode === 'dark' ? '#9FB0A6' : '#64748B',
            letterSpacing: '0.05em',
          },
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            py: 1,
            outline: 'none !important',
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(80, 120, 100, 0.18)' : '#F1F5F9'}`,
            color: mode === 'dark' ? '#EAF7EE' : '#334155',
          },
          '& .MuiDataGrid-row': {
            cursor: onRowClick ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor:
                mode === 'dark' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(31, 107, 64, 0.03)',
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${mode === 'dark' ? 'rgba(80, 120, 100, 0.22)' : '#E2E8F0'}`,
            color: mode === 'dark' ? '#9FB0A6' : '#64748B',
            backgroundColor: 'transparent',
          },
        }}
      />
    </Box>
  );
};

export default PixelEyeTable;
