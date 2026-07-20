import { useEffect } from 'react';
import { DataGrid, GridColDef, useGridApiRef, GridApi } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import DataGridFooter from 'components/common/DataGridFooter';
import ActionMenu from 'components/sections/ActionMenu';
import { ClientRecord } from 'components/hooks/useClientQuery';
import dayjs from 'dayjs';
import { resolveClientModuleKey } from 'utils/clientModuleResolver';

interface ClientTableProps {
  rows: ClientRecord[];
  searchText: string;
  isLoading: boolean;
  onEdit: (row: ClientRecord) => void;
  onView: (row: ClientRecord) => void;
  onDelete: (id: number | string) => void;
}

const ClientTable = ({ rows, searchText, isLoading, onEdit, onView, onDelete }: ClientTableProps) => {
  const apiRef = useGridApiRef<GridApi>();

  useEffect(() => {
    if (apiRef.current?.setQuickFilterValues) {
      apiRef.current.setQuickFilterValues(searchText.trim().split(/\s+/).filter(Boolean));
    }
  }, [apiRef, searchText]);

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'name',
      headerName: 'Client Name',
      flex: 1.5,
      minWidth: 180,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'client_key',
      headerName: 'Client Key',
      flex: 1.2,
      minWidth: 160,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.value ? (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            sx={{ fontFamily: 'monospace', fontSize: '0.78rem', borderRadius: 1.5 }}
          />
        ) : (
          <span style={{ color: 'var(--mui-palette-text-disabled, rgba(0,0,0,0.38))' }}>-</span>
        ),
    },
    {
      field: 'module',
      headerName: 'Module',
      flex: 1,
      minWidth: 130,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_value, row) => resolveClientModuleKey(row.client_key),
      renderCell: (params) =>
        params.value ? (
          <Chip
            label={String(params.value).toUpperCase()}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.72rem', borderRadius: 1.5 }}
          />
        ) : (
          <span style={{ color: 'var(--mui-palette-text-disabled, rgba(0,0,0,0.38))' }}>-</span>
        ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      flex: 1,
      minWidth: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.value ? dayjs(params.value).format('DD MMM YYYY') : '-',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <ActionMenu
          onEdit={() => onEdit(params.row as ClientRecord)}
          onView={() => onView(params.row as ClientRecord)}
          onRemove={() => onDelete(params.row.id)}
        />
      ),
    },
  ];

  return (
    <DataGrid
      apiRef={apiRef}
      rows={rows}
      columns={columns}
      loading={isLoading}
      rowHeight={60}
      autoHeight
      pageSizeOptions={[5, 10, 20]}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      disableColumnMenu
      disableRowSelectionOnClick
      slots={{ pagination: DataGridFooter }}
      sx={{
        height: 'auto',
        border: 0,
        '& .MuiDataGrid-columnHeaderTitle': {
          overflow: 'visible',
          textOverflow: 'clip',
          whiteSpace: 'normal',
        },
        '& .MuiDataGrid-columnHeaders': {
          borderBottomColor: 'divider',
          backgroundColor: 'rgba(21, 106, 69, 0.04)',
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: 'rgba(21, 106, 69, 0.04)',
        },
        '& .MuiDataGrid-cell': {
          display: 'flex',
          alignItems: 'center',
          px: 1,
        },
        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
          outline: 'none',
        },
      }}
    />
  );
};

export default ClientTable;



