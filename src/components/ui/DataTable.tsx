import { Box } from '@mui/material';
import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
  type GridValidRowModel,
} from '@mui/x-data-grid';
import useTokens from 'hooks/useTokens';
import { font, motion } from 'theme/tokens';
import Surface from './Surface';
import EmptyState from './EmptyState';
import type { ReactNode } from 'react';

export type Column<R extends GridValidRowModel> = GridColDef<R>;

export interface DataTableProps<R extends GridValidRowModel>
  extends Omit<DataGridProps<R>, 'sx' | 'autoHeight'> {
  /** Viewport height for the scroll area. The header stays pinned above it. */
  height?: number | string;
  empty?: { title: string; description?: string; icon?: string; action?: ReactNode };
  isEmpty?: boolean;
}

/**
 * Workspace table.
 *
 * A styled shell around MUI DataGrid — all pagination, sorting and server-mode
 * behaviour is passed straight through, so this is a presentation swap only.
 * Adds: pinned header, compact 52px rows, soft hover, tabular numerals, and
 * token-driven light/dark.
 */
export const DataTable = <R extends GridValidRowModel>({
  height = 560,
  empty,
  isEmpty = false,
  ...gridProps
}: DataTableProps<R>) => {
  const t = useTokens();

  if (isEmpty && empty) {
    return (
      <Surface>
        <EmptyState
          icon={empty.icon}
          title={empty.title}
          description={empty.description}
          action={empty.action}
        />
      </Surface>
    );
  }

  return (
    <Surface sx={{ overflow: 'hidden', minWidth: 0 }}>
      <Box sx={{ height, width: '100%', minWidth: 0 }}>
        <DataGrid
          disableColumnMenu
          disableRowSelectionOnClick
          rowHeight={52}
          columnHeaderHeight={44}
          {...gridProps}
          sx={{
            border: 0,
            fontFamily: font.sans,
            color: t.ink,
            '--DataGrid-rowBorderColor': t.border,

            // Header — pinned, sunken, quiet
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: t.surfaceSunken,
              borderBottom: `1px solid ${t.border}`,
            },
            '& .MuiDataGrid-columnHeader': { backgroundColor: t.surfaceSunken },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: t.inkSecondary,
            },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },

            // Cells
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              borderBottom: `1px solid ${t.border}`,
              fontSize: '0.875rem',
              color: t.ink,
              fontVariantNumeric: 'tabular-nums',
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
              outline: 'none',
            },

            // Rows
            '& .MuiDataGrid-row': {
              transition: `background-color ${motion.hover}`,
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              '&:hover': { backgroundColor: t.surfaceSunken },
              '&.Mui-selected': {
                backgroundColor: t.accentSoft,
                '&:hover': { backgroundColor: t.accentSoft },
              },
            },

            // Chrome
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${t.border}`,
              backgroundColor: t.surface,
              minHeight: 52,
            },
            '& .MuiTablePagination-root': { color: t.inkSecondary, fontSize: '0.8125rem' },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.8125rem',
              color: t.inkSecondary,
            },
            '& .MuiIconButton-root': { color: t.inkSecondary },
            '& .MuiIconButton-root.Mui-disabled': { color: t.inkMuted, opacity: 0.4 },
            '& .MuiCheckbox-root': { color: t.borderStrong, '&.Mui-checked': { color: t.accent } },
            '& .MuiDataGrid-overlay': { backgroundColor: t.surface, color: t.inkSecondary },
            '& .MuiDataGrid-scrollbar': { zIndex: 1 },
            '& .MuiDataGrid-virtualScroller': { minWidth: 0 },
            '& .MuiDataGrid-selectedRowCount': { color: t.inkSecondary },
          }}
        />
      </Box>
    </Surface>
  );
};

export default DataTable;
