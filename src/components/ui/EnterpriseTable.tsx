import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
  Typography,
} from '@mui/material';
import StatusChip, { EnterpriseStatus } from './StatusChip';
import Button from './Button';

export interface ColumnDef<T> {
  id: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: number | string;
}

export interface EnterpriseTableProps<T extends { id: string | number }> {
  columns: ColumnDef<T>[];
  data: T[];
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  statusKey?: keyof T;
}

export function EnterpriseTable<T extends { id: string | number }>({
  columns,
  data,
  selectable = true,
  onRowClick,
  statusKey = 'status' as keyof T,
}: EnterpriseTableProps<T>) {
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(data.map((item) => item.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: string | number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isSelected = (id: string | number) => selected.includes(id);

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box
      sx={{
        borderRadius: '18px', // 18px Card Spec
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Bulk Action Bar (when rows are selected) */}
      {selected.length > 0 && (
        <Box
          sx={{
            px: 2.5,
            py: 1.25,
            backgroundColor: '#EFF6FF',
            borderBottom: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E40AF', fontFamily: '"Geist", sans-serif' }}>
            {selected.length} row{selected.length > 1 ? 's' : ''} selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="secondary" size="small" sx={{ height: 32 }}>
              Export Selected
            </Button>
            <Button variant="danger" size="small" sx={{ height: 32 }}>
              Delete Selected
            </Button>
          </Box>
        </Box>
      )}

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader sx={{ minWidth: 650 }}>
          {/* Sticky Header */}
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={{ backgroundColor: '#F8FAFC', borderColor: '#E5E7EB' }}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAll}
                    sx={{ color: '#94A3B8' }}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={String(col.id)}
                  style={{ width: col.width }}
                  sx={{
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E5E7EB',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#64748B',
                    fontFamily: '"Geist", sans-serif',
                    py: 1.75,
                  }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body (48px Row Height Spec) */}
          <TableBody>
            {paginatedData.map((row) => {
              const rowSelected = isSelected(row.id);
              const statusVal = row[statusKey] as unknown as EnterpriseStatus;

              return (
                <TableRow
                  key={row.id}
                  hover
                  selected={rowSelected}
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    height: 52, // ~48-52px Row Height Spec
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': { backgroundColor: '#F8FAFC !important' },
                    '&.Mui-selected': { backgroundColor: '#F1F5F9 !important' },
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox" sx={{ borderColor: '#E5E7EB' }}>
                      <Checkbox
                        checked={rowSelected}
                        onChange={() => handleSelectOne(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ color: '#CBD5E1' }}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={String(col.id)} sx={{ borderColor: '#E5E7EB', py: 1.25 }}>
                      {col.render ? (
                        col.render(row)
                      ) : String(col.id) === String(statusKey) && statusVal ? (
                        <StatusChip status={statusVal} size="sm" />
                      ) : (
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', fontFamily: '"Geist", sans-serif' }}>
                          {String(row[col.id as keyof T] ?? '—')}
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        sx={{
          borderTop: '1px solid #E5E7EB',
          fontFamily: '"Geist", sans-serif',
          fontSize: '0.8125rem',
          color: '#64748B',
        }}
      />
    </Box>
  );
}

export default EnterpriseTable;
