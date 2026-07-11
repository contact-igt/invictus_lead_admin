import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
} from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import type { AaravEyeCareLead } from 'types/aaravEyeCare';
import { formatAaravDateTime } from './aaravEyeCareUtils';

interface AaravEyeCareTableProps {
  rows: AaravEyeCareLead[];
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
  hasFilters: boolean;
  onPaginationChange: (page: number, limit: number) => void;
  onView: (lead: AaravEyeCareLead) => void;
  onEdit: (lead: AaravEyeCareLead) => void;
  onDelete: (lead: AaravEyeCareLead) => void;
}

interface AaravEyeCareTableRow extends AaravEyeCareLead {
  serial_number: number;
}

const AaravEyeCareTable = ({
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
}: AaravEyeCareTableProps) => {
  const tableRows: AaravEyeCareTableRow[] = rows.map((row, index) => ({
    ...row,
    serial_number: (page - 1) * limit + index + 1,
  }));

  const columns: GridColDef<AaravEyeCareTableRow>[] = [
    {
      field: 'serial_number',
      headerName: 'S.No',
      width: 72,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 180,
      flex: 1.3,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={650} noWrap title={params.row.name}>
          {params.row.name || '-'}
        </Typography>
      ),
    },
    {
      field: 'mobile_number',
      headerName: 'Mobile Number',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {params.row.mobile_number || '-'}
        </Typography>
      ),
    },
    {
      field: 'service',
      headerName: 'Service',
      minWidth: 140,
      flex: 0.9,
      renderCell: (params) =>
        params.row.service ? (
          <Chip label={params.row.service} size="small" variant="outlined" />
        ) : (
          '-'
        ),
    },
    {
      field: 'ip_address',
      headerName: 'IP Address',
      minWidth: 145,
      flex: 0.9,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {params.row.ip_address || '-'}
        </Typography>
      ),
    },
    {
      field: 'utm_source',
      headerName: 'UTM Source',
      minWidth: 125,
      flex: 0.8,
      renderCell: (params) =>
        params.row.utm_source ? (
          <Chip label={params.row.utm_source} size="small" color="info" variant="outlined" />
        ) : (
          '-'
        ),
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      minWidth: 185,
      flex: 1.05,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatAaravDateTime(params.row.created_at)}
        </Typography>
      ),
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
          <Tooltip title="View">
            <IconButton size="small" onClick={() => onView(params.row)} aria-label="View lead">
              <IconifyIcon icon="mdi:eye-outline" width={19} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(params.row)} aria-label="Edit lead">
              <IconifyIcon icon="mdi:pencil-outline" width={19} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(params.row)}
              aria-label="Delete lead"
            >
              <IconifyIcon icon="mdi:trash-can-outline" width={19} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handlePaginationChange = (model: GridPaginationModel) => {
    onPaginationChange(model.page + 1, model.pageSize);
  };

  if (!isLoading && rows.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{ width: '100%', minWidth: 0, py: 8, px: 3, textAlign: 'center', borderRadius: 3 }}
      >
        <IconifyIcon icon="hugeicons:inbox" width={34} color="text.secondary" />
        <Typography variant="h6" mt={1.5}>
          {hasFilters ? 'No leads match the selected filters.' : 'No Aarav Eye Care leads yet'}
        </Typography>
        {!hasFilters && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Add the first lead to get started.
          </Typography>
        )}
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
          minWidth: 0,
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

export default AaravEyeCareTable;
