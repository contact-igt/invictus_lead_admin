import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useState, useMemo } from 'react';
import {
  FORTY_EIGHT_HR_STATUSES,
  NO_REMINDER_STATUSES,
  SUCCESS_STATUSES,
  TERMINATION_STATUSES,
  THIRTY_MIN_STATUSES_TO_EXCLUDE,
  TWENTY_FOUR_HR_STATUSES,
  canClientSetInitialFollowUpDate,
  getDayDropdownStatuses,
  getNextStructuredDayNumber,
  isLeadFollowUpLocked,
} from './pixelEyeStatuses';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import PixelEyeField from './PixelEyeField';
import DataGridFooter from 'components/common/DataGridFooter';

const DAY_FIELDS = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'] as const;

const toLowercaseSet = (values: readonly string[]) =>
  new Set(values.map((value) => value.toLowerCase()));

const SUCCESS_STATUS_SET = toLowercaseSet(SUCCESS_STATUSES);
const TERMINAL_STATUS_SET = toLowercaseSet(TERMINATION_STATUSES);
const FOLLOW_UP_STATUS_SET = toLowercaseSet([
  ...TWENTY_FOUR_HR_STATUSES,
  ...FORTY_EIGHT_HR_STATUSES,
]);
const CONTACT_STATUS_SET = toLowercaseSet(THIRTY_MIN_STATUSES_TO_EXCLUDE);
const NO_REMINDER_STATUS_SET = toLowercaseSet(NO_REMINDER_STATUSES);

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
  <Box
    sx={{
      minWidth: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 0.75,
      py: 0.5,
      overflow: 'hidden',
    }}
  >
    <Typography
      variant="body2"
      fontWeight={700}
      noWrap
      title={row.customer_name || ''}
      sx={{ maxWidth: '100%', lineHeight: 1.25 }}
    >
      {row.customer_name || '---'}
    </Typography>
    {row.needs_manual_day_outcome ? (
      <Chip
        data-stop-row-click="true"
        size="small"
        label={row.normal_lead_attention_label || 'Repeat Caller - Update Outcome'}
        sx={{
          height: 22,
          maxWidth: '100%',
          flexShrink: 0,
          fontSize: '0.62rem',
          fontWeight: 900,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#92400E',
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          '& .MuiChip-label': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            px: 0.8,
          },
        }}
      />
    ) : null}
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
  notes?: string | null;
  source?: string;
  type_of_enquiry?: string;
  follow_up_date?: string;
  followup_state?: string | null;
  reminder_permanently_closed?: boolean | null;
  normal_lead_attention_state?: string | null;
  normal_lead_attention_label?: string | null;
  needs_manual_day_outcome?: boolean | null;
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
  onNotes: (row: PixelEyeRow) => void;
  onDelete?: (row: PixelEyeRow) => void;
  onStatusChange: (id: number, value: string) => void;
  onDayChange: (id: number, day: string, value: string) => void;
  onFollowUpDateChange: (id: number, value: string) => void;
  userRole?: string;
  onRowClick?: (row: PixelEyeRow) => void;
  selectedRowIds?: number[];
  onSelectedRowIdsChange?: (ids: number[]) => void;
}

const normalizeSelectionIds = (model: any): number[] => {
  const rawIds = Array.isArray(model) ? model : Array.from(model?.ids || []);
  return rawIds.map((id) => Number(id)).filter((id) => Number.isFinite(id));
};

