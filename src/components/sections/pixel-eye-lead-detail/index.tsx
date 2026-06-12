import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Drawer,
  MenuItem,
  IconButton,
} from '@mui/material';
import dayjs from 'dayjs';
import useColorMode from 'hooks/useColorMode';
import PixelEyeDatePicker from '../pixel-eye/PixelEyeDatePicker';
import { normalizeClientKey } from 'utils/clientKey';
import { _axios } from 'helper/axios';
import {
  usePixelEyeLeadQuery,
  useReschedulePixelEyeFollowUpMutation,
  useMarkPixelEyeFollowUpHandledMutation,
  useCancelPixelEyeFollowUpMutation,
  useUpdatePixelEyeMutation,
} from 'components/hooks/usePixelEyeQuery';
import { useSnackbar } from 'notistack';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Info,
  AlertTriangle,
  History,
  UserCheck,
  Bell,
  ShieldCheck,
  XCircle,
  RefreshCw,
  Sliders,
  PhoneCall,
  Activity,
  X,
} from 'lucide-react';
import {
  TERMINATION_STATUSES,
  NO_ACTION_STATUSES,
  TWENTY_FOUR_HR_STATUSES,
  ALL_STATUSES,
  getDayDropdownStatuses,
  isStatusTerminalForDays,
} from '../pixel-eye/pixelEyeStatuses';
import { PixelEyePageShell, PixelEyeCard } from '../pixel-eye/pixelEyeUi';
import PixelEyeField from '../pixel-eye/PixelEyeField';
import { getFieldSx, getMenuProps } from '../pixel-eye/pixelEyeThemeStyles';

const DNP_DAY_STATUS_PATTERN = /^Dnp [1-4]$/i;

const MAIN_STATUS_OPTIONS = ALL_STATUSES.filter(
  (status) => !DNP_DAY_STATUS_PATTERN.test(status),
);

const isWorkflowClosingStatus = (status?: string | null) => {
  if (!status) return false;
  return (
    (TERMINATION_STATUSES as readonly string[]).includes(status) ||
    (NO_ACTION_STATUSES as readonly string[]).includes(status)
  );
};

const getMainStatusUi = (status: string | undefined | null, mode: 'dark' | 'light') => {
  const value = String(status || '').trim();
  const isClosed = (TERMINATION_STATUSES as readonly string[]).includes(value);
  const isWon = (NO_ACTION_STATUSES as readonly string[]).includes(value);
  const isTwentyFourHour = (TWENTY_FOUR_HR_STATUSES as readonly string[]).includes(value);

  if (isClosed) {
    return {
      label: 'Workflow closed',
      note: 'No next-day access until the lead is reopened',
      color: '#EF4444',
      bg: mode === 'dark' ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
      border: mode === 'dark' ? 'rgba(239,68,68,0.28)' : '#FCA5A5',
    };
  }

  if (isWon) {
    return {
      label: 'Won / no callback',
      note: 'Appointment completed the follow-up flow',
      color: '#22C55E',
      bg: mode === 'dark' ? 'rgba(34,197,94,0.1)' : '#E8F5E9',
      border: mode === 'dark' ? 'rgba(34,197,94,0.24)' : '#A5D6A7',
    };
  }

  if (isTwentyFourHour) {
    return {
      label: '24-hour follow-up',
      note: 'Day pipeline remains active for the next outcome',
      color: '#F59E0B',
      bg: mode === 'dark' ? 'rgba(245,158,11,0.1)' : '#FFFBEB',
      border: mode === 'dark' ? 'rgba(245,158,11,0.26)' : '#FCD34D',
    };
  }

  return {
    label: 'Active lead',
    note: 'Use the current day card to record the next response',
    color: mode === 'dark' ? '#86EFAC' : '#156A45',
    bg: mode === 'dark' ? 'rgba(34,197,94,0.1)' : '#E8F5E9',
    border: mode === 'dark' ? 'rgba(34,197,94,0.22)' : '#A5D6A7',
  };
};

const cleanReminderReason = (reason?: string | null) => {
  const text = String(reason || '').trim();
  if (!text) return '';
  return text.replace(/^Status changed to:\s*/i, '').replace(/^Initial status:\s*/i, '');
};

const normalizeComparable = (value?: string | number | null) => String(value || '').trim();

const getAlarmTrackerUi = (lead: any, mode: 'dark' | 'light') => {
  const leadStatus = String(lead?.status || '').trim();
  const isWonNoCallback = (NO_ACTION_STATUSES as readonly string[]).includes(leadStatus);
  const isHardClosed = (TERMINATION_STATUSES as readonly string[]).includes(leadStatus);
  const isPermanentlyClosed = Boolean(lead?.reminder_permanently_closed);
  const rawState = String(lead?.followup_state || '').trim();
  const cleanedReason = cleanReminderReason(lead?.reminder_cancel_reason);

  if (isPermanentlyClosed && isWonNoCallback) {
    return {
      statusLabel: 'NO CALLBACK NEEDED',
      statusColor: '#22C55E',
      statusBorder: mode === 'dark' ? 'rgba(34,197,94,0.28)' : '#A5D6A7',
      statusBg: mode === 'dark' ? 'rgba(34,197,94,0.07)' : '#F0FDF4',
      subtitle: 'Follow-up flow closed after successful lead outcome',
      closureTitle: 'Follow-up Completed',
      closureReasonLabel: 'Outcome',
      closureReason: cleanedReason || leadStatus || 'Appointment fixed',
      closureColor: '#22C55E',
      closureBorder: 'rgba(34,197,94,0.4)',
      closureBg: mode === 'dark' ? 'rgba(34,197,94,0.05)' : '#F0FDF4',
      icon: CheckCircle2,
    };
  }

  if (isPermanentlyClosed) {
    return {
      statusLabel: rawState ? rawState.toUpperCase() : 'CANCELLED',
      statusColor: isHardClosed ? '#EF4444' : '#F59E0B',
      statusBorder: isHardClosed ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)',
      statusBg: isHardClosed
        ? mode === 'dark'
          ? 'rgba(239,68,68,0.05)'
          : '#FEF2F2'
        : mode === 'dark'
          ? 'rgba(245,158,11,0.05)'
          : '#FFFBEB',
      subtitle: 'Automated callback dispatch status',
      closureTitle: isHardClosed ? 'Permanently Terminated' : 'Callback Closed',
      closureReasonLabel: 'Reason',
      closureReason: lead?.reminder_cancel_reason || 'Day 5 status reached.',
      closureColor: isHardClosed ? '#EF4444' : '#F59E0B',
      closureBorder: isHardClosed ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)',
      closureBg: isHardClosed
        ? mode === 'dark'
          ? 'rgba(239,68,68,0.05)'
          : '#FEF2F2'
        : mode === 'dark'
          ? 'rgba(245,158,11,0.05)'
          : '#FFFBEB',
      icon: isHardClosed ? AlertTriangle : XCircle,
    };
  }

  return {
    statusLabel: rawState ? rawState.toUpperCase() : 'NO ACTIVE ALARM',
    statusColor: rawState ? '#10B981' : '#94A3B8',
    statusBorder: mode === 'dark' ? '#1A2F26' : '#E2E8F0',
    statusBg: mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#F8FAFC',
    subtitle: 'Automated callback dispatch status',
    closureTitle: '',
    closureReasonLabel: '',
    closureReason: '',
    closureColor: '#10B981',
    closureBorder: 'rgba(16,185,129,0.35)',
    closureBg: mode === 'dark' ? 'rgba(16,185,129,0.05)' : '#ECFDF5',
    icon: Bell,
  };
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return '---';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY, hh:mm A') : String(value);
};

