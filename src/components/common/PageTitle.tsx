/* eslint-disable @typescript-eslint/no-explicit-any */
import Typography from '@mui/material/Typography';
import { Button, CardActions, InputAdornment, Stack, TextField } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const PageTitle = ({
  title,
  btnText,
  isSearchEnable = true,
  isAddEnable = false,
  searchText,
  handleInputChange,
  openModal,
  isXslxExportEnable,
  isCsvExportEnable,
  handleXslxExportData,
  handleCsvExportData
}: any) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      flexWrap="wrap"
      mb={2}
    >
      <Typography 
        variant="h4" 
        component="h2" 
        minWidth={200}
        sx={{ mb: { xs: 1, sm: 0 }, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
      >
        {title}
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        width={{ xs: '100%', sm: 'auto' }}
      >
        {isSearchEnable && (
          <TextField
            variant="filled"
            size="small"
            placeholder={`Search ${title}`}
            value={searchText}
            onChange={handleInputChange}
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconifyIcon icon="mynaui:search" />
                </InputAdornment>
              ),
            }}
          />
        )}
        
         {isXslxExportEnable && (
          <CardActions
            disableSpacing
            sx={{ p: 0, width: { xs: '100%', sm: 170 } }}
            onClick={handleXslxExportData}
          >
            <Button
              variant="contained"
              size="medium"
              startIcon={<IconifyIcon icon="mdi:file-report" />}
              fullWidth
              sx={{
                background: '#000000',
                color: 'primary.info',
                '& .MuiButton-startIcon': { mr: 0.8, pointerEvents: 'none' },
              }}
            >
              {`Export Excel`}
            </Button>
          </CardActions>
        )}

        {isCsvExportEnable && (
          <CardActions
            disableSpacing
            sx={{ p: 0, width: { xs: '100%', sm: 170 } }}
            onClick={handleCsvExportData}
          >
            <Button
              variant="contained"
              size="medium"
              startIcon={<IconifyIcon icon="mdi:report-box-multiple" />}
              fullWidth
              sx={{
                background: '#000000',
                color: 'primary.info',
                '& .MuiButton-startIcon': { mr: 0.8, pointerEvents: 'none' },
              }}
            >
              {`Export CSV`}
            </Button>
          </CardActions>
        )}

        {isAddEnable && (
          <CardActions
            disableSpacing
            sx={{ p: 0, width: { xs: '100%', sm: 'auto' } }}
            onClick={openModal}
          >
            <Button
              variant="contained"
              size="medium"
              startIcon={<IconifyIcon icon="gridicons:plus-small" />}
              fullWidth
              sx={{
                px: 2.5,
                color: 'primary.info',
                whiteSpace: 'nowrap',
                '& .MuiButton-startIcon': { mr: 0.8, pointerEvents: 'none' },
              }}
            >
              {`${btnText}`}
            </Button>
          </CardActions>
        )}
      </Stack>
    </Stack>
  );
};

export default PageTitle;