const getStatusChipStyles = (status: string, mode: 'dark' | 'light') => {
  const normalized = String(status || '').trim().toLowerCase();
  if (!normalized) {
    return {
      bgcolor: mode === 'dark' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(100, 116, 139, 0.05)',
      color: mode === 'dark' ? '#94A3B8' : '#64748B',
      border: `1px solid ${mode === 'dark' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.12)'}`,
    };
  }

  if (SUCCESS_STATUS_SET.has(normalized)) {
    return {
      bgcolor: mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : '#E8F5E9',
      color: mode === 'dark' ? '#86EFAC' : '#1B5E20',
      border: `1px solid ${mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : '#A5D6A7'}`,
    };
  }

  if (TERMINAL_STATUS_SET.has(normalized)) {
    return {
      bgcolor: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#FFEBEE',
      color: mode === 'dark' ? '#FCA5A5' : '#C62828',
      border: `1px solid ${mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#EF9A9A'}`,
    };
  }

  if (FOLLOW_UP_STATUS_SET.has(normalized)) {
    return {
      bgcolor: mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#FFF3E0',
      color: mode === 'dark' ? '#FDE047' : '#E65100',
      border: `1px solid ${mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#FFB74D'}`,
    };
  }

  if (CONTACT_STATUS_SET.has(normalized) || /^dnp [1-4]$/.test(normalized)) {
    return {
      bgcolor: mode === 'dark' ? 'rgba(56, 189, 248, 0.1)' : '#E0F7FA',
      color: mode === 'dark' ? '#7DD3FC' : '#006064',
      border: `1px solid ${mode === 'dark' ? 'rgba(56, 189, 248, 0.2)' : '#4DD0E1'}`,
    };
  }

  if (NO_REMINDER_STATUS_SET.has(normalized)) {
    return {
      bgcolor: mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : '#F1F5F9',
      color: mode === 'dark' ? '#CBD5E1' : '#475569',
      border: `1px solid ${mode === 'dark' ? 'rgba(148, 163, 184, 0.2)' : '#CBD5E1'}`,
    };
  }

  return {
    bgcolor: mode === 'dark' ? 'rgba(168, 85, 247, 0.1)' : '#F3E5F5',
    color: mode === 'dark' ? '#D8B4FE' : '#4A148C',
    border: `1px solid ${mode === 'dark' ? 'rgba(168, 85, 247, 0.2)' : '#CE93D8'}`,
  };
};
const StatusCell = ({ value }: { value: string }) => {
  const { mode } = useColorMode();
  const chipStyles = getStatusChipStyles(value, mode);

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
        ...chipStyles,
        borderRadius: 2,
        px: 1,
        cursor: 'default',
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
          ...chipStyles,
          borderRadius: 2,
          cursor: 'not-allowed',
          opacity: value ? 0.82 : 0.45,
          border: value ? chipStyles.border : '1px dashed currentColor',
        }}
      />
    );
  }

  return editing ? (
    <ClickAwayListener mouseEvent="onMouseDown" onClickAway={() => setEditing(false)}>
      <Box
        data-stop-row-click="true"
        onClick={stopRowNavigation}
        onMouseDown={stopRowNavigation}
        onPointerDown={stopRowNavigation}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}
      >
        <PixelEyeField
          select
          fullWidth
          value={value || ''}
          onClick={stopRowNavigation}
          onMouseDown={stopRowNavigation}
          onPointerDown={stopRowNavigation}
          SelectProps={{
            defaultOpen: true,
            onClose: () => setEditing(false),
          }}
          onChange={(e) => {
            const newValue = e.target.value as string;
            if (newValue !== value) {
              onChange(newValue);
            }
            setEditing(false);
          }}
          autoFocus
          size="small"
          sx={{
            minWidth: 120,
            '& .MuiInputBase-root': {
              height: 32,
              fontSize: '0.8125rem',
            }
          }}
        >
          {statuses.map((status) => (
            <MenuItem key={status} value={status} onClick={stopRowNavigation}>
              {status}
            </MenuItem>
          ))}
        </PixelEyeField>
      </Box>
    </ClickAwayListener>
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
  disabled,
}: {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) => {
  const { mode } = useColorMode();
  const [editing, setEditing] = useState(false);
  const normalized = normalizeDateValue(value);

  if (!onChange || disabled) {
    return (
      <Chip
        data-stop-row-click="true"
        label={normalized || 'No Follow-up'}
        size="small"
        onClick={stopRowNavigation}
        onMouseDown={stopRowNavigation}
        onPointerDown={stopRowNavigation}
        sx={{
          ...editableChipSx,
          borderRadius: 2,
          px: 1,
          cursor: disabled ? 'not-allowed' : 'default',
          opacity: disabled ? 0.55 : 1,
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
  }

  return editing ? (
    <ClickAwayListener mouseEvent="onMouseDown" onClickAway={() => setEditing(false)}>
      <Box
        data-stop-row-click="true"
        onClick={stopRowNavigation}
        onMouseDown={stopRowNavigation}
        onPointerDown={stopRowNavigation}
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <PixelEyeField
          fullWidth
          type="date"
          value={normalized}
          onClick={stopRowNavigation}
          onMouseDown={stopRowNavigation}
          onPointerDown={stopRowNavigation}
          onChange={(event) => {
            const newValue = String(event.target.value || '').trim();
            if (newValue && newValue !== normalized) {
              onChange(newValue);
            }
            setEditing(false);
          }}
          onBlur={() => setEditing(false)}
          autoFocus
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{
            minWidth: 150,
            '& .MuiInputBase-root': {
              height: 32,
              fontSize: '0.8125rem',
            },
          }}
        />
      </Box>
    </ClickAwayListener>
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
        cursor: 'pointer',
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
  onNotes: (row: PixelEyeRow) => void,
  onDelete: ((row: PixelEyeRow) => void) | undefined,
  onDayChange: any,
  onFollowUpDateChange: (id: number, value: string) => void,
  userRole: string,
): GridColDef[] => [
    { field: 'date', headerName: 'Date', minWidth: 118, flex: 0.75 },
    {
      field: 'customer_name',
      headerName: 'Customer',
      minWidth: 210,
      flex: 1.25,
      renderCell: (params) => <CustomerCell row={params.row as PixelEyeRow} />,
    },
    { field: 'phone_number', headerName: 'Phone', minWidth: 140, flex: 0.9 },
    { field: 'agent_name', headerName: 'Agent', minWidth: 145, flex: 0.9 },
    {
      field: 'follow_up_date',
      headerName: 'Follow-up Date',
      minWidth: 168,
      flex: 1.05,
      renderCell: (params) => {
        const row = params.row as PixelEyeRow;
        const isClient = userRole === 'client';
        const leadLocked = isLeadFollowUpLocked(row);
        const canEdit =
          !leadLocked &&
          (userRole === 'super-admin' ||
            userRole === 'admin' ||
            (isClient && canClientSetInitialFollowUpDate(row)));

        return (
          <FollowUpDateCell
            value={params.value}
            onChange={canEdit ? (value) => onFollowUpDateChange(row.id, value) : undefined}
            disabled={leadLocked || !canEdit}
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 160,
      flex: 1,
      renderCell: (params) => (
        <StatusCell value={params.value} />
      ),
    },
    ...DAY_FIELDS.map((day, idx) => ({
      field: day,
      headerName: day.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      minWidth: 122,
      flex: 0.85,
      renderCell: (params: any) => {
        const dayNumber = idx + 1;
        const row = params.row as PixelEyeRow;
        const leadLocked = isLeadFollowUpLocked(row);
        const nextStructuredDayNumber = getNextStructuredDayNumber({
          status: row.status,
          followup_state: row.followup_state,
          reminder_permanently_closed: row.reminder_permanently_closed,
          day_1: row.day_1,
          day_2: row.day_2,
          day_3: row.day_3,
          day_4: row.day_4,
          day_5: row.day_5,
        });
        const isAdminEdit = userRole === 'super-admin' || userRole === 'admin';
        const isClientEdit =
          userRole === 'client' && !leadLocked && nextStructuredDayNumber === dayNumber;
        const isDisabled = isAdminEdit ? leadLocked : !isClientEdit;

        return (
          <DayCell
            value={params.value}
            onChange={(val) => onDayChange(params.row.id, day, val)}
            dayNumber={dayNumber}
            disabled={isDisabled}
          />
        );
      },
    })),
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row as PixelEyeRow;
        const normalizedNotes = String(row.notes || '').trim();

        return (
          <>
            <Tooltip
              title={normalizedNotes || 'Add customer notes'}
              placement="top"
              arrow
            >
              <IconButton
                data-stop-row-click="true"
                onClick={(event) => {
                  event.preventDefault();
                  stopRowNavigation(event);
                  onNotes(row);
                }}
                onMouseDown={stopRowNavigation}
                onPointerDown={stopRowNavigation}
                size="small"
                color={normalizedNotes ? 'success' : 'default'}
              >
                <IconifyIcon
                  icon={normalizedNotes ? 'mdi:note-text-outline' : 'mdi:note-plus-outline'}
                  width={18}
                />
              </IconButton>
            </Tooltip>
            <IconButton
              data-stop-row-click="true"
              onClick={(event) => {
                event.preventDefault();
                stopRowNavigation(event);
                onEdit(row);
              }}
              onMouseDown={stopRowNavigation}
              onPointerDown={stopRowNavigation}
              size="small"
            >
              <IconifyIcon icon="mingcute:edit-2-line" width={18} />
            </IconButton>
            {onDelete && (
              <IconButton
                data-stop-row-click="true"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDelete(row);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                size="small"
                color="error"
              >
                <IconifyIcon
                  icon="mingcute:delete-2-line"
                  width={18}
                  sx={{ pointerEvents: 'none' }}
                />
              </IconButton>
            )}
          </>
        );
      },
      minWidth: 140,
      flex: 0.8,
    },
  ];

const PixelEyeTable = ({
  rows,
  onEdit,
  onNotes,
  onDelete,
  onDayChange,
  onFollowUpDateChange,
  userRole = '',
  onRowClick,
  selectedRowIds = [],
  onSelectedRowIdsChange,
}: PixelEyeTableProps) => {
  const { mode } = useColorMode();
  const handleRowClick = (params: any, event: any) => {
    if (shouldIgnoreRowClick(event)) return;
    onRowClick?.(params.row as PixelEyeRow);
  };

  const columns = useMemo(
    () => getColumns(onEdit, onNotes, onDelete, onDayChange, onFollowUpDateChange, userRole),
    [onEdit, onNotes, onDelete, onDayChange, onFollowUpDateChange, userRole],
  );

  return (
    <DataGrid
      autoHeight
      rows={rows}
      columns={columns}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      pageSizeOptions={[10, 20, 50]}
      rowHeight={88}
      columnHeaderHeight={54}
      checkboxSelection={Boolean(onSelectedRowIdsChange)}
      rowSelectionModel={selectedRowIds}
      onRowSelectionModelChange={(model) => onSelectedRowIdsChange?.(normalizeSelectionIds(model))}
      disableRowSelectionOnClick
      onRowClick={handleRowClick}
      slots={{ pagination: DataGridFooter }}
      sx={{
        minWidth: 1850,
        border: 0,
        backgroundColor: 'transparent',
        '& ::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '& ::-webkit-scrollbar-track': {
          backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.02)',
        },
        '& ::-webkit-scrollbar-thumb': {
          backgroundColor: mode === 'dark' ? '#1f6b40' : '#cbd5e1',
          borderRadius: '10px',
          '&:hover': {
            backgroundColor: mode === 'dark' ? '#227a4b' : '#94a3b8',
          },
        },
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
  );
};

export default PixelEyeTable;


