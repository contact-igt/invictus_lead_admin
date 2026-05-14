import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles/components';

const DataGrid: Components<Omit<Theme, 'components'>>['MuiDataGrid'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      border: 'none',
      borderRadius: '0 !important',
      fontFamily: '"DM Sans", sans-serif',
      '--DataGrid-rowBorderColor': theme.palette.divider,  // #E8EDE9

      '&:hover, &:focus': {
        '*::-webkit-scrollbar, *::-webkit-scrollbar-thumb': {
          visibility: 'visible',
        },
      },
      '& .MuiDataGrid-scrollbar--vertical': {
        visibility: 'hidden',
      },
      '& .MuiDataGrid-scrollbarFiller': {
        minWidth: 0,
      },
    }),

    row: ({ theme }) => ({
      transition: 'background-color 0.15s ease',
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(46,139,87,0.10)'
          : 'rgba(46,139,87,0.06)',
      },
      '&.Mui-selected': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(46,139,87,0.18)' : '#C3E6D3',
        borderLeft: `2px solid ${theme.palette.primary.main}`,
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(46,139,87,0.24)' : '#B8E0CA',
        },
      },
    }),

    cell: ({ theme }) => ({
      padding: '0 12px',
      color: theme.palette.text.primary,
      fontSize: '0.8125rem',
      fontWeight: 400,
      '&:focus-within': {
        outline: 'none !important',
      },
    }),

    cellCheckbox: ({ theme }) => ({
      paddingLeft: theme.spacing(1),
    }),

    columnHeaderCheckbox: ({ theme }) => ({
      '& .MuiDataGrid-columnHeaderTitleContainer': {
        paddingLeft: theme.spacing(1),
      },
    }),

    columnHeaders: ({ theme }) => ({
      backgroundColor: theme.palette.background.default,  // #F4F6F5
      borderBottom: `1px solid ${theme.palette.divider}`,
    }),

    columnHeader: {
      border: 0,
      padding: '0 12px',
      height: '44px !important',
      '&:focus-within': {
        outline: 'none !important',
      },
    },

    columnHeaderTitle: ({ theme }) => ({
      color: theme.palette.text.secondary,      // #4A5C4D
      fontSize: '0.6875rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    }),

    sortIcon: ({ theme }) => ({
      color: theme.palette.primary.main,
    }),

    iconButtonContainer: {
      '& .MuiIconButton-root': {
        backgroundColor: 'transparent !important',
        border: 'none',
      },
    },

    columnSeparator: {
      display: 'none',
    },

    selectedRowCount: {
      display: 'none',
    },

    footerContainer: ({ theme }) => ({
      border: 'none',
      borderTop: `1px solid ${theme.palette.divider}`,
    }),

    overlay: ({ theme }) => ({
      backgroundColor: theme.palette.background.paper,
    }),
  },
};

export default DataGrid;
