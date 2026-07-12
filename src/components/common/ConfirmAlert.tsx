import { Stack, Typography, Box } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import AppFormButton from './Forms/AppFormButton';

interface ConfirmAlertProps {
  title: string;
  message?: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmAlert = ({ title, message, isLoading, onConfirm, onCancel }: ConfirmAlertProps) => {
  return (
    <Stack
      flexDirection={'column'}
      justifyContent={'center'}
      alignItems="center"
      spacing={2}
      sx={{ padding: { xs: 2, sm: 3 }, color: 'text.primary' }}
    >
      <Box sx={{ color: 'error.main', mb: 1, fontSize: 72 }}>
        <IconifyIcon icon="hugeicons:alert-02" width={72} height={72} />
      </Box>
      <Typography
        textAlign={'center'}
        variant="h4"
        sx={{
          width: '100%',
          maxWidth: '360px',
          color: 'text.primary',
          lineHeight: 1.45,
          overflowWrap: 'anywhere',
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="subtitle2"
        textAlign="center"
        sx={{
          width: '100%',
          color: 'text.secondary',
          lineHeight: 1.6,
          overflowWrap: 'anywhere',
        }}
      >
        {message}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={"100%"}>
        <AppFormButton
          label="Confirm"
          size="medium"
          fullWidth={true}
          onClick={onConfirm}
          isLoading={isLoading}
          bg="#CC3300"
        />
        <AppFormButton label="Cancel" size="medium" onClick={onCancel} fullWidth={true} />
      </Stack>
    </Stack>
  );
};

export default ConfirmAlert;
