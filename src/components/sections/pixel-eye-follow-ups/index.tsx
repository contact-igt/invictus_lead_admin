import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  MenuItem,
  IconButton,
  Tooltip,
  Box,
  InputAdornment,
} from '@mui/material';
import useColorMode from 'hooks/useColorMode';
import { _axios } from 'helper/axios';
import IconifyIcon from 'components/base/IconifyIcon';
import { PixelEyePageShell } from '../pixel-eye/pixelEyeUi';
import type {
  LeadRecord,
  FollowUpBucketSection,
  FollowUpPageBuckets,
  FollowUpReminder,
} from '../pixel-eye-overview/types';
import { buildFollowUpPageBuckets } from '../pixel-eye-overview/dashboardUtils';
import {
  useMarkPixelEyeFollowUpHandledMutation,
  useCancelPixelEyeFollowUpMutation,
  useReschedulePixelEyeFollowUpMutation,
  usePixelEyeMissedFollowUpsQuery,
  type PixelEyeFollowUpCallComplianceRow,
} from 'components/hooks/usePixelEyeQuery';
import PixelEyeField from '../pixel-eye/PixelEyeField';
import PixelEyeDatePicker from '../pixel-eye/PixelEyeDatePicker';
import {
  NO_ACTION_STATUSES,
  TERMINATION_STATUSES,
  TWENTY_FOUR_HR_STATUSES,
  FORTY_EIGHT_HR_STATUSES,
} from '../pixel-eye/pixelEyeStatuses';

type FollowUpBucketKey = FollowUpBucketSection['key'] | 'missed';

type FollowUpDisplayItem = FollowUpReminder & {
  lead_id?: number | null;
  call_id?: string | null;
  scheduled_follow_up_at?: string | null;
  allowed_until?: string | null;
  compliance_status?: string | null;
  reason?: string | null;
  matched_call_log_id?: number | null;
  matched_call_id?: string | null;
  matched_call_started_at?: string | null;
  normalized_phone_number?: string | null;
};

type FollowUpBucketSectionView = Omit<FollowUpBucketSection, 'key' | 'leads'> & {
  key: FollowUpBucketKey;
  leads: FollowUpDisplayItem[];
};

const CANCEL_REASON_OPTIONS = [
  'Appointment Fixed',
  'Visited',
  'Not Interested',
  'Closed',
  'Wrong Number',
  'Wrongly Dialed',
  'Fraud Call',
  'Not Willing to Come Now',
  'Going to Other Hospital',
  'Not in Hyderabad',
  'Long Distance',
  'Number Not in Service',
  'Walk-in',
  'Other',
];

const terminalStatusSet = new Set(TERMINATION_STATUSES.map((status) => status.toLowerCase()));
const successStatusSet = new Set(NO_ACTION_STATUSES.map((status) => status.toLowerCase()));
const twentyFourHourStatusSet = new Set(
  TWENTY_FOUR_HR_STATUSES.map((status) => status.toLowerCase()),
);
const fortyEightHourStatusSet = new Set(
  FORTY_EIGHT_HR_STATUSES.map((status) => status.toLowerCase()),
);

const normalizeStatusText = (status?: string | null): string =>
  String(status || '').trim().toLowerCase();

const getWorkflowChipUi = (status?: string | null) => {
  const normalized = normalizeStatusText(status);
  if (successStatusSet.has(normalized)) {
    return { label: status || 'Won', color: '#10B981', background: 'rgba(16,185,129,0.12)' };
  }
  if (terminalStatusSet.has(normalized)) {
    return { label: status || 'Closed', color: '#EF4444', background: 'rgba(239,68,68,0.12)' };
  }
  if (twentyFourHourStatusSet.has(normalized)) {
    return { label: status || '24h follow-up', color: '#F59E0B', background: 'rgba(245,158,11,0.12)' };
  }
  if (fortyEightHourStatusSet.has(normalized)) {
    return { label: status || '48h follow-up', color: '#8B5CF6', background: 'rgba(139,92,246,0.12)' };
  }
  return {
    label: status || 'Active follow-up',
    color: '#06B6D4',
    background: 'rgba(6,182,212,0.12)',
  };
};

const fetchPixelEyeLeads = async (): Promise<LeadRecord[]> => {
  const response = await _axios('get', '/pixeleye');
  if (Array.isArray(response)) return response as LeadRecord[];
  if (Array.isArray(response?.data)) return response.data as LeadRecord[];
  return [];
};

const bucketAccent: Record<FollowUpBucketKey, string> = {
  overdue: '#EF4444', // Red-500
  today: '#F59E0B', // Amber-500
  tomorrow: '#3B82F6', // Blue-500
  week: '#10B981', // Emerald-500
  all: '#06B6D4', // Cyan-500
  missed: '#F43F5E', // Rose-500
};

const bucketIcons: Record<FollowUpBucketKey, string> = {
  overdue: 'mdi:alert-circle-outline',
  today: 'mdi:calendar-today',
  tomorrow: 'mdi:calendar-clock',
  week: 'mdi:calendar-range',
  all: 'mdi:calendar-multiple',
  missed: 'mdi:phone-missed',
};

const relativeLabel = (days: number): string => {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  return `In ${days} day${days === 1 ? '' : 's'}`;
};