const formatDateOnly = (value?: string | null): string => {
  if (!value) return '---';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : String(value);
};

const PixelEyeLeadDetailPage = () => {
  const { mode } = useColorMode();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { clientKey, leadId } = useParams<{ clientKey?: string; leadId?: string }>();
  const activeClientKey = normalizeClientKey(clientKey || 'pixeleye');

  const {
    data: lead,
    isLoading,
    isError,
    error,
    refetch,
  } = usePixelEyeLeadQuery(leadId, activeClientKey);

  // CRM Action Mutations
  const rescheduleMutation = useReschedulePixelEyeFollowUpMutation();
  const markHandledMutation = useMarkPixelEyeFollowUpHandledMutation();
  const cancelMutation = useCancelPixelEyeFollowUpMutation();
  const updateMutation = useUpdatePixelEyeMutation();

  // State for CRM Modals
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const [markHandledOpen, setMarkHandledOpen] = useState(false);
  const [handledReason, setHandledReason] = useState('');

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelStatus, setCancelStatus] = useState('Closed');
  const [cancelReason, setCancelReason] = useState('');

  const [updatingDayField, setUpdatingDayField] = useState<string | null>(null);
  // Quick Inline Status Edit
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusValue, setStatusValue] = useState('');

  useEffect(() => {
    if (lead?.status) {
      setStatusValue(lead.status);
    }
  }, [lead?.status]);

  // Fetch History for Audit Trail
  const {
    data: historyRes,
    refetch: refetchHistory,
    isLoading: historyLoading,
  } = useQuery(
    ['pixelEyeLeadHistory', leadId],
    async () => {
      const response = await _axios('get', `/pixeleye/${leadId}/follow-up/history`);
      return response?.data || response || null;
    },
    {
      enabled: Boolean(leadId),
    },
  );

  const historyList = useMemo(() => {
    return historyRes?.history || [];
  }, [historyRes]);

  const historyEntryLabel = `${historyList.length} ${historyList.length === 1 ? 'Entry' : 'Entries'}`;

  // Fetch Call Compliance matching log entries
  const {
    data: complianceList,
    refetch: refetchCompliance,
    isLoading: complianceLoading,
  } = useQuery(
    ['pixelEyeLeadCompliance', leadId, activeClientKey],
    async () => {
      const response = await _axios(
        'get',
        '/pixeleye/follow-ups/call-compliance',
        undefined,
        'application/json',
        {
          _client_key: activeClientKey,
        },
      );
      const rows = response?.data || response || [];
      if (Array.isArray(rows)) {
        return rows.filter((row: any) => {
          const matchesLeadId = Number(row.lead_id) === Number(leadId);
          const matchesCallId =
            normalizeComparable(row.call_id) &&
            normalizeComparable(row.call_id) === normalizeComparable(lead?.call_id);
          return matchesLeadId || matchesCallId;
        });
      }
      return [];
    },
    {
      enabled: Boolean(leadId && lead),
    },
  );

  const handleRescheduleSubmit = () => {
    if (!leadId || !rescheduleDate) return;
    rescheduleMutation.mutate(
      { id: Number(leadId), follow_up_date: rescheduleDate, reason: rescheduleReason },
      {
        onSuccess: () => {
          setRescheduleOpen(false);
          setRescheduleDate('');
          setRescheduleReason('');
          queryClient.invalidateQueries(['pixelEyeLead', leadId]);
          refetch();
          refetchHistory();
          refetchCompliance();
        },
      },
    );
  };

  const handleMarkHandledSubmit = () => {
    if (!leadId) return;
    markHandledMutation.mutate(
      { id: Number(leadId), reason: handledReason },
      {
        onSuccess: () => {
          setMarkHandledOpen(false);
          setHandledReason('');
          queryClient.invalidateQueries(['pixelEyeLead', leadId]);
          refetch();
          refetchHistory();
          refetchCompliance();
        },
      },
    );
  };

  const handleCancelSubmit = () => {
    if (!leadId) return;
    cancelMutation.mutate(
      { id: Number(leadId), status: cancelStatus, reason: cancelReason },
      {
        onSuccess: () => {
          setCancelOpen(false);
          setCancelReason('');
          queryClient.invalidateQueries(['pixelEyeLead', leadId]);
          refetch();
          refetchHistory();
          refetchCompliance();
        },
      },
    );
  };

  const handleDayValueChange = (dayField: string, value: string) => {
    if (!leadId) return;
    setUpdatingDayField(dayField);

    // Auto-propagate terminal day outcomes to main status
    const updatePayload: any = { id: Number(leadId), [dayField]: value };
    if (isStatusTerminalForDays(value)) {
      updatePayload.status = value;
    }

    updateMutation.mutate(updatePayload, {
      onSuccess: () => {
        enqueueSnackbar(
          `${dayField.replace('_', ' ').toUpperCase()} outcome updated successfully`,
          { variant: 'success' },
        );
        setUpdatingDayField(null);
        queryClient.invalidateQueries(['pixelEyeLead', leadId]);
        refetch();
        refetchHistory();
        refetchCompliance();
      },
      onError: (err: any) => {
        enqueueSnackbar(
          err?.response?.data?.message || err?.message || 'Failed to update day progress',
          { variant: 'error' },
        );
        setUpdatingDayField(null);
      },
    });
  };

  const handleStatusChangeSubmit = () => {
    if (!leadId || !statusValue) return;
    updateMutation.mutate(
      { id: Number(leadId), status: statusValue },
      {
        onSuccess: () => {
          enqueueSnackbar('Lead main status updated successfully', { variant: 'success' });
          setIsEditingStatus(false);
          queryClient.invalidateQueries(['pixelEyeLead', leadId]);
          refetch();
          refetchHistory();
          refetchCompliance();
        },
        onError: (err: any) => {
          enqueueSnackbar(
            err?.response?.data?.message || err?.message || 'Failed to update status',
            { variant: 'error' },
          );
        },
      },
    );
  };

  const overviewRows = useMemo(
    () => [
      { label: 'Date Tracked', value: formatDateOnly(lead?.date), icon: Calendar },
      { label: 'Time Tracked', value: lead?.time || '---', icon: Clock },
      { label: 'Call Identifier ID', value: lead?.call_id || '---', icon: FileText },
      { label: 'Agent Name', value: lead?.agent_name || '---', icon: User },
      { label: 'Lead Source', value: lead?.source || '---', icon: Info },
      { label: 'Type of Enquiry', value: lead?.type_of_enquiry || '---', icon: Info },
      {
        label: 'Created DateTime',
        value: formatDateTime(lead?.createdAt || lead?.created_at),
        icon: Clock,
      },
      {
        label: 'Updated DateTime',
        value: formatDateTime(lead?.updatedAt || lead?.updated_at),
        icon: Clock,
      },
    ],
    [lead],
  );

  const pipelineDays = useMemo(() => {
    return [
      { label: 'Day 1', value: lead?.day_1, field: 'day_1' },
      { label: 'Day 2', value: lead?.day_2, field: 'day_2' },
      { label: 'Day 3', value: lead?.day_3, field: 'day_3' },
      { label: 'Day 4', value: lead?.day_4, field: 'day_4' },
      { label: 'Day 5', value: lead?.day_5, field: 'day_5' },
    ];
  }, [lead]);

  const goBack = () => {
    navigate(`/pages/d/${activeClientKey}/leads`);
  };

  const mainStatusUi = getMainStatusUi(lead?.status, mode);
  const alarmTrackerUi = getAlarmTrackerUi(lead, mode);
  const AlarmClosureIcon = alarmTrackerUi.icon;
  const complianceEmptyState = (() => {
    if (isWorkflowClosingStatus(lead?.status)) {
      return {
        title: 'SLA not required',
        description: 'This lead outcome has closed the follow-up workflow.',
      };
    }

    if (!lead?.follow_up_date) {
      return {
        title: 'No follow-up date set',
        description: 'Select a future follow-up date to start SLA monitoring.',
      };
    }

    const parsedFollowUpDate = dayjs(lead.follow_up_date);
    if (parsedFollowUpDate.isValid() && !parsedFollowUpDate.isAfter(dayjs())) {
      return {
        title: 'Follow-up date is overdue',
        description: 'Choose a future follow-up time to create a new SLA window.',
      };
    }

    return {
      title: 'Awaiting SLA record',
      description: 'A valid future follow-up date creates the compliance window.',
    };
  })();
  const mainStatusOptions = useMemo(() => {
    const currentStatus = String(lead?.status || '').trim();
    if (currentStatus && !MAIN_STATUS_OPTIONS.some((status) => status === currentStatus)) {
      return [currentStatus, ...MAIN_STATUS_OPTIONS];
    }
    return MAIN_STATUS_OPTIONS;
  }, [lead?.status]);

  if (!leadId) {
    return (
      <Box sx={{ minHeight: '100vh', px: { xs: 2, md: 3.5 }, py: { xs: 2, md: 3.5 } }}>
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          Lead ID is missing from the route.
        </Alert>
      </Box>
    );
  }

  return (
    <PixelEyePageShell>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
        {/* --- Header Section --- */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}
        >
          <Box>
            <Button
              variant="text"
              onClick={goBack}
              startIcon={<ArrowLeft size={18} />}
              sx={{
                mb: 2,
                color: mode === 'dark' ? '#86EFAC' : '#156A45',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  background: mode === 'dark' ? 'rgba(34,197,94,0.08)' : 'rgba(21,106,69,0.05)',
                },
              }}
            >
              Back to Leads
            </Button>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)',
                  color: 'white',
                  fontSize: '1.25rem',
                  boxShadow: '0 8px 20px rgba(34,197,94,0.25)',
                }}
              >
                {(lead?.customer_name || 'U').slice(0, 1).toUpperCase()}
              </Box>
              {lead?.customer_name || 'Lead Details'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <IconButton
              onClick={() => {
                refetch();
                refetchHistory();
                refetchCompliance();
                enqueueSnackbar('Data refreshed', { variant: 'info' });
              }}
              sx={{
                border: '1px solid',
                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                borderRadius: '12px',
                color: mode === 'dark' ? '#94A3B8' : '#64748B',
                '&:hover': { background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8FAFC' },
              }}
            >
              <RefreshCw size={20} />
            </IconButton>
            <Button
              variant="contained"
              onClick={() => setMarkHandledOpen(true)}
              sx={{
                borderRadius: '12px',
                px: 3,
                py: 1.2,
                background: '#156A45',
                boxShadow: '0 8px 20px rgba(21,106,69,0.2)',
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { background: '#1b8a59' },
              }}
            >
              Mark Handled
            </Button>
          </Stack>
        </Box>

        {isError && (
          <Alert severity="error" sx={{ borderRadius: 3.5 }}>
            {String((error as any)?.message || 'Failed to load lead details.')}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ py: 12, display: 'flex', justifyContent: 'center' }}>
            <Stack alignItems="center" spacing={2.5}>
              <CircularProgress size={44} thickness={4} sx={{ color: '#156A45' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Synching lead data...
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
            {/* --- Premium 5-Day Interactive Pipeline Follow-up Timeline --- */}
            <Grid item xs={12}>
              <PixelEyeCard sx={{ p: { xs: 2.5, md: 4 } }}>
                <Box
                  sx={{
                    mb: 3.5,
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 3,
                        bgcolor: mode === 'dark' ? '#12251D' : '#E8F5E9',
                        color: mode === 'dark' ? '#86EFAC' : '#156A45',
                        display: 'flex',
                      }}
                    >
                      <Sliders size={22} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 900, color: mode === 'dark' ? '#FFFFFF' : '#0F172A' }}
                      >
                        5-Day Interactive Pipeline Campaign
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: mode === 'dark' ? '#94A3B8' : '#64748B', fontWeight: 600 }}
                      >
                        Manage chronological stages and instantly sync receptionist outcomes
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: mode === 'dark' ? '#86EFAC' : '#156A45',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8,
                      }}
                    >
                      <Activity size={12} /> Live Sync Active
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(5, 1fr)',
                    },
                    gap: 2.5,
                    width: '100%',
                  }}
                >
                  {pipelineDays.map((day, idx) => {
                    const isCompleted = Boolean(day.value);
                    const isTerminalOutcome = isCompleted && isStatusTerminalForDays(day.value);
                    const isSuccess =
                      isCompleted &&
                      (day.value === 'Appointment Fixed' ||
                        day.value === 'Walk-in' ||
                        day.value === 'Visited');

                    const hasPreviousDayTerminal = pipelineDays
                      .slice(0, idx)
                      .some((prev) => isStatusTerminalForDays(prev.value));

                    const leadWorkflowClosed = isWorkflowClosingStatus(lead?.status);

                    const isActive =
                      !leadWorkflowClosed &&
                      !hasPreviousDayTerminal &&
                      !isCompleted &&
                      (idx === 0 || !!pipelineDays[idx - 1]?.value);

                    const isLocked =
                      (leadWorkflowClosed && !isCompleted) ||
                      hasPreviousDayTerminal ||
                      (idx > 0 && !pipelineDays[idx - 1]?.value);

                    const stageLabel = isLocked
                      ? leadWorkflowClosed
                        ? 'Flow Closed'
                        : idx > 0 && !pipelineDays[idx - 1]?.value
                          ? 'Waiting Previous'
                          : 'Locked Stage'
                      : isCompleted
                        ? 'Completed stage'
                        : isActive
                          ? 'Active Stage'
                          : 'Locked Stage';

                    return (
                      <Box
                        key={day.label}
                        sx={{
                          p: 2.5,
                          borderRadius: '20px',
                          border: '1px solid',
                          position: 'relative',
                          minHeight: 180,
                          borderColor: isCompleted
                            ? isSuccess
                              ? '#22C55E'
                              : isTerminalOutcome
                                ? '#EF4444'
                                : '#6366F1'
                            : isActive
                              ? '#F59E0B'
                              : mode === 'dark'
                                ? 'rgba(255,255,255,0.04)'
                                : '#E2E8F0',
                          background: isCompleted
                            ? isSuccess
                              ? mode === 'dark'
                                ? 'rgba(34, 197, 94, 0.04)'
                                : '#F0FDF4'
                              : isTerminalOutcome
                                ? mode === 'dark'
                                  ? 'rgba(239, 68, 68, 0.04)'
                                  : '#FEF2F2'
                                : mode === 'dark'
                                  ? 'rgba(99, 102, 241, 0.04)'
                                  : '#EEF2FF'
                            : isActive
                              ? mode === 'dark'
                                ? 'rgba(245, 158, 11, 0.04)'
                                : '#FFFBEB'
                              : mode === 'dark'
                                ? '#070E0B'
                                : '#F8FAFC',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: isActive
                            ? mode === 'dark'
                              ? '0 8px 25px rgba(0,0,0,0.5)'
                              : '0 8px 25px rgba(245,158,11,0.08)'
                            : 'none',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow:
                              mode === 'dark'
                                ? '0 12px 28px rgba(0,0,0,0.6)'
                                : '0 12px 28px rgba(15,23,42,0.06)',
                          },
                        }}
                      >
                        {/* Day Header Status badge */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 900,
                              color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {day.label}
                          </Typography>
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              flexShrink: 0,
                              bgcolor: isCompleted
                                ? isSuccess
                                  ? '#22C55E'
                                  : isTerminalOutcome
                                    ? '#EF4444'
                                    : '#6366F1'
                                : isActive
                                  ? '#F59E0B'
                                  : 'transparent',
                              border: !isCompleted && !isActive ? '2px solid' : 'none',
                              borderColor: mode === 'dark' ? 'rgba(226,232,240,0.2)' : '#CBD5E1',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                            }}
                          >
                            {isCompleted ? <CheckCircle2 size={15} /> : idx + 1}
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2, flex: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              fontSize: '0.65rem',
                              color: isLocked
                                ? 'text.disabled'
                                : isCompleted
                                  ? isSuccess
                                    ? '#22C55E'
                                    : isTerminalOutcome
                                      ? '#EF4444'
                                      : '#6366F1'
                                  : isActive
                                    ? '#F59E0B'
                                    : 'text.disabled',
                              mb: 0.5,
                              display: 'block',
                            }}
                          >
                            {stageLabel}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              lineHeight: 1.4,
                              color: day.value
                                ? mode === 'dark'
                                  ? '#FFFFFF'
                                  : '#1E293B'
                                : 'text.disabled',
                              fontStyle: day.value ? 'normal' : 'italic',
                              wordBreak: 'break-word',
                              fontSize: '0.8rem',
                              minHeight: '2.6em',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {day.value || 'No response recorded'}
                          </Typography>
                        </Box>

                        {/* Inline Update Dropdown Selector */}
                        <Box
                          sx={{
                            mt: 1.5,
                            pt: 1.5,
                            borderTop: '1px solid',
                            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                          }}
                        >
                          {updatingDayField === day.field ? (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ height: 34 }}
                            >
                              <CircularProgress size={16} sx={{ color: '#156A45' }} />
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontWeight: 700 }}
                              >
                                Updating...
                              </Typography>
                            </Stack>
                          ) : (
                            <PixelEyeField
                              select
                              fullWidth
                              size="small"
                              value={day.value || ''}
                              onChange={(e) => handleDayValueChange(day.field, e.target.value)}
                              disabled={isLocked}
                              sx={{
                                ...getFieldSx(mode),
                                '& .MuiInputBase-root': {
                                  backgroundColor: mode === 'dark' ? '#060B08' : '#FFFFFF',
                                  height: 34,
                                  fontSize: '0.7rem',
                                  borderRadius: '10px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  '&:hover': {
                                    backgroundColor: mode === 'dark' ? '#09110B' : '#F8FAFC',
                                  },
                                },
                              }}
                              SelectProps={{
                                displayEmpty: true,
                                renderValue: (selected) => {
                                  if (!selected) {
                                    return (
                                      <span
                                        style={{
                                          color: mode === 'dark' ? '#64748B' : '#94A3B8',
                                          fontWeight: 600,
                                          fontSize: '0.7rem',
                                        }}
                                      >
                                        Quick Update
                                      </span>
                                    );
                                  }
                                  return (
                                    <span style={{ fontWeight: 800, fontSize: '0.7rem' }}>
                                      Change Outcome
                                    </span>
                                  );
                                },
                                MenuProps: getMenuProps(mode),
                              }}
                            >
                              <MenuItem value="" disabled>
                                <em>Outcomes List</em>
                              </MenuItem>
                              {getDayDropdownStatuses(idx + 1).map((status) => (
                                <MenuItem
                                  key={status}
                                  value={status}
                                  sx={{ fontSize: '0.75rem', py: 0.8 }}
                                >
                                  {status}
                                </MenuItem>
                              ))}
                            </PixelEyeField>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </PixelEyeCard>
            </Grid>

            {/* --- Main Dashboard Sections --- */}
            <Grid container spacing={4} sx={{ width: '100%', m: 0 }}>
              {/* 1. Status Control - Full Width */}
              <Grid item xs={12}>
                <PixelEyeCard sx={{ p: 3 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2.5,
                          bgcolor: mode === 'dark' ? '#12251D' : '#E8F5E9',
                          color: mode === 'dark' ? '#86EFAC' : '#156A45',
                          display: 'flex',
                        }}
                      >
                        <Sliders size={18} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Lead Status Outcome Control
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', fontWeight: 600 }}
                        >
                          {mainStatusUi.note}
                        </Typography>
                      </Box>
                    </Box>

                    {isEditingStatus ? (
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        <PixelEyeField
                          select
                          size="small"
                          value={statusValue}
                          onChange={(e) => setStatusValue(e.target.value)}
                          sx={{
                            minWidth: 160,
                            ...getFieldSx(mode),
                            '& .MuiInputBase-root': { height: 36, fontSize: '0.8rem' },
                          }}
                          SelectProps={{ MenuProps: getMenuProps(mode) }}
                        >
                          {mainStatusOptions.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </PixelEyeField>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleStatusChangeSubmit}
                          sx={{
                            height: 36,
                            textTransform: 'none',
                            borderRadius: 2.5,
                            px: 2,
                            bgcolor: '#156A45',
                            color: 'white',
                            '&:hover': { bgcolor: '#1C7A4C' },
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setIsEditingStatus(false)}
                          sx={{ height: 36, textTransform: 'none', borderRadius: 2.5, px: 2 }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    ) : (
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Chip
                          label={mainStatusUi.label}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 30,
                            fontWeight: 900,
                            fontSize: '0.68rem',
                            borderRadius: 2.5,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: mainStatusUi.color,
                            borderColor: mainStatusUi.border,
                            bgcolor: mainStatusUi.bg,
                          }}
                        />
                        <Chip
                          label={lead?.status || 'NEW'}
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.8rem',
                            borderRadius: 2.5,
                            px: 1.2,
                            py: 1.8,
                            backgroundColor: mainStatusUi.bg,
                            color: mainStatusUi.color,
                            border: `1px solid ${mainStatusUi.border}`,
                          }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setStatusValue(lead?.status || '');
                            setIsEditingStatus(true);
                          }}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2.5,
                            fontWeight: 700,
                            borderColor: mode === 'dark' ? 'rgba(134,239,172,0.2)' : 'divider',
                          }}
                        >
                          Edit Status
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </PixelEyeCard>
              </Grid>

              {/* 2. Alarm Tracker - Flexible Width */}
              <Grid item xs={12} lg={6}>
                {/* Alarm Tracker Card */}
                <PixelEyeCard sx={{ height: '100%', p: { xs: 2.5, md: 3 } }}>
                  <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2.5,
                        bgcolor: mode === 'dark' ? '#12241A' : '#E8F5E9',
                        color: mode === 'dark' ? '#86EFAC' : '#156A45',
                        display: 'flex',
                      }}
                    >
                      <Bell size={18} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 900,
                          color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                        }}
                      >
                        Follow-up Alarm Tracker
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: mode === 'dark' ? '#94A3B8' : '#64748B',
                          fontWeight: 600,
                        }}
                      >
                        {alarmTrackerUi.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    {/* Left: Callback Status */}
                    <Grid item xs={12} sm={3}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '20px',
                          border: '1.5px solid',
                          borderColor: alarmTrackerUi.statusBorder,
                          bgcolor: alarmTrackerUi.statusBg,
                          textAlign: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          minHeight: 140,
                        }}
                      >
                        {/* Decorative background glow */}
                        {lead?.followup_state && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -20,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 100,
                              height: 40,
                              bgcolor: alarmTrackerUi.statusColor,
                              filter: 'blur(30px)',
                              opacity: 0.1,
                              zIndex: 0,
                            }}
                          />
                        )}

                        <Typography
                          variant="caption"
                          sx={{
                            color: mode === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748B',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontSize: '0.65rem',
                            mb: 2,
                            position: 'relative',
                            zIndex: 1,
                          }}
                        >
                          Callback Status
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            color: alarmTrackerUi.statusColor,
                            lineHeight: 1.2,
                            position: 'relative',
                            zIndex: 1,
                            fontSize: '1rem',
                          }}
                        >
                          {alarmTrackerUi.statusLabel}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Middle: Stats Grid */}
                    <Grid item xs={12} sm={lead?.reminder_permanently_closed ? 5 : 9}>
                      <Grid container spacing={1.5}>
                        {[
                          {
                            label: 'Schedule Type',
                            value: lead?.reminder_schedule_type,
                            icon: Sliders,
                          },
                          {
                            label: 'Auto-Notified',
                            value: lead?.reminder_notification_sent ? 'Yes' : 'No',
                            icon: Activity,
                          },
                          {
                            label: 'Scheduled Time',
                            value: formatDateTime(lead?.reminder_scheduled_at),
                            icon: Clock,
                          },
                          {
                            label: 'Dispatch Time',
                            value: formatDateTime(lead?.reminder_notification_sent_at),
                            icon: PhoneCall,
                          },
                        ].map((stat) => (
                          <Grid item xs={6} key={stat.label}>
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: '16px',
                                bgcolor: mode === 'dark' ? '#070D0B' : '#FFFFFF',
                                border: '1.2px solid',
                                borderColor: mode === 'dark' ? '#14251D' : '#E2E8F0',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.2,
                              }}
                            >
                              <stat.icon
                                size={14}
                                style={{
                                  color: mode === 'dark' ? 'rgba(16,185,129,0.3)' : '#94A3B8',
                                  flexShrink: 0,
                                }}
                              />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    fontWeight: 900,
                                    fontSize: '0.55rem',
                                    textTransform: 'uppercase',
                                    color: mode === 'dark' ? 'rgba(255,255,255,0.45)' : '#64748B',
                                    letterSpacing: '0.05em',
                                  }}
                                >
                                  {stat.label}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 900,
                                    display: 'block',
                                    color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                                    fontSize: '0.75rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {stat.value || '—'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>

                    {/* Right: Closure Notice */}
                    {lead?.reminder_permanently_closed && (
                      <Grid item xs={12} sm={4}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '20px',
                            border: '1.5px solid',
                            borderColor: alarmTrackerUi.closureBorder,
                            bgcolor: alarmTrackerUi.closureBg,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AlarmClosureIcon size={16} color={alarmTrackerUi.closureColor} />
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 900,
                                color: alarmTrackerUi.closureColor,
                                textTransform: 'uppercase',
                                fontSize: '0.65rem',
                                letterSpacing: '0.05em',
                              }}
                            >
                              {alarmTrackerUi.closureTitle}
                            </Typography>
                          </Stack>

                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: mode === 'dark' ? '#E2E8F0' : '#0F172A',
                              fontSize: '0.75rem',
                              lineHeight: 1.4,
                              mt: 0.5,
                            }}
                          >
                            {alarmTrackerUi.closureReasonLabel}: {alarmTrackerUi.closureReason}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </PixelEyeCard>
              </Grid>

              {/* 3. Lead Information - Flexible Width */}
              <Grid item xs={12} lg={6}>
                {/* Overview Demographics Card */}
                <PixelEyeCard sx={{ height: '100%', p: { xs: 2.5, md: 3.5 } }}>
                  <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2.5,
                        bgcolor: mode === 'dark' ? '#12241A' : '#E8F5E9',
                        color: mode === 'dark' ? '#86EFAC' : '#156A45',
                        display: 'flex',
                      }}
                    >
                      <User size={18} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 900,
                          color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                        }}
                      >
                        Lead Information
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: mode === 'dark' ? '#94A3B8' : '#64748B',
                          fontWeight: 600,
                        }}
                      >
                        Core descriptive attributes
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    {overviewRows.map((item) => (
                      <Grid item xs={12} sm={6} key={item.label}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3.5,
                            border: '1px solid',
                            borderColor: mode === 'dark' ? '#14251C' : '#E2E8F0',
                            background: mode === 'dark' ? '#060B08' : '#F8FAFC',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            height: '100%',
                          }}
                        >
                          <Box
                            sx={{
                              color: mode === 'dark' ? '#22C55E' : '#156A45',
                              p: 1,
                              borderRadius: 2.5,
                              bgcolor: mode === 'dark' ? 'rgba(34,197,94,0.08)' : '#E2E8F0',
                              display: 'flex',
                            }}
                          >
                            <item.icon size={16} />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="caption"
                              noWrap={false}
                              sx={{
                                color: 'text.secondary',
                                fontWeight: 800,
                                display: 'block',
                                fontSize: '0.66rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                lineHeight: 1.2,
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.5,
                                fontWeight: 700,
                                color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                                wordBreak: 'break-word',
                                lineHeight: 1.3,
                              }}
                            >
                              {item.value}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </PixelEyeCard>
              </Grid>

              {/* 4. Activity Audit Timeline & Call Compliance */}
              <Grid item xs={12} lg={8}>
                {/* Real-time Follow-up History Audit Timeline */}
                <PixelEyeCard sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
                  <Box
                    sx={{
                      mb: 3.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2.5,
                          bgcolor: mode === 'dark' ? '#12241A' : '#E8F5E9',
                          color: mode === 'dark' ? '#86EFAC' : '#156A45',
                          display: 'flex',
                        }}
                      >
                        <History size={18} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                          }}
                        >
                          Activity Audit Timeline
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: mode === 'dark' ? '#94A3B8' : '#64748B',
                            fontWeight: 600,
                          }}
                        >
                          Every operational follow-up transaction
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={historyEntryLabel}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 800, borderRadius: 2 }}
                    />
                  </Box>

                  {historyLoading ? (
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={24} color="primary" />
                    </Box>
                  ) : historyList.length === 0 ? (
                    <Box
                      sx={{
                        py: 8,
                        textAlign: 'center',
                        bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        borderRadius: '20px',
                        border: '1px dashed',
                        borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      }}
                    >
                      <History size={40} style={{ opacity: 0.1, marginBottom: 12 }} />
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        No audit history recorded.
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 4,
                        overflowX: 'auto',
                        pb: 1,
                        px: 1,
                        '&::-webkit-scrollbar': { height: 6 },
                        '&::-webkit-scrollbar-thumb': {
                          bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          borderRadius: 3,
                        },
                      }}
                    >
                      {historyList.map((item: any, idx: number) => {
                        const isResched = item.change_type === 'RESCHEDULED';
                        const isHandled = item.change_type === 'HANDLED';
                        const isCreated = item.change_type === 'CREATED';

                        return (
                          <Box
                            key={idx}
                            sx={{
                              minWidth: historyList.length === 1 ? '100%' : 320,
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            {/* Connector Line */}
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                top: 25,
                                width: '100%',
                                height: '2px',
                                bgcolor:
                                  mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                zIndex: 0,
                              }}
                            />

                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                              sx={{ mb: 2, position: 'relative', zIndex: 1 }}
                            >
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: isCreated
                                    ? '#10B981'
                                    : isResched
                                      ? '#F59E0B'
                                      : isHandled
                                        ? '#3B82F6'
                                        : '#64748B',
                                  boxShadow: `0 0 0 4px ${mode === 'dark' ? '#091511' : '#FFFFFF'}`,
                                  flexShrink: 0,
                                }}
                              />

                              <Chip
                                label={String(item.change_type || 'UPDATE').toUpperCase()}
                                size="small"
                                sx={{
                                  fontSize: '0.65rem',
                                  fontWeight: 900,
                                  height: 20,
                                  borderRadius: '6px',
                                  bgcolor:
                                    mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                  color: isCreated ? '#10B981' : isResched ? '#F59E0B' : '#94A3B8',
                                }}
                              />

                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 900,
                                  fontSize: '0.9rem',
                                  color: mode === 'dark' ? '#FFFFFF' : '#0F172A',
                                }}
                              >
                                {item.changed_by_name || 'System'}
                              </Typography>
                            </Stack>

                            <Box sx={{ pl: 3 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: mode === 'dark' ? '#94A3B8' : '#64748B',
                                  display: 'block',
                                  mb: 1.5,
                                  fontStyle: 'italic',
                                  fontWeight: 600,
                                  fontSize: '0.8rem',
                                  lineHeight: 1.4,
                                }}
                              >
                                "{item.reason || 'Lead status update'}"
                              </Typography>

                              {item.change_type === 'RESCHEDULED' && (item.new_follow_up_date || item.old_follow_up_date) && (
                                <Box sx={{ mb: 1 }}>
                                  <Box
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      p: '6px 8px',
                                      borderRadius: 2,
                                      bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                                      border: '1px solid',
                                      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#E6E7EB',
                                    }}
                                  >
                                    {item.old_follow_up_date && (
                                      <Typography
                                        variant="caption"
                                        sx={{ fontWeight: 800, color: mode === 'dark' ? '#94A3B8' : '#374151', fontSize: '0.72rem' }}
                                      >
                                        Was: {formatDateTime(item.old_follow_up_date)}
                                      </Typography>
                                    )}

                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', mx: 0.5 }}>
                                      →
                                    </Typography>

                                    {item.new_follow_up_date && (
                                      <Typography
                                        variant="caption"
                                        sx={{ fontWeight: 900, color: mode === 'dark' ? '#86EFAC' : '#065F46', fontSize: '0.72rem' }}
                                      >
                                        Now: {formatDateTime(item.new_follow_up_date)}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              )}

                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  fontWeight: 800,
                                  color:
                                    mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'text.disabled',
                                  fontSize: '0.7rem',
                                }}
                              >
                                {formatDateTime(item.created_at || item.createdAt)}
                              </Typography>

                              {/* Content Bottom Border Line */}
                              <Box
                                sx={{
                                  mt: 2,
                                  height: '1.5px',
                                  width: '100%',
                                  bgcolor:
                                    mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.1)',
                                  opacity: idx === 0 ? 0.8 : 0.3,
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </PixelEyeCard>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
                  {/* Call Compliance Auditor Monitor */}
                  <PixelEyeCard sx={{ p: { xs: 2.5, md: 3 }, height: '100%' }}>
                    <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2.5,
                          bgcolor: mode === 'dark' ? '#12241A' : '#E8F5E9',
                          color: mode === 'dark' ? '#86EFAC' : '#156A45',
                          display: 'flex',
                        }}
                      >
                        <ShieldCheck size={18} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                          }}
                        >
                          Call Compliance
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.2,
                            color: mode === 'dark' ? '#94A3B8' : '#64748B',
                            fontWeight: 600,
                          }}
                        >
                          SLA monitoring
                        </Typography>
                      </Box>
                    </Box>

                    {complianceLoading ? (
                      <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={20} />
                      </Box>
                    ) : (complianceList || []).length === 0 ? (
                      <Box
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          border: '1px dashed',
                          borderColor: mode === 'dark' ? 'rgba(148,163,184,0.18)' : '#CBD5E1',
                          borderRadius: '18px',
                          bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.015)' : '#F8FAFC',
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          minHeight: 180,
                        }}
                      >
                        <ShieldCheck
                          size={32}
                          style={{ opacity: 0.18, alignSelf: 'center', marginBottom: 10 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 900,
                            color: mode === 'dark' ? '#E2E8F0' : '#0F172A',
                            display: 'block',
                          }}
                        >
                          {complianceEmptyState.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.8,
                            color: mode === 'dark' ? '#94A3B8' : '#64748B',
                            fontWeight: 700,
                            lineHeight: 1.45,
                            maxWidth: 260,
                            mx: 'auto',
                          }}
                        >
                          {complianceEmptyState.description}
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={2.5}>
                        {(complianceList || []).map((row: any, idx: number) => {
                          const status = String(row.compliance_status || 'PENDING').toUpperCase();
                          const isCalled = status === 'CALLED';
                          const isMissed = status === 'MISSED';
                          const statusLabel = isCalled
                            ? 'Call completed'
                            : isMissed
                              ? 'SLA missed'
                              : 'Awaiting call';

                          const statusColor = isCalled
                            ? '#10B981'
                            : isMissed
                              ? '#EF4444'
                              : '#F59E0B';

                          return (
                            <Box
                              key={row.id || idx}
                              sx={{
                                p: 2.5,
                                borderRadius: '18px',
                                border: '1.5px solid',
                                borderColor: statusColor,
                                bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#FFFFFF',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow:
                                    mode === 'dark'
                                      ? '0 8px 25px rgba(0,0,0,0.4)'
                                      : '0 8px 25px rgba(0,0,0,0.05)',
                                },
                              }}
                            >
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{ mb: 2 }}
                              >
                                <Chip
                                  label={status}
                                  size="small"
                                  sx={{
                                    fontWeight: 900,
                                    fontSize: '0.65rem',
                                    height: 20,
                                    borderRadius: '6px',
                                    bgcolor: statusColor,
                                    color: '#FFFFFF',
                                    px: 0.5,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 800,
                                    color: mode === 'dark' ? '#94A3B8' : '#64748B',
                                    textTransform: 'uppercase',
                                    fontSize: '0.62rem',
                                    letterSpacing: '0.05em',
                                  }}
                                >
                                  {statusLabel}
                                </Typography>
                              </Stack>

                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  fontSize: '0.65rem',
                                  textTransform: 'uppercase',
                                  fontWeight: 900,
                                  color: mode === 'dark' ? 'rgba(255,255,255,0.4)' : '#94A3B8',
                                  mb: 0.5,
                                  letterSpacing: '0.05em',
                                }}
                              >
                                Window
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 800,
                                  color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                                  fontSize: '0.85rem',
                                }}
                              >
                                {formatDateTime(row.scheduled_follow_up_at)} &rarr;{' '}
                                {formatDateTime(row.allowed_until)}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </PixelEyeCard>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* DRAWER: Reschedule Follow-up Date */}
      <Drawer
        anchor="right"
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 450 },
            bgcolor: mode === 'dark' ? '#0B1511' : '#FFFFFF',
            backgroundImage: 'none',
            p: 0,
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Calendar size={20} className="text-emerald-500" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
                Reschedule Follow-up
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 600, mt: -0.5, display: 'block' }}
              >
                Schedule a future callback for this lead
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setRescheduleOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
          {/* Lead Info Summary Card */}
          <Box
            sx={{
              p: 2.5,
              mb: 4,
              borderRadius: '20px',
              bgcolor: mode === 'dark' ? '#0B1511' : '#F8FAFC',
              border: '1px solid',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 900, color: mode === 'dark' ? 'white' : 'text.primary', mb: 1.5 }}
            >
              {lead?.customer_name || 'Lead Details'}
            </Typography>
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Phone size={14} style={{ color: '#22c55e' }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  {lead?.phone_number || 'No Phone'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <User size={14} style={{ color: '#22c55e' }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  Agent: {lead?.agent_name || '---'}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3.5, fontWeight: 600, lineHeight: 1.6 }}
          >
            Schedule a future callback for this lead. Specify a date to update the CRM reminder
            calendar.
          </Typography>

          <Stack spacing={4}>
            <Box>
              <PixelEyeDatePicker
                fullWidth={true}
                label="New follow-up date"
                value={rescheduleDate}
                onChange={(val) => setRescheduleDate(val)}
              />
              {rescheduleDate && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5, ml: 1 }}>
                  <Bell size={14} style={{ color: '#86EFAC' }} />
                  <Typography variant="caption" sx={{ color: '#86EFAC', fontWeight: 700 }}>
                    Reminder notification will be sent on{' '}
                    {dayjs(rescheduleDate).format('YYYY-MM-DD')} at 9:00 AM
                  </Typography>
                </Stack>
              )}
            </Box>

            <PixelEyeField
              fullWidth
              label="Reason for Reschedule"
              placeholder="e.g. Patient asked to call back next week..."
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              multiline
              rows={4}
              sx={getFieldSx(mode)}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            p: 3,
            borderTop: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              onClick={() => setRescheduleOpen(false)}
              variant="outlined"
              sx={{ borderRadius: '24px', textTransform: 'none', fontWeight: 700, py: 1.2 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleRescheduleSubmit}
              variant="contained"
              disabled={!rescheduleDate || rescheduleMutation.isLoading}
              sx={{
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 700,
                py: 1.2,
                boxShadow: 'none',
                bgcolor: '#156A45',
                '&:hover': { bgcolor: '#1C7A4C', boxShadow: 'none' },
              }}
            >
              {rescheduleMutation.isLoading ? 'Scheduling...' : 'Save Reschedule'}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* DRAWER: Mark Follow-up as Handled */}
      <Drawer
        anchor="right"
        open={markHandledOpen}
        onClose={() => setMarkHandledOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 450 },
            bgcolor: mode === 'dark' ? '#0B1511' : '#FFFFFF',
            backgroundImage: 'none',
            p: 0,
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <UserCheck size={20} className="text-emerald-500" />
            <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
              Mark as Handled
            </Typography>
          </Stack>
          <IconButton onClick={() => setMarkHandledOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
          {/* Lead Info Summary Card */}
          <Box
            sx={{
              p: 2.5,
              mb: 4,
              borderRadius: '20px',
              bgcolor: mode === 'dark' ? '#0B1511' : '#F8FAFC',
              border: '1px solid',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 900, color: mode === 'dark' ? 'white' : 'text.primary', mb: 1.5 }}
            >
              {lead?.customer_name || 'Lead Details'}
            </Typography>
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Phone size={14} style={{ color: '#22c55e' }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  {lead?.phone_number || 'No Phone'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <User size={14} style={{ color: '#22c55e' }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  Agent: {lead?.agent_name || '---'}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3.5, fontWeight: 600, lineHeight: 1.6 }}
          >
            Marking follow-up as Handled signals that the active reminder campaign has been
            answered. Please detail receptionist notes.
          </Typography>

          <PixelEyeField
            fullWidth
            label="Receptionist Call Summary notes"
            placeholder="Type customer call feedback notes / outcome..."
            value={handledReason}
            onChange={(e) => setHandledReason(e.target.value)}
            multiline
            rows={6}
            sx={getFieldSx(mode)}
          />
        </Box>

        <Box
          sx={{
            p: 3,
            borderTop: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              onClick={() => setMarkHandledOpen(false)}
              variant="outlined"
              sx={{ borderRadius: '24px', textTransform: 'none', fontWeight: 700, py: 1.2 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleMarkHandledSubmit}
              variant="contained"
              disabled={markHandledMutation.isLoading}
              sx={{
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 700,
                py: 1.2,
                boxShadow: 'none',
                bgcolor: '#156A45',
                '&:hover': { bgcolor: '#1C7A4C', boxShadow: 'none' },
              }}
            >
              {markHandledMutation.isLoading ? 'Marking...' : 'Mark Handled'}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* DRAWER: Cancel / Close Lead Follow-ups */}
      <Drawer
        anchor="right"
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 450 },
            bgcolor: mode === 'dark' ? '#0B1511' : '#FFFFFF',
            backgroundImage: 'none',
            p: 0,
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <XCircle size={20} className="text-red-500" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
                Close / Cancel Follow-up
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'error.main', fontWeight: 600, mt: -0.5, display: 'block' }}
              >
                Archive or close this reminder record
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setCancelOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
          {/* Lead Info Summary Card */}
          <Box
            sx={{
              p: 2.5,
              mb: 4,
              borderRadius: '20px',
              bgcolor: mode === 'dark' ? '#0B1511' : '#F8FAFC',
              border: '1px solid',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 900, color: mode === 'dark' ? 'white' : 'text.primary', mb: 1.5 }}
            >
              {lead?.customer_name || 'Lead Details'}
            </Typography>
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Phone size={14} style={{ color: '#ef4444' }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  {lead?.phone_number || 'No Phone'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <User size={14} style={{ color: '#ef4444' }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  Agent: {lead?.agent_name || '---'}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Stack spacing={4}>
            <PixelEyeField
              select
              fullWidth
              label="Close reason / status"
              value={cancelStatus}
              onChange={(e) => setCancelStatus(e.target.value)}
              sx={getFieldSx(mode)}
              SelectProps={{ MenuProps: getMenuProps(mode) }}
            >
              {TERMINATION_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </PixelEyeField>

            <PixelEyeField
              fullWidth
              label="Closure Notes"
              placeholder="Provide detailed notes for closing this lead..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              multiline
              rows={6}
              sx={getFieldSx(mode)}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            p: 3,
            borderTop: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FEF2F2',
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              onClick={() => setCancelOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                py: 1.2,
                flexGrow: 1,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCancelSubmit}
              variant="contained"
              disabled={!cancelStatus || cancelMutation.isLoading}
              sx={{
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                py: 1.2,
                flexGrow: 2,
                boxShadow: 'none',
                bgcolor: '#DC2626',
                '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
              }}
            >
              {cancelMutation.isLoading ? 'Processing...' : 'Close / Cancel'}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </PixelEyePageShell>
  );
};

export default PixelEyeLeadDetailPage;
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 600 }}>
//             Set a permanent terminal status. This action completely closes the customer record and
//             cancels all future automated reminder alerts.
//           </Typography>

//           <PixelEyeField
//             select
//             fullWidth
//             label="Terminal Outcome Status"
//             value={cancelStatus}
//             onChange={(e) => setCancelStatus(e.target.value)}
//             sx={{ mb: 3, ...getFieldSx(mode) }}
//             SelectProps={{ MenuProps: getMenuProps(mode) }}
//           >
//             {TERMINATION_STATUSES.map((s) => (
//               <MenuItem key={s} value={s}>
//                 {s}
//               </MenuItem>
//             ))}
//           </PixelEyeField>

//           <PixelEyeField
//             fullWidth
//             label="Cancellation Explanation notes"
//             placeholder="Type descriptive reasons for closing this campaign record..."
//             value={cancelReason}
//             onChange={(e) => setCancelReason(e.target.value)}
//             multiline
//             rows={3}
//             sx={getFieldSx(mode)}
//           />
//     </PixelEyePageShell >
//   );
// };

// export default PixelEyeLeadDetailPage;
