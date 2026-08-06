import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import type { VlsConsumerProtectionLawMasterClassRegistration } from 'types/vlsConsumerProtectionLawMasterClass';
import {
  formatCaptured,
  formatVlsConsumerProtectionAmount,
  formatVlsConsumerProtectionDate,
  formatVlsConsumerProtectionDateTime,
} from './vlsConsumerProtectionLawMasterClassUtils';

interface VlsConsumerProtectionLawMasterClassTableProps {
  rows: VlsConsumerProtectionLawMasterClassRegistration[];
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
  hasFilters: boolean;
  onPaginationChange: (page: number, limit: number) => void;
  onView: (registration: VlsConsumerProtectionLawMasterClassRegistration) => void;
  onEdit: (registration: VlsConsumerProtectionLawMasterClassRegistration) => void;
  onDelete: (registration: VlsConsumerProtectionLawMasterClassRegistration) => void;
}

interface TableRow extends VlsConsumerProtectionLawMasterClassRegistration {
  serial_number: number;
}

const VlsConsumerProtectionLawMasterClassTable = ({
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
}: VlsConsumerProtectionLawMasterClassTableProps) => {
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
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={650} noWrap title={params.row.name}>
          {params.row.name || '-'}
        </Typography>
      ),
    },
    {
      field: 'mobile',
      headerName: 'Mobile',
      minWidth: 135,
      flex: 0.85,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {params.row.mobile || '-'}
        </Typography>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 190,
      flex: 1.2,
      renderCell: (params) => (
        <Typography variant="body2" noWrap title={params.row.email || ''}>
          {params.row.email || '-'}
        </Typography>
      ),
    },
    {
      field: 'city',
      headerName: 'City',
      minWidth: 130,
      flex: 0.85,
      renderCell: (params) => (
        <Typography variant="body2" noWrap title={params.row.city || ''}>
          {params.row.city || '-'}
        </Typography>
      ),
    },
    {
      field: 'profession',
      headerName: 'Profession',
      minWidth: 140,
      flex: 0.9,
      renderCell: (params) => (
        <Typography variant="body2" noWrap title={params.row.profession || ''}>
          {params.row.profession || '-'}
        </Typography>
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      minWidth: 120,
      flex: 0.75,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={650}>
          {formatVlsConsumerProtectionAmount(params.row.amount)}
        </Typography>
      ),
    },
    {
      field: 'registered_date',
      headerName: 'Registered Date',
      minWidth: 195,
      flex: 1.5,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatVlsConsumerProtectionDate(params.row.registered_date)}
        </Typography>
      ),
    },
    {
      field: 'programm_date',
      headerName: 'Programme Date',
      minWidth: 150,
      flex: 1.1,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatVlsConsumerProtectionDate(params.row.programm_date)}
        </Typography>
      ),
    },
    {
      field: 'payment_status',
      headerName: 'Payment Status',
      minWidth: 145,
      flex: 0.9,
      renderCell: (params) => {
        const status = params.row.payment_status;
        if (!status) return '-';
        const color =
          status === 'paid'
            ? 'success'
            : status === 'attempted'
            ? 'warning'
            : status === 'waitlist'
            ? 'info'
            : status === 'failed' || status === 'cancelled'
            ? 'error'
            : 'default';
        return <Chip label={status} size="small" color={color} variant="outlined" />;
      },
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
      renderCell: (params) => (
        <Typography variant="body2" noWrap title={params.row.page_name || ''}>
          {params.row.page_name || '-'}
        </Typography>
      ),
    },
    {
      field: 'utm_source',
      headerName: 'UTM Source',
      minWidth: 130,
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
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatVlsConsumerProtectionDateTime(params.row.created_at)}
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
            <IconButton size="small" onClick={() => onView(params.row)} aria-label="View registration">
              <IconifyIcon icon="mdi:eye-outline" width={19} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(params.row)} aria-label="Edit registration">
              <IconifyIcon icon="mdi:pencil-outline" width={19} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => onDelete(params.row)} aria-label="Delete registration">
              <IconifyIcon icon="mdi:trash-can-outline" width={19} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    onPaginationChange(model.page + 1, model.pageSize);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <DataGrid
        rows={tableRows}
        columns={columns}
        rowCount={total}
        loading={isLoading}
        paginationMode="server"
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[10, 20, 50, 100]}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
          },
        }}
        slots={{
          noRowsOverlay: () => (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" p={3}>
              <Typography variant="subtitle1" color="text.secondary">
                {hasFilters ? 'No registrations found matching your filters.' : 'No registrations available yet.'}
              </Typography>
            </Box>
          ),
        }}
      />
    </Paper>
  );
};

export default VlsConsumerProtectionLawMasterClassTable;