const normalizeDateForCompare = (value?: string | null): string => {
  const text = String(value || '').trim();
  if (!text) return '';

  const directDate = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (directDate) return directDate[0];

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getFollowUpFilterDate = (lead: LeadRecord): string =>
  normalizeDateForCompare(lead.follow_up_date) ||
  normalizeDateForCompare(lead.reminder_scheduled_at);

// Extract YYYY-MM-DD from any date-like string for the date-only picker
const toDateValue = (value?: string | null): string => {
  const text = String(value || '').trim();
  if (!text) return '';
  // Already a plain date
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Build an ISO string for 9:00 AM local time on the given YYYY-MM-DD date
const buildNineAmISO = (dateStr: string): string => {
  return `${dateStr}T09:00:00+05:30`;
};

const isNineAmIstStillFuture = (dateStr: string): boolean => {
  const scheduledAt = new Date(buildNineAmISO(dateStr));
  return !Number.isNaN(scheduledAt.getTime()) && scheduledAt.getTime() > Date.now();
};

const getLocalTodayIso = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const daysBetweenIso = (fromIso: string, toIso: string): number => {
  const from = new Date(`${fromIso}T00:00:00`);
  const to = new Date(`${toIso}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  return Math.round((to.getTime() - from.getTime()) / 86400000);
};

const formatDisplayDateTime = (value?: string | null): string => {
  const text = String(value || '').trim();
  if (!text) return 'N/A';
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;

  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    }).format(parsed);
  } catch {
    return parsed.toLocaleString();
  }
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as {
      response?: {
        data?: {
          message?: unknown;
        };
      };
      message?: unknown;
    };

    if (typeof candidate.response?.data?.message === 'string') {
      return candidate.response.data.message;
    }

    if (typeof candidate.message === 'string') {
      return candidate.message;
    }
  }

  return fallback;
};

const toFollowUpDisplayItem = (
  row: LeadRecord | PixelEyeFollowUpCallComplianceRow,
  todayIso: string,
): FollowUpDisplayItem => {
  const followUpDate =
    normalizeDateForCompare((row as LeadRecord).follow_up_date) ||
    normalizeDateForCompare((row as PixelEyeFollowUpCallComplianceRow).scheduled_follow_up_date) ||
    normalizeDateForCompare((row as PixelEyeFollowUpCallComplianceRow).scheduled_follow_up_at) ||
    '';
  const leadId =
    typeof (row as PixelEyeFollowUpCallComplianceRow).lead_id === 'number' &&
      Number.isFinite((row as PixelEyeFollowUpCallComplianceRow).lead_id as number)
      ? ((row as PixelEyeFollowUpCallComplianceRow).lead_id as number)
      : (row as LeadRecord).id;

  return {
    id: leadId,
    lead_id:
      typeof (row as PixelEyeFollowUpCallComplianceRow).lead_id === 'number'
        ? ((row as PixelEyeFollowUpCallComplianceRow).lead_id as number)
        : null,
    call_id:
      (row as PixelEyeFollowUpCallComplianceRow).call_id ?? (row as LeadRecord).call_id ?? null,
    customer_name:
      (row as PixelEyeFollowUpCallComplianceRow).customer_name?.trim() ||
      (row as LeadRecord).customer_name?.trim() ||
      'Unknown customer',
    phone_number:
      (row as PixelEyeFollowUpCallComplianceRow).phone_number?.trim() ||
      (row as PixelEyeFollowUpCallComplianceRow).normalized_phone_number?.trim() ||
      (row as LeadRecord).phone_number?.trim() ||
      'N/A',
    agent_name:
      (row as PixelEyeFollowUpCallComplianceRow).agent_name?.trim() ||
      (row as LeadRecord).agent_name?.trim() ||
      'Unassigned',
    status:
      (row as PixelEyeFollowUpCallComplianceRow).compliance_status?.trim() ||
      (row as LeadRecord).status?.trim() ||
      'N/A',
    follow_up_date: followUpDate || (row as LeadRecord).follow_up_date || '',
    followup_state:
      (row as LeadRecord).followup_state ??
      (row as PixelEyeFollowUpCallComplianceRow).compliance_status ??
      null,
    source:
      (row as LeadRecord).source?.trim() ||
      (row as PixelEyeFollowUpCallComplianceRow).source?.trim() ||
      'RUNO_WEBHOOK',
    type_of_enquiry: (row as LeadRecord).type_of_enquiry?.trim() || '',
    daysRelative: daysBetweenIso(todayIso, followUpDate || todayIso),
    scheduled_follow_up_at:
      (row as PixelEyeFollowUpCallComplianceRow).scheduled_follow_up_at ?? null,
    allowed_until: (row as PixelEyeFollowUpCallComplianceRow).allowed_until ?? null,
    compliance_status: (row as PixelEyeFollowUpCallComplianceRow).compliance_status ?? null,
    reason: (row as PixelEyeFollowUpCallComplianceRow).reason ?? null,
    matched_call_log_id: (row as PixelEyeFollowUpCallComplianceRow).matched_call_log_id ?? null,
    matched_call_id: (row as PixelEyeFollowUpCallComplianceRow).matched_call_id ?? null,
    matched_call_started_at:
      (row as PixelEyeFollowUpCallComplianceRow).matched_call_started_at ?? null,
    normalized_phone_number:
      (row as PixelEyeFollowUpCallComplianceRow).normalized_phone_number ?? null,
  };
};

const PixelEyeFollowUpsPage: React.FC = () => {
  const { mode } = useColorMode();
  const [activeBucket, setActiveBucket] = useState<FollowUpBucketKey>('all');
  const [selectedLead, setSelectedLead] = useState<FollowUpDisplayItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const [hiddenLeadIds, setHiddenLeadIds] = useState<number[]>([]);
  const [handlingLeadId, setHandlingLeadId] = useState<number | null>(null);
  const [reschedulingLeadId, setReschedulingLeadId] = useState<number | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleLead, setRescheduleLead] = useState<FollowUpDisplayItem | null>(null);
  const [rescheduleFollowUpDate, setRescheduleFollowUpDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [cancellingLeadId, setCancellingLeadId] = useState<number | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLead, setCancelLead] = useState<FollowUpDisplayItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNotes, setCancelNotes] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const markHandledMutation = useMarkPixelEyeFollowUpHandledMutation();
  const cancelMutation = useCancelPixelEyeFollowUpMutation();
  const rescheduleMutation = useReschedulePixelEyeFollowUpMutation();
  const {
    data: missedFollowUpRows = [],
    isLoading: isMissedLoading,
    isError: isMissedError,
    error: missedError,
    refetch: refetchMissedFollowUps,
  } = usePixelEyeMissedFollowUpsQuery();

  const {
    data: allLeads = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<LeadRecord[]>(['pixelEyeLeads'], fetchPixelEyeLeads, {
    staleTime: 3 * 60 * 1000,
    refetchOnMount: 'always',
  });

  const dateFilteredLeads = useMemo(() => {
    return allLeads.filter((lead) => {
      if (hiddenLeadIds.includes(lead.id)) return false;
      if (!dateFrom && !dateTo) return true;

      const leadDate = getFollowUpFilterDate(lead);
      if (!leadDate) return false;
      if (dateFrom && leadDate < dateFrom) return false;
      if (dateTo && leadDate > dateTo) return false;
      return true;
    });
  }, [allLeads, dateFrom, dateTo, hiddenLeadIds]);

  const todayIso = useMemo(() => getLocalTodayIso(), []);

  const missedFollowUps = useMemo<FollowUpDisplayItem[]>(
    () => missedFollowUpRows.map((row) => toFollowUpDisplayItem(row, todayIso)),
    [missedFollowUpRows, todayIso],
  );

  const followUpBuckets = useMemo<FollowUpPageBuckets>(
    () => buildFollowUpPageBuckets(dateFilteredLeads),
    [dateFilteredLeads],
  );

  const sections: FollowUpBucketSectionView[] = useMemo(
    () => [
      {
        key: 'all',
        label: 'All Follow-ups',
        count: followUpBuckets.allCount,
        accent: bucketAccent.all,
        leads: followUpBuckets.allLeads,
      },
      {
        key: 'overdue',
        label: 'Overdue',
        count: followUpBuckets.overdueCount,
        accent: bucketAccent.overdue,
        leads: followUpBuckets.overdueLeads,
      },
      {
        key: 'today',
        label: 'Today',
        count: followUpBuckets.todayCount,
        accent: bucketAccent.today,
        leads: followUpBuckets.todayLeads,
      },
      {
        key: 'tomorrow',
        label: 'Tomorrow',
        count: followUpBuckets.tomorrowCount,
        accent: bucketAccent.tomorrow,
        leads: followUpBuckets.tomorrowLeads,
      },
      {
        key: 'week',
        label: 'This Week',
        count: followUpBuckets.weekCount,
        accent: bucketAccent.week,
        leads: followUpBuckets.weekLeads,
      },
      {
        key: 'missed',
        label: 'Missed Follow-up Calls',
        count: missedFollowUps.length,
        accent: bucketAccent.missed,
        leads: missedFollowUps,
      },
    ],
    [followUpBuckets, missedFollowUps],
  );

  const activeLeads = useMemo<FollowUpDisplayItem[]>(() => {
    const bucket = sections.find((s) => s.key === activeBucket);
    const leads = bucket ? bucket.leads : [];
    if (!searchQuery.trim()) return leads;
    const query = searchQuery.toLowerCase();
    return leads.filter(
      (l) =>
        (l.customer_name || '').toLowerCase().includes(query) ||
        (l.phone_number || '').includes(query) ||
        (l.agent_name || '').toLowerCase().includes(query) ||
        (l.reason || '').toLowerCase().includes(query) ||
        (l.compliance_status || '').toLowerCase().includes(query),
    );
  }, [sections, activeBucket, searchQuery]);

  const hasAnyFollowUps =
    followUpBuckets.allCount > 0 || missedFollowUps.length > 0 || isMissedLoading;

  useEffect(() => {
    if (activeLeads.length > 0) {
      const stillInList = activeLeads.some((l) => l.id === selectedLead?.id);
      if (!stillInList) {
        setSelectedLead(activeLeads[0]);
      } else {
        const fresh = activeLeads.find((l) => l.id === selectedLead?.id);
        if (fresh) setSelectedLead(fresh);
      }
    } else {
      setSelectedLead(null);
    }
  }, [activeBucket, activeLeads]);

  useEffect(() => {
    if (followUpBuckets.allCount === 0 && missedFollowUps.length > 0 && activeBucket === 'all') {
      setActiveBucket('missed');
    }
  }, [activeBucket, followUpBuckets.allCount, missedFollowUps.length]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([refetch(), refetchMissedFollowUps()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  const handleCopyPhone = (phone?: string, id?: number) => {
    if (!phone || !id) return;
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLeadActionId = (lead: FollowUpDisplayItem): number => {
    if (typeof lead.lead_id === 'number' && Number.isFinite(lead.lead_id)) {
      return lead.lead_id;
    }
    return lead.id;
  };

  const hasLeadActionTarget = (lead: FollowUpDisplayItem): boolean => {
    if (activeBucket !== 'missed') return Number.isFinite(lead.id);
    return typeof lead.lead_id === 'number' && Number.isFinite(lead.lead_id);
  };

  const hasScheduledReminder = (lead: FollowUpDisplayItem): boolean =>
    normalizeStatusText(lead.followup_state) === 'scheduled';

  const refetchFollowUpQueues = async () => {
    await Promise.allSettled([refetch(), refetchMissedFollowUps()]);
  };

  const handleMarkFollowedUp = async (leadId: number) => {
    setHandlingLeadId(leadId);
    try {
      await markHandledMutation.mutateAsync({ id: leadId, reason: 'followed_up' });
      setHiddenLeadIds((prev) => (prev.includes(leadId) ? prev : [...prev, leadId]));
      await refetchFollowUpQueues();
    } catch (err) {
      // Handled globally or shows in snackbar
    } finally {
      setHandlingLeadId(null);
    }
  };

  const handleOpenReschedule = (lead: FollowUpDisplayItem) => {
    setRescheduleLead(lead);
    // Pre-fill with existing follow-up date (date-only, YYYY-MM-DD)
    setRescheduleFollowUpDate(toDateValue(lead.follow_up_date));
    setRescheduleReason('');
    setRescheduleError('');
    setReschedulingLeadId(getLeadActionId(lead));
    setRescheduleDialogOpen(true);
  };

  const handleCloseReschedule = () => {
    setRescheduleDialogOpen(false);
    setRescheduleLead(null);
    setRescheduleFollowUpDate('');
    setRescheduleReason('');
    setRescheduleError('');
    setReschedulingLeadId(null);
  };

  const handleOpenCancel = (lead: FollowUpDisplayItem) => {
    setCancelLead(lead);
    setCancelReason('');
    setCancelNotes('');
    setCancelError('');
    setCancellingLeadId(getLeadActionId(lead));
    setCancelDialogOpen(true);
  };

  const handleCloseCancel = () => {
    setCancelDialogOpen(false);
    setCancelLead(null);
    setCancelReason('');
    setCancelNotes('');
    setCancelError('');
    setCancellingLeadId(null);
  };

  const handleSubmitReschedule = async () => {
    if (!rescheduleLead) return;

    const rawDate = String(rescheduleFollowUpDate || '').trim();
    if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      setRescheduleError('Please select a valid follow-up date.');
      return;
    }

    if (!isNineAmIstStillFuture(rawDate)) {
      setRescheduleError('Select a future date/time. The reminder is fixed at 9:00 AM IST.');
      return;
    }

    // Always schedule reminder at 9:00 AM on the selected date
    const followUpISO = buildNineAmISO(rawDate);

    setRescheduleError('');

    try {
      await rescheduleMutation.mutateAsync({
        id: getLeadActionId(rescheduleLead),
        follow_up_date: followUpISO,
        reason: rescheduleReason.trim() || 'Rescheduled from follow-up queue',
      });
      await refetchFollowUpQueues();
      handleCloseReschedule();
    } catch (err) {
      setRescheduleError(getErrorMessage(err, 'Failed to reschedule'));
    }
  };

  const handleSubmitCancel = async () => {
    if (!cancelLead) return;

    const selectedReason = String(cancelReason || '').trim();
    const notes = String(cancelNotes || '').trim();

    if (!selectedReason && !notes) {
      setCancelError('Please choose a close reason or add notes.');
      return;
    }

    setCancelError('');

    const payloadStatus =
      selectedReason === 'Other' ? notes || undefined : selectedReason || undefined;
    const payloadReason = notes || selectedReason || 'Follow-up cancelled';

    try {
      await cancelMutation.mutateAsync({
        id: getLeadActionId(cancelLead),
        status: payloadStatus,
        reason: payloadReason,
      });
      const cancelId = getLeadActionId(cancelLead);
      setHiddenLeadIds((prev) => (prev.includes(cancelId) ? prev : [...prev, cancelId]));
      await refetchFollowUpQueues();
      handleCloseCancel();
    } catch (err) {
      setCancelError(getErrorMessage(err, 'Failed to cancel follow-up'));
    }
  };

  return (
    <PixelEyePageShell>
      <Box className="flex flex-col gap-6 w-full">
        <div
          className={`rounded-[22px] border p-5 md:p-6 shadow-xl relative transition-all duration-300 ${mode === 'dark'
            ? 'border-[#1E2E25] bg-[linear-gradient(135deg,#0B1511_0%,#0E1814_50%,#08110D_100%)] shadow-black/30'
            : 'border-slate-200/80 bg-white shadow-slate-100'
            }`}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.18em] bg-emerald-500/10 text-[#4ade80]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                PIXELEYE FOLLOW-UPS
              </div>
              <h1
                className={`mt-3 text-3xl font-black tracking-tight md:text-4xl ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
              >
                Follow-up Queue
              </h1>
              <p
                className={`mt-2 max-w-2xl text-sm leading-relaxed ${mode === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}
              >
                Stay organized and convert more patients. Follow up on active leads categorized by
                urgency and lead status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <PixelEyeDatePicker
                label="From Date"
                value={dateFrom}
                maxDate={dateTo || undefined}
                sx={{ width: { xs: 150, sm: 160 } }}
                onChange={(newFrom) => {
                  setDateFrom(newFrom);
                  if (dateTo && newFrom > dateTo) {
                    setDateTo(newFrom);
                  }
                }}
              />
              <PixelEyeDatePicker
                label="To Date"
                value={dateTo}
                minDate={dateFrom || undefined}
                disabled={!dateFrom}
                sx={{ width: { xs: 150, sm: 160 } }}
                onChange={(newTo) => setDateTo(newTo)}
              />
              {(dateFrom || dateTo) && (
                <Button
                  variant="text"
                  onClick={handleClearDateFilter}
                  sx={{
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontWeight: 600,
                    color: mode === 'dark' ? '#94A3B8' : '#475569',
                  }}
                >
                  Clear
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={handleRefresh}
                disabled={isRefreshing}
                startIcon={
                  <IconifyIcon icon="mdi:refresh" className={isRefreshing ? 'animate-spin' : ''} />
                }
                sx={{
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: mode === 'dark' ? '#1F3A2D' : '#E2E8F0',
                  color: mode === 'dark' ? '#DFFFE3' : '#0F5738',
                  backgroundColor: mode === 'dark' ? '#102118' : 'white',
                  '&:hover': {
                    borderColor: '#156A45',
                    backgroundColor: mode === 'dark' ? '#14261D' : '#F8FAFC',
                  },
                }}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* --- Bucket Tabs Selector Bar --- */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 relative z-10">
            {sections.map((section) => {
              const isActive = activeBucket === section.key;

              return (
                <button
                  key={section.key}
                  onClick={() => {
                    setActiveBucket(section.key);
                    setMobileView('list');
                  }}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 group relative ${isActive
                    ? mode === 'dark'
                      ? 'border-[#22C55E] bg-[#10241A] shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                      : 'border-[#156A45] bg-[#E8F5E9]/50 shadow-sm'
                    : mode === 'dark'
                      ? 'border-[#15271E] bg-[#070D0A] hover:bg-[#0A1410] hover:border-[#1F3E30]'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <IconifyIcon
                      icon={bucketIcons[section.key]}
                      sx={{
                        fontSize: 20,
                        color: isActive ? section.accent : mode === 'dark' ? '#4B6356' : '#94A3B8',
                        transition: 'transform 0.2s',
                        '.group:hover &': { transform: 'scale(1.1)' },
                      }}
                    />
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: section.accent,
                        boxShadow: `0 0 8px ${section.accent}CC`,
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider block ${isActive
                        ? mode === 'dark'
                          ? 'text-[#4ade80]'
                          : 'text-[#156A45]'
                        : mode === 'dark'
                          ? 'text-[#94A3B8]'
                          : 'text-slate-500'
                        }`}
                    >
                      {section.label}
                    </span>
                    <span
                      className={`text-2xl font-bold mt-1 block ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
                    >
                      {section.count.toLocaleString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {isError && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: '16px' }}>
            Failed to load follow-up leads: {getErrorMessage(error, 'Unknown error')}
          </Alert>
        )}

        {isMissedError && (
          <Alert severity="warning" sx={{ mt: 2.5, borderRadius: '16px' }}>
            Failed to load missed follow-up calls: {getErrorMessage(missedError, 'Unknown error')}
          </Alert>
        )}

        {/* --- Main Workspace Content --- */}
        {isLoading ? (
          <div className="mt-8 flex flex-col items-center justify-center py-20">
            <CircularProgress size={40} sx={{ color: '#156A45' }} />
            <span
              className={`mt-4 text-sm font-medium ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Loading follow-up pipeline...
            </span>
          </div>
        ) : !hasAnyFollowUps ? (
          <div
            className={`mt-8 rounded-3xl border p-12 text-center shadow-sm ${mode === 'dark' ? 'border-[#13251D] bg-[#0B1410]' : 'border-slate-200 bg-white'
              }`}
          >
            <div className="flex justify-center mb-4">
              <div
                className={`p-4 rounded-full ${mode === 'dark' ? 'bg-[#12241A]' : 'bg-green-50'}`}
              >
                <IconifyIcon icon="mdi:calendar-check" sx={{ fontSize: 48, color: '#10B981' }} />
              </div>
            </div>
            <h3
              className={`text-xl font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              Zero follow-ups left
            </h3>
            <p
              className={`mt-2 text-sm max-w-md mx-auto ${mode === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}
            >
              All reminders are completed. Leads with scheduled follow-up dates will populate here
              automatically.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* --- Left Column: List Pane --- */}
            <div
              className={`lg:col-span-5 flex flex-col ${mobileView === 'list' ? 'block' : 'hidden'} lg:block`}
            >
              <div
                className={`rounded-2xl border p-4 shadow-sm flex flex-col h-[48rem] ${mode === 'dark' ? 'border-[#13251D] bg-[#0B1410]' : 'border-slate-200 bg-white'
                  }`}
              >
                {/* Search Bar */}
                <Box sx={{ mb: 2 }}>
                  <PixelEyeField
                    fullWidth
                    placeholder="Search name, phone, agent..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ color: 'text.secondary', ml: 0.5 }}>
                          <IconifyIcon icon="mdi:magnify" sx={{ fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchQuery('')}>
                            <IconifyIcon icon="mdi:close-circle" sx={{ fontSize: 16 }} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Leads Queue List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {activeBucket === 'missed' && isMissedLoading ? (
                    <div
                      className={`py-14 text-center rounded-xl border ${mode === 'dark' ? 'border-[#14241C] bg-[#060B08]' : 'border-slate-200 bg-slate-50/40'}`}
                    >
                      <CircularProgress size={26} sx={{ color: '#F43F5E' }} />
                      <p
                        className={`mt-3 text-sm font-medium ${mode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
                      >
                        Loading missed follow-up calls...
                      </p>
                    </div>
                  ) : activeLeads.length > 0 ? (
                    activeLeads.map((lead) => {
                      const isSelected = selectedLead?.id === lead.id;
                      const accent = bucketAccent[activeBucket];
                      return (
                        <button
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setMobileView('detail');
                          }}
                          className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 relative overflow-hidden group ${isSelected
                            ? mode === 'dark'
                              ? 'border-[#22C55E] bg-[#10241A]/70'
                              : 'border-[#156A45] bg-[#E8F5E9]/30'
                            : mode === 'dark'
                              ? 'border-[#15271E] bg-[#070D0A] hover:bg-[#0A1410] hover:border-[#1F3E30]'
                              : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200'
                            }`}
                        >
                          {/* Accent highlight strip on selected card */}
                          {isSelected && (
                            <div
                              className="absolute top-0 bottom-0 left-0 w-1"
                              style={{ backgroundColor: accent }}
                            />
                          )}

                          {/* Avatar Initials */}
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${mode === 'dark'
                              ? 'bg-[#152920] text-[#4ade80]'
                              : 'bg-emerald-50 text-emerald-800'
                              }`}
                          >
                            {(lead.customer_name || 'U')
                              .split(' ')
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`font-semibold text-sm truncate ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
                              >
                                {lead.customer_name || 'Unknown customer'}
                              </span>
                              <span
                                className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md"
                                style={{
                                  color: accent,
                                  backgroundColor: `${accent}15`,
                                  border: `1px solid ${accent}30`,
                                }}
                              >
                                {lead.status || 'N/A'}
                              </span>
                            </div>

                            <div
                              className={`text-xs mt-1 truncate ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                            >
                              {lead.phone_number || 'N/A'}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 mt-3">
                              <span
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${mode === 'dark'
                                  ? 'bg-[#0E1B15] text-[#A7F3D0]'
                                  : 'bg-slate-100 text-slate-600'
                                  }`}
                              >
                                {lead.follow_up_date ? relativeLabel(lead.daysRelative) : 'No date'}
                              </span>
                              {lead.agent_name && (
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${mode === 'dark'
                                    ? 'bg-[#060D0A] text-slate-400'
                                    : 'bg-slate-50 text-slate-500'
                                    }`}
                                >
                                  {lead.agent_name}
                                </span>
                              )}
                              {activeBucket === 'missed' && lead.compliance_status && (
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${mode === 'dark'
                                    ? 'bg-[#12080E] text-[#FDA4AF]'
                                    : 'bg-rose-50 text-rose-700'
                                    }`}
                                >
                                  {lead.compliance_status}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : activeBucket === 'missed' ? (
                    <div className="py-12 text-center text-sm text-slate-400 border border-dashed border-slate-200/50 rounded-xl">
                      {searchQuery.trim()
                        ? 'No missed follow-up calls match your search.'
                        : 'No missed follow-up calls.'}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-sm text-slate-400 border border-dashed border-slate-200/50 rounded-xl">
                      No results matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- Right Column: Details Pane --- */}
            <div
              className={`lg:col-span-7 flex flex-col ${mobileView === 'detail' ? 'block' : 'hidden'} lg:block`}
            >
              {selectedLead ? (
                <div
                  className={`rounded-2xl border p-6 shadow-sm flex flex-col h-[48rem] justify-between ${mode === 'dark' ? 'border-[#13251D] bg-[#0B1410]' : 'border-slate-200 bg-white'
                    }`}
                >
                  {/* Top content block */}
                  <div className="space-y-6">
                    {/* Back Button (Mobile Only) */}
                    <div className="lg:hidden flex items-center mb-4">
                      <Button
                        size="small"
                        onClick={() => setMobileView('list')}
                        startIcon={<IconifyIcon icon="mdi:arrow-left" />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          color: mode === 'dark' ? '#4ade80' : '#156A45',
                        }}
                      >
                        Back to Queue List
                      </Button>
                    </div>

                    {/* Profile Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/10">
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm ${mode === 'dark'
                            ? 'bg-[#13251D] text-[#DFFFE3]'
                            : 'bg-emerald-50 text-emerald-900'
                            }`}
                        >
                          {(selectedLead.customer_name || 'U')
                            .split(' ')
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <h2
                            className={`text-xl font-bold tracking-tight ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
                          >
                            {selectedLead.customer_name || 'Unknown Customer'}
                          </h2>
                          <div
                            className={`flex items-center gap-2 mt-1 text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            <span>{selectedLead.phone_number || 'N/A'}</span>
                            {selectedLead.phone_number && (
                              <Tooltip
                                title={copiedId === selectedLead.id ? 'Copied!' : 'Copy Phone'}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleCopyPhone(selectedLead.phone_number, selectedLead.id)
                                  }
                                  sx={{ p: 0.5, color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
                                >
                                  <IconifyIcon
                                    icon={
                                      copiedId === selectedLead.id
                                        ? 'mingcute:check-fill'
                                        : 'hugeicons:copy-01'
                                    }
                                    sx={{ fontSize: 15 }}
                                  />
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-start gap-2">
                        <Chip
                          label={getWorkflowChipUi(selectedLead.status).label}
                          sx={{
                            backgroundColor: getWorkflowChipUi(selectedLead.status).background,
                            color: getWorkflowChipUi(selectedLead.status).color,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            border: `1px solid ${getWorkflowChipUi(selectedLead.status).color}55`,
                          }}
                        />
                        <Chip
                          label={selectedLead.follow_up_date || 'No Date'}
                          icon={<IconifyIcon icon="mdi:clock-outline" />}
                          sx={{
                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                            color: mode === 'dark' ? '#E2E8F0' : '#475569',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Information Grid details */}
                    <div className="space-y-4 pt-2">
                      <h3
                        className={`text-xs font-bold uppercase tracking-widest ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                      >
                        Lead Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          className={`p-4 rounded-xl border ${mode === 'dark' ? 'bg-[#070D0A] border-slate-200/10' : 'bg-slate-50/50 border-slate-100'}`}
                        >
                          <div className="text-xs text-slate-400 font-medium">Assigned Agent</div>
                          <div
                            className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                          >
                            <IconifyIcon
                              icon="mdi:account-tie"
                              sx={{ color: '#10B981', fontSize: 16 }}
                            />
                            {selectedLead.agent_name || 'Unassigned'}
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-xl border ${mode === 'dark' ? 'bg-[#070D0A] border-slate-200/10' : 'bg-slate-50/50 border-slate-100'}`}
                        >
                          <div className="text-xs text-slate-400 font-medium">Lead Source</div>
                          <div
                            className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                          >
                            <IconifyIcon icon="mdi:web" sx={{ color: '#3B82F6', fontSize: 16 }} />
                            {selectedLead.source || 'Direct / Organic'}
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-xl border ${mode === 'dark' ? 'bg-[#070D0A] border-slate-200/10' : 'bg-slate-50/50 border-slate-100'}`}
                        >
                          <div className="text-xs text-slate-400 font-medium">Enquiry Type</div>
                          <div
                            className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                          >
                            <IconifyIcon
                              icon="mdi:notebook-edit-outline"
                              sx={{ color: '#F59E0B', fontSize: 16 }}
                            />
                            {selectedLead.type_of_enquiry || 'Not Specified'}
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-xl border ${mode === 'dark' ? 'bg-[#070D0A] border-slate-200/10' : 'bg-slate-50/50 border-slate-100'}`}
                        >
                          <div className="text-xs text-slate-400 font-medium">Days Relative</div>
                          <div
                            className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                          >
                            <IconifyIcon
                              icon="mdi:calendar-today"
                              sx={{ color: '#EC4899', fontSize: 16 }}
                            />
                            {selectedLead.follow_up_date
                              ? relativeLabel(selectedLead.daysRelative)
                              : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {(activeBucket === 'missed' || selectedLead.compliance_status) && (
                        <div
                          className={`p-4 rounded-xl border ${mode === 'dark' ? 'bg-[#070D0A] border-slate-200/10' : 'bg-slate-50/50 border-slate-100'}`}
                        >
                          <div className="text-xs text-slate-400 font-medium">
                            Compliance Details
                          </div>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-slate-400 font-medium">
                                Compliance Status
                              </div>
                              <div
                                className={`text-sm font-semibold mt-1 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                              >
                                {selectedLead.compliance_status || 'MISSED'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 font-medium">Reason</div>
                              <div
                                className={`text-sm font-semibold mt-1 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                              >
                                {selectedLead.reason || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 font-medium">
                                Scheduled Follow-up Date
                              </div>
                              <div
                                className={`text-sm font-semibold mt-1 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                              >
                                {selectedLead.follow_up_date || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 font-medium">
                                Scheduled Follow-up At
                              </div>
                              <div
                                className={`text-sm font-semibold mt-1 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                              >
                                {formatDisplayDateTime(
                                  selectedLead.scheduled_follow_up_at ||
                                  selectedLead.follow_up_date,
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 font-medium">
                                Allowed Until
                              </div>
                              <div
                                className={`text-sm font-semibold mt-1 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                              >
                                {formatDisplayDateTime(selectedLead.allowed_until)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 font-medium">Matched Call</div>
                              <div
                                className={`text-sm font-semibold mt-1 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                              >
                                {selectedLead.matched_call_id || selectedLead.call_id || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Section footer */}
                  <div className="pt-6 border-t border-slate-200/10">
                    {!hasLeadActionTarget(selectedLead) ? (
                      <div
                        className={`p-4 rounded-xl border text-center ${mode === 'dark'
                          ? 'bg-[#070D0A] border-[#15271E] text-[#DFFFE3]'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                      >
                        This missed call has no linked lead record yet. Create or match the lead
                        before rescheduling, handling, or closing it.
                      </div>
                    ) : activeBucket === 'missed' ? (
                      <div className="flex flex-col sm:flex-row gap-3 justify-end w-full">
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleOpenCancel(selectedLead)}
                          disabled={
                            cancellingLeadId === selectedLead.id ||
                            reschedulingLeadId === selectedLead.id
                          }
                          startIcon={<IconifyIcon icon="mdi:close-circle-outline" />}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3.5,
                            py: 1.5,
                            borderColor: mode === 'dark' ? '#7F1D1D' : '#FCA5A5',
                            color: mode === 'dark' ? '#FCA5A5' : '#B91C1C',
                            '&:hover': {
                              borderColor: '#DC2626',
                              backgroundColor: mode === 'dark' ? 'rgba(220,38,38,0.08)' : '#FEF2F2',
                            },
                          }}
                        >
                          Close / Cancel
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenReschedule(selectedLead)}
                          disabled={
                            reschedulingLeadId === selectedLead.id ||
                            cancellingLeadId === selectedLead.id
                          }
                          startIcon={<IconifyIcon icon="mdi:calendar-clock" />}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3.5,
                            py: 1.5,
                            borderColor: mode === 'dark' ? '#2F4D3F' : '#A7F3D0',
                            color: mode === 'dark' ? '#A7F3D0' : '#0F5738',
                            '&:hover': {
                              borderColor: '#156A45',
                              backgroundColor: mode === 'dark' ? 'rgba(21,106,69,0.08)' : '#ECFDF5',
                            },
                          }}
                        >
                          Reschedule
                        </Button>
                      </div>
                    ) : selectedLead.followup_state !== 'completed' &&
                      selectedLead.followup_state !== 'cancelled' ? (
                      <div className="flex flex-col sm:flex-row gap-3 justify-end w-full">
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleOpenCancel(selectedLead)}
                          disabled={
                            cancellingLeadId === selectedLead.id ||
                            handlingLeadId === selectedLead.id ||
                            reschedulingLeadId === selectedLead.id
                          }
                          startIcon={<IconifyIcon icon="mdi:close-circle-outline" />}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3.5,
                            py: 1.5,
                            borderColor: mode === 'dark' ? '#7F1D1D' : '#FCA5A5',
                            color: mode === 'dark' ? '#FCA5A5' : '#B91C1C',
                            '&:hover': {
                              borderColor: '#DC2626',
                              backgroundColor: mode === 'dark' ? 'rgba(220,38,38,0.08)' : '#FEF2F2',
                            },
                          }}
                        >
                          Close / Cancel
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenReschedule(selectedLead)}
                          disabled={
                            reschedulingLeadId === selectedLead.id ||
                            handlingLeadId === selectedLead.id
                          }
                          startIcon={<IconifyIcon icon="mdi:calendar-clock" />}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3.5,
                            py: 1.5,
                            borderColor: mode === 'dark' ? '#2F4D3F' : '#A7F3D0',
                            color: mode === 'dark' ? '#A7F3D0' : '#0F5738',
                            '&:hover': {
                              borderColor: '#156A45',
                              backgroundColor: mode === 'dark' ? 'rgba(21,106,69,0.08)' : '#ECFDF5',
                            },
                          }}
                        >
                          Reschedule
                        </Button>
                        {hasScheduledReminder(selectedLead) ? (
                          <Button
                            variant="contained"
                            onClick={() => handleMarkFollowedUp(getLeadActionId(selectedLead))}
                            disabled={
                              handlingLeadId === selectedLead.id ||
                              reschedulingLeadId === selectedLead.id ||
                              cancellingLeadId === selectedLead.id
                            }
                            startIcon={
                              handlingLeadId === selectedLead.id ? (
                                <CircularProgress size={14} sx={{ color: '#fff' }} />
                              ) : (
                                <IconifyIcon icon="mdi:check-circle" />
                              )
                            }
                            sx={{
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 3.5,
                              py: 1.5,
                              backgroundColor: '#156A45',
                              '&:hover': { backgroundColor: '#0F5738' },
                            }}
                          >
                            {handlingLeadId === selectedLead.id ? 'Marking...' : 'Mark Handled'}
                          </Button>
                        ) : (
                          <Tooltip title="Mark handled is available only after a reminder is scheduled.">
                            <span>
                              <Button
                                variant="contained"
                                disabled
                                startIcon={<IconifyIcon icon="mdi:clock-alert-outline" />}
                                sx={{
                                  borderRadius: '12px',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 3.5,
                                  py: 1.5,
                                }}
                              >
                                Schedule First
                              </Button>
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`p-4 rounded-xl border text-center ${mode === 'dark'
                          ? 'bg-[#070D0A] border-[#15271E] text-[#DFFFE3]'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                      >
                        Follow-up state is <strong>{selectedLead.followup_state}</strong>. No
                        actions available.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`rounded-2xl border p-6 flex flex-col justify-center items-center h-[48rem] text-center shadow-sm ${mode === 'dark'
                    ? 'border-[#13251D] bg-[#0B1410] text-slate-400'
                    : 'border-slate-200 bg-white text-slate-500'
                    }`}
                >
                  <div
                    className={`p-4 rounded-full mb-4 ${mode === 'dark' ? 'bg-[#12241A]' : 'bg-green-50'}`}
                  >
                    <IconifyIcon
                      icon="mdi:calendar-multiple-check"
                      sx={{ fontSize: 48, color: '#10B981' }}
                    />
                  </div>
                  <h3
                    className={`text-lg font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                  >
                    No patient lead selected
                  </h3>
                  <p className="mt-2 text-sm max-w-sm">
                    Select a follow-up lead from the queue pane to view details, copy phone
                    credentials, and take direct actions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Box>

      {/* --- Reschedule Drawer --- */}
      <Drawer
        anchor="right"
        open={rescheduleDialogOpen}
        onClose={handleCloseReschedule}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 480 },
            borderLeft: mode === 'dark' ? '1px solid #1C3429' : '1px solid #E2E8F0',
            backgroundColor: mode === 'dark' ? '#0B1410' : '#ffffff',
            boxShadow:
              mode === 'dark' ? '-10px 0 35px rgba(0,0,0,0.5)' : '-10px 0 35px rgba(0,0,0,0.05)',
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-5 border-b shrink-0 ${mode === 'dark' ? 'border-[#14241C]' : 'border-slate-100'
            }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${mode === 'dark' ? 'bg-[#12241A] text-[#10B981]' : 'bg-emerald-50 text-emerald-800'}`}
            >
              <IconifyIcon icon="mdi:calendar-clock" sx={{ fontSize: 20 }} />
            </div>
            <div>
              <h3
                className={`text-lg font-bold tracking-tight ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
              >
                Reschedule Follow-up
              </h3>
              <p
                className={`text-xs ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}
              >
                Schedule a future callback for this lead
              </p>
            </div>
          </div>
          <IconButton
            onClick={handleCloseReschedule}
            size="small"
            sx={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
          >
            <IconifyIcon icon="mdi:close" sx={{ fontSize: 20 }} />
          </IconButton>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Customer Summary Card */}
          <div
            className={`p-4 rounded-xl border ${mode === 'dark' ? 'bg-[#060B08] border-[#14241C]' : 'bg-slate-50 border-slate-100'
              }`}
          >
            <div
              className={`text-sm font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              {rescheduleLead?.customer_name || 'Unknown customer'}
            </div>
            <div
              className={`mt-2 text-xs ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'} space-y-1.5`}
            >
              <div className="flex items-center gap-2">
                <IconifyIcon icon="mdi:phone" sx={{ fontSize: 14, color: '#10B981' }} />
                <span>{rescheduleLead?.phone_number || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconifyIcon icon="mdi:account" sx={{ fontSize: 14, color: '#3B82F6' }} />
                <span>Agent: {rescheduleLead?.agent_name || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <PixelEyeField
              label="New follow-up date"
              type="date"
              value={rescheduleFollowUpDate}
              onChange={(event) => {
                setRescheduleFollowUpDate(event.target.value);
                setRescheduleError('');
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText={
                rescheduleFollowUpDate
                  ? `📅 Reminder notification will be sent on ${rescheduleFollowUpDate} at 9:00 AM`
                  : 'Select a date — notification auto-sends at 9:00 AM on that day'
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
                '& .MuiFormHelperText-root': {
                  marginTop: '6px',
                  fontSize: '0.75rem',
                  color: rescheduleFollowUpDate
                    ? mode === 'dark'
                      ? '#4ade80'
                      : '#156A45'
                    : mode === 'dark'
                      ? '#64748B'
                      : '#94A3B8',
                },
              }}
            />

            <PixelEyeField
              label="Reason for Reschedule"
              value={rescheduleReason}
              onChange={(event) => setRescheduleReason(event.target.value)}
              placeholder="e.g. Patient asked to call back next week"
              fullWidth
              multiline
              minRows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </div>

          {rescheduleError && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {rescheduleError}
            </Alert>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-5 border-t shrink-0 flex items-center justify-end gap-3 ${mode === 'dark' ? 'border-[#14241C]' : 'border-slate-100'
            }`}
        >
          <Button
            onClick={handleCloseReschedule}
            variant="outlined"
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderColor: mode === 'dark' ? '#1C3429' : '#CBD5E1',
              color: mode === 'dark' ? '#E2E8F0' : '#475569',
              '&:hover': {
                borderColor: mode === 'dark' ? '#2B4D3D' : '#94A3B8',
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReschedule}
            variant="contained"
            disabled={rescheduleMutation.isLoading}
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              backgroundColor: '#156A45',
              '&:hover': { backgroundColor: '#0F5738' },
            }}
          >
            {rescheduleMutation.isLoading ? (
              <span className="flex items-center gap-2">
                <CircularProgress size={14} sx={{ color: '#fff' }} />
                Saving...
              </span>
            ) : (
              'Save reschedule'
            )}
          </Button>
        </div>
      </Drawer>

      {/* --- Cancel/Close Drawer --- */}
      <Drawer
        anchor="right"
        open={cancelDialogOpen}
        onClose={handleCloseCancel}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 480 },
            borderLeft: mode === 'dark' ? '1px solid #3A1C1C' : '1px solid #FEE2E2',
            backgroundColor: mode === 'dark' ? '#120A0A' : '#ffffff',
            boxShadow:
              mode === 'dark' ? '-10px 0 35px rgba(0,0,0,0.5)' : '-10px 0 35px rgba(0,0,0,0.05)',
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-5 border-b shrink-0 ${mode === 'dark' ? 'border-[#281414]' : 'border-slate-100'
            }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${mode === 'dark' ? 'bg-[#281414] text-[#DC2626]' : 'bg-red-50 text-red-800'}`}
            >
              <IconifyIcon icon="mdi:close-circle-outline" sx={{ fontSize: 20 }} />
            </div>
            <div>
              <h3
                className={`text-lg font-bold tracking-tight ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
              >
                Close / Cancel Follow-up
              </h3>
              <p
                className={`text-xs ${mode === 'dark' ? 'text-rose-300/80' : 'text-slate-500'} mt-0.5`}
              >
                Archive or close this reminder record
              </p>
            </div>
          </div>
          <IconButton
            onClick={handleCloseCancel}
            size="small"
            sx={{ color: mode === 'dark' ? '#FCA5A5' : '#64748B' }}
          >
            <IconifyIcon icon="mdi:close" sx={{ fontSize: 20 }} />
          </IconButton>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Customer Summary Card */}
          <div
            className={`p-4 rounded-xl border ${mode === 'dark' ? 'bg-[#0A0505] border-[#281414]' : 'bg-rose-50/50 border-rose-100'
              }`}
          >
            <div
              className={`text-sm font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              {cancelLead?.customer_name || 'Unknown customer'}
            </div>
            <div
              className={`mt-2 text-xs ${mode === 'dark' ? 'text-rose-300' : 'text-rose-700'} space-y-1.5`}
            >
              <div className="flex items-center gap-2">
                <IconifyIcon icon="mdi:phone" sx={{ fontSize: 14 }} />
                <span>{cancelLead?.phone_number || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconifyIcon icon="mdi:account" sx={{ fontSize: 14 }} />
                <span>Agent: {cancelLead?.agent_name || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <PixelEyeField
              select
              label="Close reason / status"
              value={cancelReason}
              onChange={(event) => {
                setCancelReason(event.target.value);
                setCancelError('');
              }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            >
              {CANCEL_REASON_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </PixelEyeField>

            <PixelEyeField
              label="Closure Notes"
              value={cancelNotes}
              onChange={(event) => setCancelNotes(event.target.value)}
              placeholder="Provide detailed notes for closing this lead..."
              fullWidth
              multiline
              minRows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </div>

          {cancelError && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {cancelError}
            </Alert>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-5 border-t shrink-0 flex items-center justify-end gap-3 ${mode === 'dark' ? 'border-[#281414]' : 'border-slate-100'
            }`}
        >
          <Button
            onClick={handleCloseCancel}
            variant="outlined"
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderColor: mode === 'dark' ? '#3A1C1C' : '#CBD5E1',
              color: mode === 'dark' ? '#FCA5A5' : '#475569',
              '&:hover': {
                borderColor: mode === 'dark' ? '#4A2A2A' : '#94A3B8',
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCancel}
            variant="contained"
            color="error"
            disabled={cancelMutation.isLoading}
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              backgroundColor: '#DC2626',
              '&:hover': { backgroundColor: '#B91C1C' },
            }}
          >
            {cancelMutation.isLoading ? (
              <span className="flex items-center gap-2">
                <CircularProgress size={14} sx={{ color: '#fff' }} />
                Saving...
              </span>
            ) : (
              'Close / Cancel'
            )}
          </Button>
        </div>
      </Drawer>
    </PixelEyePageShell>
  );
};

export default PixelEyeFollowUpsPage;
