import { useState } from 'react';
import { Box, Chip, Drawer, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import PageTitle from 'components/common/PageTitle';
import PageLoader from 'components/loader/PageLoader';
import { useApiLog, useApiLogs, useApiLogSummary } from 'hooks/useApiLogsQuery';
import type { ApiLog, ApiLogFilters } from 'services/apiLogs.service';

const statusColor = (status: number): 'success' | 'warning' | 'error' =>
  status >= 500 ? 'error' : status >= 400 ? 'warning' : 'success';

const ApiLogsPage = () => {
  const [filters, setFilters] = useState<ApiLogFilters>({ page: 1, limit: 25 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const logsQuery = useApiLogs(filters);
  const summaryQuery = useApiLogSummary(filters);
  const detailQuery = useApiLog(selectedId);
  const rows: ApiLog[] = logsQuery.data?.data || [];
  const pagination = logsQuery.data?.pagination || { page: 1, limit: 25, total: 0 };
  const summary = summaryQuery.data?.data;

  const columns: GridColDef<ApiLog>[] = [
    { field: 'created_at', headerName: 'Time', minWidth: 170, flex: 1, valueFormatter: (value) => new Date(value).toLocaleString() },
    { field: 'method', headerName: 'Method', width: 95, renderCell: (params) => <Chip size="small" label={params.value} variant="outlined" /> },
    { field: 'path', headerName: 'API Path', minWidth: 250, flex: 1.8 },
    { field: 'status_code', headerName: 'Status', width: 100, renderCell: (params) => <Chip size="small" label={params.value} color={statusColor(params.value)} /> },
    { field: 'duration_ms', headerName: 'Duration', width: 105, valueFormatter: (value) => `${value} ms` },
    { field: 'user_email', headerName: 'User', minWidth: 180, flex: 1, valueFormatter: (value) => value || 'Anonymous' },
  ];

  const updateFilter = (key: keyof ApiLogFilters, value: string | number | undefined) =>
    setFilters((current) => ({ ...current, [key]: value || undefined, page: 1 }));

  const handlePagination = (model: GridPaginationModel) =>
    setFilters((current) => ({ ...current, page: model.page + 1, limit: model.pageSize }));

  if (logsQuery.isLoading) return <PageLoader />;

  return (
    <Box sx={{ width: 1, minWidth: 0, pb: 4 }}>
      <Stack direction="column" spacing={2.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <PageTitle title="API Logs" isSearchEnable={false} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5 }}>
              Monitor API activity, performance, and failures across the platform.
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
        {[
          ['Total Requests', summary?.total_requests ?? 0],
          ['Failed Requests', summary?.failed_requests ?? 0],
          ['Average Duration', `${summary?.average_duration_ms ?? 0} ms`],
        ].map(([label, value]) => (
          <Paper key={String(label)} variant="outlined" sx={{ p: 2.25, minHeight: 108, borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.75 }}>{value}</Typography>
          </Paper>
        ))}
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}>
          <Stack direction="column" spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={700}>Filter API activity</Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'minmax(220px, 2fr) repeat(2, minmax(150px, 1fr))' },
                gap: 1.5,
              }}
            >
              <TextField fullWidth size="small" label="Search API path" placeholder="e.g. /api/v1/users" value={filters.path || ''} onChange={(event) => updateFilter('path', event.target.value)} />
              <TextField fullWidth select size="small" label="Method" value={filters.method || ''} onChange={(event) => updateFilter('method', event.target.value)}>
            <MenuItem value="">All methods</MenuItem>
            {['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].map((method) => <MenuItem key={method} value={method}>{method}</MenuItem>)}
              </TextField>
              <TextField fullWidth select size="small" label="Status" value={filters.status || ''} onChange={(event) => updateFilter('status', event.target.value)}>
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="200">200</MenuItem><MenuItem value="201">201</MenuItem><MenuItem value="400">400</MenuItem><MenuItem value="401">401</MenuItem><MenuItem value="403">403</MenuItem><MenuItem value="404">404</MenuItem><MenuItem value="500">500</MenuItem>
              </TextField>
            </Box>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ width: 1, minWidth: 0, borderRadius: 3, overflow: 'hidden' }}>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            rowCount={pagination.total}
            loading={logsQuery.isFetching}
            paginationMode="server"
            paginationModel={{ page: pagination.page - 1, pageSize: pagination.limit }}
            onPaginationModelChange={handlePagination}
            pageSizeOptions={[25, 50, 100]}
            onRowClick={(params) => setSelectedId(params.row.id)}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              '& .MuiDataGrid-row': { cursor: 'pointer' },
              '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': { outline: 'none' },
            }}
          />
        </Paper>
      </Stack>

      <Drawer anchor="right" open={selectedId !== null} onClose={() => setSelectedId(null)} PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, p: 3 } }}>
        <Typography variant="h6" fontWeight={700}>API Log Details</Typography>
        {detailQuery.data?.data ? (
          <Box component="pre" sx={{ mt: 2, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 12 }}>
            {JSON.stringify(detailQuery.data.data, null, 2)}
          </Box>
        ) : <PageLoader />}
      </Drawer>
    </Box>
  );
};

export default ApiLogsPage;
