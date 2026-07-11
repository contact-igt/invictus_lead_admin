import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import type { VlsMactMasterClassRegistration } from 'types/vlsMactMasterClass';
import {
  formatCaptured,
  formatVlsMactAmount,
  formatVlsMactDate,
  formatVlsMactDateTime,
} from './vlsMactMasterClassUtils';

interface VlsMactMasterClassTableProps {
  rows: VlsMactMasterClassRegistration[];
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
  hasFilters: boolean;
  onPaginationChange: (page: number, limit: number) => void;
  onView: (registration: VlsMactMasterClassRegistration) => void;
  onEdit: (registration: VlsMactMasterClassRegistration) => void;
  onDelete: (registration: VlsMactMasterClassRegistration) => void;
}

interface TableRow extends VlsMactMasterClassRegistration {
  serial_number: number;
}

const VlsMactMasterClassTable = ({
  rows,
  page,
  limit,
  total,
  isLoading,
  hasFilters,
  onPaginationChange,
  onView,
  onEdit,
  onDelete,
}: VlsMactMasterClassTableProps) => {
  const tableRows: TableRow[] = rows.map((row, index) => ({
    ...row,
    serial_number: (page - 1) * limit + index + 1,
  }));

  const columns: GridColDef<TableRow>[] = [
    { field: 'serial_number', headerName: 'S.No', width: 72, sortable: false, align: 'center', headerAlign: 'center' },
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 180,
      flex: 1.2,
      renderCell: (params) => <Typography variant="body2" fontWeight={650} noWrap title={params.row.name}>{params.row.name || '-'}</Typography>,
    },
    {
      field: 'mobile',
      headerName: 'Mobile',
      minWidth: 135,
      flex: 0.85,
      renderCell: (params) => <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>{params.row.mobile || '-'}</Typography>,
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 190,
      flex: 1.2,
      renderCell: (params) => <Typography variant="body2" noWrap title={params.row.email || ''}>{params.row.email || '-'}</Typography>,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      minWidth: 120,
      flex: 0.75,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => <Typography variant="body2" fontWeight={650}>{formatVlsMactAmount(params.row.amount)}</Typography>,
    },
    {
      field: 'registered_date',
      headerName: 'Registered Date',
      minWidth: 150,
      flex: 0.9,
      renderCell: (params) => <Typography variant="body2" color="text.secondary">{formatVlsMactDate(params.row.registered_date)}</Typography>,
    },
    {
      field: 'programm_date',
      headerName: 'Programme Date',
      minWidth: 150,
      flex: 0.9,
      renderCell: (params) => <Typography variant="body2" color="text.secondary">{formatVlsMactDate(params.row.programm_date)}</Typography>,
    },
    {
      field: 'payment_status',
      headerName: 'Payment Status',
      minWidth: 145,
      flex: 0.9,
      renderCell: (params) => params.row.payment_status ? <Chip label={params.row.payment_status} size="small" variant="outlined" /> : '-',
    },
    {
      field: 'captured',
      headerName: 'Captured',
      minWidth: 115,
      flex: 0.65,
      renderCell: (params) => (
        <Chip
          label={formatCaptured(params.row.captured)}
          size="small"
          color={params.row.captured ? 'success' : 'default'}
          variant={params.row.captured === null || params.row.captured === undefined ? 'outlined' : 'filled'}
        />
      ),
    },
    {
      field: 'page_name',
      headerName: 'Page Name',
      minWidth: 160,
      flex: 1,
      renderCell: (params) => <Typography variant="body2" noWrap title={params.row.page_name || ''}>{params.row.page_name || '-'}</Typography>,
    },
    {
      field: 'utm_source',
      headerName: 'UTM Source',
      minWidth: 130,
      flex: 0.8,
      renderCell: (params) => params.row.utm_source ? <Chip label={params.row.utm_source} size="small" color="info" variant="outlined" /> : '-',
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      minWidth: 185,
      flex: 1,
      renderCell: (params) => <Typography variant="body2" color="text.secondary">{formatVlsMactDateTime(params.row.created_at)}</Typography>,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 132,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="View"><IconButton size="small" onClick={() => onView(params.row)} aria-label="View registration"><IconifyIcon icon="mdi:eye-outline" width={19} /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(params.row)} aria-label="Edit registration"><IconifyIcon icon="mdi:pencil-outline" width={19} /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(params.row)} aria-label="Delete registration"><IconifyIcon icon="mdi:trash-can-outline" width={19} /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ];

  const handlePaginationChange = (model: GridPaginationModel) => {
    onPaginationChange(model.page + 1, model.pageSize);
  };

  if (!isLoading && rows.length === 0) {
    return (
      <Paper variant="outlined" sx={{ width: '100%', minWidth: 0, py: 8, px: 3, textAlign: 'center', borderRadius: 3 }}>
        <IconifyIcon icon="hugeicons:inbox" width={34} color="text.secondary" />
        <Typography variant="h6" mt={1.5}>
          {hasFilters ? 'No registrations match the selected filters.' : 'No MACT Master Class registrations yet'}
        </Typography>
        {!hasFilters && <Typography variant="body2" color="text.secondary" mt={0.5}>Add the first registration to get started.</Typography>}
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto' }}>
      <DataGrid
        autoHeight
        rows={tableRows}
        columns={columns}
        loading={isLoading}
        rowCount={total}
        paginationMode="server"
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[10, 20, 50, 100]}
        disableColumnMenu
        disableRowSelectionOnClick
        rowHeight={62}
        sx={{
          width: '100%',
          minWidth: 1480,
          border: 0,
          minHeight: 360,
          '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
          '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': { outline: 'none' },
        }}
      />
    </Box>
  );
};

export default VlsMactMasterClassTable;
