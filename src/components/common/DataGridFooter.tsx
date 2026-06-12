import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import {
  gridPageSelector,
  gridPageCountSelector,
  useGridApiContext,
  useGridSelector,
  gridPageSizeSelector,
} from '@mui/x-data-grid';

const DataGridFooter = () => {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
  const rowsCount = apiRef.current.getRowsCount();
  const startRow = rowsCount === 0 ? 0 : page * pageSize + 1;
  const endRow = Math.min(page * pageSize + pageSize, rowsCount);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      gap={1.5}
      px={{ xs: 2, md: 2.5 }}
      py={1.5}
      width={1}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: 'text.secondary',
          letterSpacing: '0.02em',
        }}
      >{`${startRow}-${endRow} of ${rowsCount}`}</Typography>
      <Pagination
        color="standard"
        shape="rounded"
        siblingCount={1}
        boundaryCount={1}
        count={pageCount}
        page={page + 1}
        onChange={(event, value) => {
          event.preventDefault();
          apiRef.current.setPage(value - 1);
        }}
        sx={(theme) => ({
          '& .MuiPaginationItem-root': {
            minWidth: 34,
            height: 34,
            margin: 0.25,
            borderRadius: 999,
            fontWeight: 800,
            color: theme.palette.mode === 'dark' ? '#DFFFE3' : '#156A45',
            borderColor:
              theme.palette.mode === 'dark'
                ? 'rgba(134, 239, 172, 0.18)'
                : 'rgba(21, 106, 69, 0.14)',
            backgroundColor: theme.palette.mode === 'dark' ? '#102118' : '#FFFFFF',
          },
          '& .MuiPaginationItem-root.Mui-selected': {
            backgroundColor: theme.palette.mode === 'dark' ? '#156A45' : '#156A45',
            color: '#FFFFFF',
          },
        })}
      />
    </Stack>
  );
};

export default DataGridFooter;
