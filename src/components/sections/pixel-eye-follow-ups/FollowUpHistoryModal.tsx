import { useMemo } from 'react';
import { useQuery } from 'react-query';
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { _axios } from 'helper/axios';
import FollowUpLifecycleDetails, {
  formatISTDate,
  formatISTDateTime,
  normalizeHistoryRows,
} from './FollowUpLifecycleDetails';

interface FollowUpHistoryModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string | number | null;
  clientKey?: string;
  customerName?: string;
  phoneNumber?: string;
}

const FollowUpHistoryModal = ({
  open,
  onClose,
  leadId,
  clientKey,
  customerName,
  phoneNumber,
}: FollowUpHistoryModalProps) => {
  const {
    data: history = [],
    isLoading,
    isError,
    error,
  } = useQuery(
    ['pixelEyeFollowUpHistory', leadId, clientKey || null],
    async () => {
      if (leadId === null || leadId === undefined) return [];
      const response = await _axios(
        'get',
        `/pixeleye/${leadId}/follow-up/history`,
        undefined,
        'application/json',
        clientKey ? { _client_key: clientKey } : undefined,
      );
      return normalizeHistoryRows(response);
    },
    {
      enabled: open && leadId !== null && leadId !== undefined,
      refetchOnMount: 'always',
      staleTime: 0,
    },
  );

  const totalChanges = useMemo(() => history.length, [history]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 840 },
          maxWidth: '100vw',
          borderLeft: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Follow-up History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review follow-up date changes for this lead
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <IconifyIcon icon="mdi:close" />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, py: 2, overflow: 'auto', flex: 1 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: 'background.default',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {customerName || 'Unknown customer'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {phoneNumber || 'N/A'}
                </Typography>
              </Box>
              <Chip
                label={`${totalChanges} change${totalChanges === 1 ? '' : 's'}`}
                color="primary"
                variant="outlined"
              />
            </Stack>
          </Paper>

          {isLoading && (
            <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
              <Stack alignItems="center" spacing={1.5}>
                <CircularProgress size={28} />
                <Typography variant="body2" color="text.secondary">
                  Loading history...
                </Typography>
              </Stack>
            </Box>
          )}

          {isError && !isLoading && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {((error as any)?.response?.data?.message as string) ||
                (error as any)?.message ||
                'Failed to load follow-up history.'}
            </Alert>
          )}

          {!isLoading && !isError && history.length === 0 && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No follow-up changes found for this lead.
            </Alert>
          )}

          {!isLoading && !isError && history.length > 0 && (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2, overflow: 'hidden' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Old Follow-up Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>New Follow-up Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Change Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Changed By</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Changed At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((item, index) => (
                    <TableRow key={`${item.created_at || index}-${index}`} hover>
                      <TableCell>{formatISTDate(item.old_follow_up_date)}</TableCell>
                      <TableCell>{formatISTDate(item.new_follow_up_date)}</TableCell>
                      <TableCell>{item.change_type || '---'}</TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <FollowUpLifecycleDetails
                          row={item}
                          showFallbackReason
                          fallbackNoWrap
                        />
                      </TableCell>
                      <TableCell>{item.changed_by_name || '---'}</TableCell>
                      <TableCell>{item.source || '---'}</TableCell>
                      <TableCell>{formatISTDateTime(item.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            API: GET /api/v1/pixeleye/:id/follow-up/history
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FollowUpHistoryModal;
