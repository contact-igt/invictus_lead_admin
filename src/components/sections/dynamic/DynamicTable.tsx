import { useState, useMemo, useEffect } from 'react';
import { DataGrid, GridColDef, useGridApiRef, GridApi } from '@mui/x-data-grid';
import { Chip, Box, Typography, Menu, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import DataGridFooter from 'components/common/DataGridFooter';
import ActionMenu from 'components/sections/ActionMenu';
import dayjs from 'dayjs';
import { TableConfig, ColumnConfig } from 'config/clients';
import { getDayDropdownStatuses, isStatusTerminalForDays } from 'components/sections/pixel-eye/pixelEyeStatuses';

interface DynamicTableProps {
  config: TableConfig;
  data: any[];
  searchText: string;
  isLoading: boolean;
  onInlineUpdate: (id: number | string, field: string, value: string) => void;
  onEdit: (id: number | string) => void;
  onView: (id: number | string) => void;
  onDelete: (id: number | string) => void;
}

const InlineEnumCell = ({
  value,
  rowId,
  field,
  header,
  options,
  onUpdate,
  disabled,
}: {
  value: string | null | undefined;
  rowId: number | string;
  field: string;
  header: string;
  options: string[];
  onUpdate: (id: number | string, field: string, value: string) => void;
  disabled?: boolean;
}) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  if (disabled) {
    return <span style={{ color: '#aaa', cursor: 'not-allowed' }}>{value || '—'}</span>;
  }

  return (
    <>
      <Chip
        label={value || `Set ${header}`}
        size="small"
        color={value ? 'primary' : 'default'}
        variant={value ? 'filled' : 'outlined'}
        onClick={(e) => {
          e.stopPropagation();
          setAnchor(e.currentTarget);
        }}
        sx={{
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.72rem',
          maxWidth: 170,
        }}
      />
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 320,
              width: 240,
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            selected={option === value}
            onClick={() => {
              onUpdate(rowId, field, option);
              setAnchor(null);
            }}
            sx={{ fontSize: '0.85rem' }}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const normalizeInlineDate = (value: unknown) => {
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

  const parsed = dayjs(text);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
};

const InlineDateCell = ({
  value,
  rowId,
  field,
  header,
  onUpdate,
}: {
  value: string | null | undefined;
  rowId: number | string;
  field: string;
  header: string;
  onUpdate: (id: number | string, field: string, value: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const normalized = normalizeInlineDate(value);

  if (editing) {
    return (
      <TextField
        type="date"
        value={normalized}
        size="small"
        autoFocus
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const newValue = e.target.value;
          if (newValue !== normalized) {
            onUpdate(rowId, field, newValue);
          }
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
      />
    );
  }

  return (
    <Chip
      label={normalized ? dayjs(normalized).format('DD MMM YYYY') : `Set ${header}`}
      size="small"
      color={normalized ? 'primary' : 'default'}
      variant={normalized ? 'filled' : 'outlined'}
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      sx={{
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.72rem',
        maxWidth: 170,
      }}
    />
  );
};

const DynamicTable = ({ config, data, searchText, isLoading, onInlineUpdate, onEdit, onView, onDelete }: DynamicTableProps) => {
  const apiRef = useGridApiRef<GridApi>();

  useEffect(() => {
    if (apiRef.current?.setQuickFilterValues) {
      apiRef.current.setQuickFilterValues(searchText.split(/\b\W+\b/).filter(Boolean));
    }
  }, [searchText]);

  const columns: GridColDef[] = useMemo(() => {
    const cols = config.columns.map((col: ColumnConfig) => {
      const baseCol: GridColDef = {
        field: col.field,
        headerName: col.header,
        flex: col.flex || 1,
        minWidth: col.minWidth || 150,
        align: 'center',
        headerAlign: 'center',
      };

      // Handle custom renderers based on field type
      if ((col.type === 'status_chip' || col.type === 'select') && col.options?.length) {
        baseCol.renderCell = (params) => {
          let options = col.options || [];
          const isDayField = /^day_[1-5]$/.test(col.field);
          if (isDayField) {
            const dayNumber = parseInt(col.field.replace('day_', ''), 10);
            options = getDayDropdownStatuses(dayNumber);
          }

          let isParentTerminal = false;
          if (isDayField) {
            const dayIdx = parseInt(col.field.replace('day_', ''), 10) - 1;
            const DAY_FIELDS = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'];

            if (isStatusTerminalForDays(params.row.status)) {
              isParentTerminal = true;
            }
            for (let i = 0; i < dayIdx; i++) {
              const priorDayField = DAY_FIELDS[i];
              const priorValue = params.row[priorDayField];
              if (isStatusTerminalForDays(priorValue)) {
                isParentTerminal = true;
              }
            }
          }

          return (
            <InlineEnumCell
              value={params.value}
              rowId={params.row.id}
              field={col.field}
              header={col.header}
              options={options}
              onUpdate={onInlineUpdate}
              disabled={isParentTerminal}
            />
          );
        };
      } else if (col.type === 'date') {
        if (col.field === 'follow_up_date') {
          baseCol.renderCell = (params) => (
            <InlineDateCell
              value={params.value}
              rowId={params.row.id}
              field={col.field}
              header={col.header}
              onUpdate={onInlineUpdate}
            />
          );
        } else {
          baseCol.renderCell = (params) => (
            params.value ? dayjs(params.value).format('DD MMM YYYY') : '---'
          );
        }
      } else if (col.type === 'time') {
        baseCol.renderCell = (params) => (
          <Typography variant="body2">{params.value ? String(params.value).slice(0, 5) : '---'}</Typography>
        );
      } else if (col.type === 'textarea') {
        baseCol.renderCell = (params) => (
          <Typography
            variant="body2"
            title={params.value || ''}
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}
          >
            {params.value || '---'}
          </Typography>
        );
      } else {
        baseCol.renderCell = (params) => (
          <Typography variant="body2">{params.value || '---'}</Typography>
        );
      }

      return baseCol;
    });

    // Append Action column dynamically
    cols.push({
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <ActionMenu
          onView={() => onView(params.row.id)}
          onEdit={() => onEdit(params.row.id)}
          onRemove={() => onDelete(params.row.id)}
        />
      )
    });

    return cols;
  }, [config.columns, onEdit, onView, onDelete, onInlineUpdate]);

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        apiRef={apiRef}
        rows={data || []}
        columns={columns}
        loading={isLoading}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        rowHeight={60}
        disableColumnMenu
        disableRowSelectionOnClick
        slots={{ pagination: DataGridFooter }}
        sx={{
          border: 0,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'background.default',
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            overflow: 'visible',
            textOverflow: 'clip',
            whiteSpace: 'normal',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            color: 'text.secondary',
          },
          '& .MuiDataGrid-row': {
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          },
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid',
            borderColor: 'divider',
          }
        }}
      />
    </Box>
  );
};

export default DynamicTable;
