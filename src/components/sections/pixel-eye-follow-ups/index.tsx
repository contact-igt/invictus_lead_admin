import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { useQuery } from 'react-query';
import { useSnackbar } from 'notistack';
import { normalizeClientKey } from 'utils/clientKey';
import { formatAppDate, formatAppDateTime, normalizeAppDate } from 'utils/dateTime';
import { _axios } from 'helper/axios';
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
import IconifyIcon from 'components/base/IconifyIcon';
import { PixelEyePageShell } from '../pixel-eye/pixelEyeUi';
import type {
  LeadRecord,
  FollowUpBucketSection,
  FollowUpPageBuckets,
  FollowUpReminder,
} from '../pixel-eye-overview/types';
import {
  buildFollowUpPageBuckets,
  getTodayIsoInIst,
  hasSuccessfulOutcome,
  hasUpdatedOutcome,
  getLatestOutcomeStatus,
  isCallReceivedOutcomePendingLead,
  isClosedOrCancelledFollowUpLead,
  shouldIncludeInManualFollowUpQueue,
  shouldHideFollowUpLead,
} from '../pixel-eye-overview/dashboardUtils';
import {
  useCancelPixelEyeFollowUpMutation,
  usePixelEyeFollowUpLifecycleSummaryQuery,
  usePixelEyeLeadQuery,
  useReschedulePixelEyeFollowUpMutation,
  useUpdatePixelEyeFollowUpOutcomeMutation,
  usePixelEyeMissedFollowUpsQuery,
  usePixelEyeQuery,
  type PixelEyeFollowUpCallComplianceRow,
} from 'components/hooks/usePixelEyeQuery';
import PixelEyeField from '../pixel-eye/PixelEyeField';
import PixelEyeDatePicker from '../pixel-eye/PixelEyeDatePicker';
import {
  NO_ACTION_STATUSES,
  TERMINATION_STATUSES,
  TWENTY_FOUR_HR_STATUSES,
  FORTY_EIGHT_HR_STATUSES,
  getDayDropdownStatuses,
  getNextStructuredDayNumber,
  isLeadFollowUpLocked,
  normalizePixelEyeStatus,
} from '../pixel-eye/pixelEyeStatuses';
import buildFollowUpLifecycleSummary from './followUpLifecycleSummary';
import FollowUpLifecycleDetails, { normalizeHistoryRows } from './FollowUpLifecycleDetails';

type FollowUpBucketKey =
  | FollowUpBucketSection['key']
  | 'missed'
  | 'priority'
  | 'outcome-updated'
  | 'successful-outcomes';

type FollowUpDisplayItem = FollowUpReminder & {
  lead_id?: number | null;
  call_id?: string | null;
  day_1?: string | null;
  day_2?: string | null;
  day_3?: string | null;
  day_4?: string | null;
  day_5?: string | null;
  scheduled_follow_up_at?: string | null;
  allowed_until?: string | null;
  compliance_status?: string | null;
  latest_raw_status?: string | null;
  latest_call_time?: string | null;
  reason?: string | null;
  matched_call_log_id?: number | null;
  matched_call_id?: string | null;
  matched_call_started_at?: string | null;
  followup_highlight_state?: string | null;
  called_outcome_missing?: boolean | null;
  normalized_phone_number?: string | null;
  followup_state?: string | null;
  followup_completion_source?: 'NOTIFICATION_SENT' | 'MANUAL_HANDLED' | null;
  reminder_schedule_type?: string | null;
  reminder_scheduled_at?: string | null;
  reminder_notification_sent?: boolean | null;
  reminder_notification_sent_at?: string | null;
  reminder_reason?: string | null;
  reminder_permanently_closed?: boolean | null;
  reminder_cancel_reason?: string | null;
  follow_up_change_count?: number | string | null;
  latest_follow_up_change_at?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type FollowUpBucketSectionView = Omit<FollowUpBucketSection, 'key' | 'leads'> & {
  key: FollowUpBucketKey;
  leads: FollowUpDisplayItem[];
};

const CANCEL_REASON_OPTIONS = [...TERMINATION_STATUSES];

const terminalStatusSet = new Set(TERMINATION_STATUSES.map((status) => status.toLowerCase()));
const successStatusSet = new Set(NO_ACTION_STATUSES.map((status) => status.toLowerCase()));
const twentyFourHourStatusSet = new Set(
  TWENTY_FOUR_HR_STATUSES.map((status) => status.toLowerCase()),
);
const fortyEightHourStatusSet = new Set(
  FORTY_EIGHT_HR_STATUSES.map((status) => status.toLowerCase()),
);

const normalizeStatusText = (status?: string | null): string =>
  normalizePixelEyeStatus(status).toLowerCase();

const getDisplayStatus = (status?: string | null): string => normalizePixelEyeStatus(status);

const getReminderLifecycleLabel = (
  followupState?: string | null,
  completionSource?: string | null,
): string => {
  const state = normalizeStatusText(followupState);
  const source = normalizeStatusText(completionSource);

  if (state === 'completed' && source === 'notification_sent') {
    return 'Reminder sent - waiting until end of day';
  }

  if (!state) {
    return 'Pending';
  }

  return state.toUpperCase();
};

const getWorkflowChipUi = (status?: string | null) => {
  const normalized = normalizeStatusText(status);
  const label = getDisplayStatus(status);
  if (successStatusSet.has(normalized)) {
    return { label: label || 'Won', color: '#10B981', background: 'rgba(16,185,129,0.12)' };
  }
  if (terminalStatusSet.has(normalized)) {
    return { label: label || 'Closed', color: '#EF4444', background: 'rgba(239,68,68,0.12)' };
  }
  if (twentyFourHourStatusSet.has(normalized)) {
    return { label: label || '24h follow-up', color: '#F59E0B', background: 'rgba(245,158,11,0.12)' };
  }
  if (fortyEightHourStatusSet.has(normalized)) {
    return { label: label || '48h follow-up', color: '#8B5CF6', background: 'rgba(139,92,246,0.12)' };
  }
  return {
    label: label || 'Active follow-up',
    color: '#06B6D4',
    background: 'rgba(6,182,212,0.12)',
  };
};

const parseSortableTimestamp = (value?: string | null): number => {
  const text = String(value || '').trim();
  if (!text) return 0;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const getLatestSignalTime = (lead: Partial<FollowUpDisplayItem | LeadRecord>): string | null =>
  lead.latest_call_time || lead.matched_call_started_at || lead.updatedAt || lead.updated_at || null;

const sortCallReceivedOutcomePendingLeads = <T extends Partial<FollowUpDisplayItem | LeadRecord>>(leads: T[]): T[] =>
  leads.slice().sort((a, b) => {
    const signalDiff = parseSortableTimestamp(getLatestSignalTime(b)) - parseSortableTimestamp(getLatestSignalTime(a));
    if (signalDiff !== 0) return signalDiff;

    const aDate = parseSortableTimestamp(a.follow_up_date) || Number.MAX_SAFE_INTEGER;
    const bDate = parseSortableTimestamp(b.follow_up_date) || Number.MAX_SAFE_INTEGER;
    return aDate - bDate;
  });


const bucketAccent: Record<FollowUpBucketKey, string> = {
  priority: '#F59E0B', // Amber-500
  'outcome-updated': '#2563EB', // Blue-600
  'successful-outcomes': '#16A34A', // Green-600
  overdue: '#EF4444', // Red-500
  today: '#F59E0B', // Amber-500
  tomorrow: '#3B82F6', // Blue-500
  week: '#10B981', // Emerald-500
  all: '#06B6D4', // Cyan-500
  missed: '#F43F5E', // Rose-500
};

const bucketIcons: Record<FollowUpBucketKey, string> = {
  priority: 'mdi:phone-alert-outline',
  'outcome-updated': 'mdi:form-select',
  'successful-outcomes': 'mdi:check-decagram',
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

const normalizeDateForCompare = (value?: string | null): string => normalizeAppDate(value);

const getFollowUpFilterDate = (lead: LeadRecord): string => {
  // Follow-Up page MUST show only manual follow_up_date leads.
  // Do not fall back to reminder_scheduled_at (status-based reminders).
  return normalizeDateForCompare(lead.follow_up_date);
};

// Extract YYYY-MM-DD from any date-like string for the date-only picker
const toDateValue = (value?: string | null): string => normalizeAppDate(value);

// Build an ISO string for 9:00 AM local time on the given YYYY-MM-DD date
const buildNineAmISO = (dateStr: string): string => {
  return `${dateStr}T09:00:00+05:30`;
};

const isNineAmIstStillFuture = (dateStr: string): boolean => {
  const scheduledAt = new Date(buildNineAmISO(dateStr));
  return !Number.isNaN(scheduledAt.getTime()) && scheduledAt.getTime() > Date.now();
};

const daysBetweenIso = (fromIso: string, toIso: string): number => {
  const from = new Date(`${fromIso}T00:00:00`);
  const to = new Date(`${toIso}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  return Math.round((to.getTime() - from.getTime()) / 86400000);
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
    followup_highlight_state: (row as LeadRecord).followup_highlight_state ?? null,
    called_outcome_missing: (row as LeadRecord).called_outcome_missing ?? null,
    followup_state:
      (row as LeadRecord).followup_state ??
      (row as PixelEyeFollowUpCallComplianceRow).compliance_status ??
      null,
    followup_completion_source: (row as LeadRecord).followup_completion_source ?? null,
    source:
      (row as LeadRecord).source?.trim() ||
      (row as PixelEyeFollowUpCallComplianceRow).source?.trim() ||
      'RUNO_WEBHOOK',
    type_of_enquiry: (row as LeadRecord).type_of_enquiry?.trim() || '',
    day_1: (row as LeadRecord).day_1 ?? null,
    day_2: (row as LeadRecord).day_2 ?? null,
    day_3: (row as LeadRecord).day_3 ?? null,
    day_4: (row as LeadRecord).day_4 ?? null,
    day_5: (row as LeadRecord).day_5 ?? null,
    daysRelative: daysBetweenIso(todayIso, followUpDate || todayIso),
    scheduled_follow_up_at:
      (row as PixelEyeFollowUpCallComplianceRow).scheduled_follow_up_at ?? null,
    allowed_until: (row as PixelEyeFollowUpCallComplianceRow).allowed_until ?? null,
    compliance_status: (row as PixelEyeFollowUpCallComplianceRow).compliance_status ?? null,
    latest_raw_status: (row as LeadRecord).latest_raw_status ?? null,
    latest_call_time:
      (row as LeadRecord).latest_call_time ??
      (row as PixelEyeFollowUpCallComplianceRow).matched_call_started_at ??
      null,
    reason: (row as PixelEyeFollowUpCallComplianceRow).reason ?? null,
    matched_call_log_id: (row as PixelEyeFollowUpCallComplianceRow).matched_call_log_id ?? null,
    matched_call_id: (row as PixelEyeFollowUpCallComplianceRow).matched_call_id ?? null,
    matched_call_started_at:
      (row as PixelEyeFollowUpCallComplianceRow).matched_call_started_at ?? null,
    normalized_phone_number:
      (row as PixelEyeFollowUpCallComplianceRow).normalized_phone_number ?? null,
    reminder_schedule_type: (row as LeadRecord).reminder_schedule_type ?? null,
    reminder_scheduled_at: (row as LeadRecord).reminder_scheduled_at ?? null,
    reminder_notification_sent: (row as LeadRecord).reminder_notification_sent ?? null,
    reminder_notification_sent_at: (row as LeadRecord).reminder_notification_sent_at ?? null,
    reminder_reason: (row as LeadRecord).reminder_reason ?? null,
    reminder_permanently_closed: (row as LeadRecord).reminder_permanently_closed ?? null,
    reminder_cancel_reason: (row as LeadRecord).reminder_cancel_reason ?? null,
    follow_up_change_count: (row as LeadRecord).follow_up_change_count ?? null,
    latest_follow_up_change_at: (row as LeadRecord).latest_follow_up_change_at ?? null,
    createdAt: (row as LeadRecord).createdAt ?? null,
    updatedAt: (row as LeadRecord).updatedAt ?? null,
    created_at: (row as LeadRecord).created_at ?? null,
    updated_at: (row as LeadRecord).updated_at ?? null,
  };
};

const PixelEyeFollowUpsPage: React.FC = () => {
  const { mode } = useColorMode();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams();
  const [activeBucket, setActiveBucket] = useState<FollowUpBucketKey>('all');
  const [selectedLead, setSelectedLead] = useState<FollowUpDisplayItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
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
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);
  const [outcomeLead, setOutcomeLead] = useState<FollowUpDisplayItem | null>(null);
  const [outcomeLeadLookupId, setOutcomeLeadLookupId] = useState<number | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState('');
  const [outcomeError, setOutcomeError] = useState('');
  const [queueExitMessage, setQueueExitMessage] = useState('');
  const priorityPanelRef = useRef<HTMLDivElement | null>(null);

  const cancelMutation = useCancelPixelEyeFollowUpMutation();
  const rescheduleMutation = useReschedulePixelEyeFollowUpMutation();
  const outcomeMutation = useUpdatePixelEyeFollowUpOutcomeMutation();
  const getLeadActionId = (lead: FollowUpDisplayItem): number => {
    if (typeof lead.lead_id === 'number' && Number.isFinite(lead.lead_id)) {
      return lead.lead_id;
    }
    return lead.id;
  };

  const { user } = useAuth();
  const { clientKey: urlClientKey } = useParams<{ clientKey?: string }>();
  const userRole = (user?.role || '').toLowerCase().trim();
  const isSuperAdmin = userRole === 'super-admin';
  const activeClientKey = normalizeClientKey(
    isSuperAdmin ? urlClientKey : user?.clientKey,
  );
  const hasScopedClientContext = !isSuperAdmin || Boolean(activeClientKey);

  const scopedClientKey = isSuperAdmin ? activeClientKey : undefined;

  const missedFilters = useMemo(
    () => ({
      from: dateFrom || undefined,
      to: dateTo || undefined,
    }),
    [dateFrom, dateTo],
  );

  const {
    data: allLeads = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePixelEyeQuery(scopedClientKey, { enabled: hasScopedClientContext });
  const {
    data: lifecycleSummary,
    isLoading: isLifecycleSummaryLoading,
    isError: isLifecycleSummaryError,
  } = usePixelEyeFollowUpLifecycleSummaryQuery(scopedClientKey, missedFilters, {
    enabled: hasScopedClientContext,
  });
  const {
    data: missedRowsFiltered = [],
    isLoading: isMissedFilteredLoading,
    isError: isMissedFilteredError,
    error: missedFilteredError,
    refetch: refetchMissedFollowUps,
  } = usePixelEyeMissedFollowUpsQuery(scopedClientKey, missedFilters, {
    enabled: hasScopedClientContext,
  });
  const {
    data: outcomeLeadDetails,
    isLoading: isOutcomeLeadLoading,
    isError: isOutcomeLeadError,
  } = usePixelEyeLeadQuery(outcomeLeadLookupId ?? undefined, scopedClientKey, {
    enabled: hasScopedClientContext,
  });

  const dateFilteredLeads = useMemo(() => {
    return allLeads.filter((lead) => {
      if (!dateFrom && !dateTo) return true;

      const leadDate = getFollowUpFilterDate(lead);
      if (!leadDate) return false;
      if (dateFrom && leadDate < dateFrom) return false;
      if (dateTo && leadDate > dateTo) return false;
      return true;
    });
  }, [allLeads, dateFrom, dateTo]);
  const todayIso = useMemo(() => getTodayIsoInIst(), []);

  const missedFollowUps = useMemo<FollowUpDisplayItem[]>(
    () => missedRowsFiltered.map((row) => toFollowUpDisplayItem(row, todayIso)),
    [missedRowsFiltered, todayIso],
  );

  const matchesFollowUpSearch = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return () => true;
    }

    return (lead: Partial<FollowUpDisplayItem | LeadRecord>) =>
      String(lead.customer_name || '').toLowerCase().includes(query) ||
      String(lead.phone_number || '').includes(query) ||
      String(lead.agent_name || '').toLowerCase().includes(query) ||
      getDisplayStatus(lead.status).toLowerCase().includes(query) ||
      String((lead as Partial<FollowUpDisplayItem>).reason || '').toLowerCase().includes(query) ||
      String(lead.compliance_status || '').toLowerCase().includes(query);
  }, [searchQuery]);

  // Follow-Up page = manual follow_up_date queue.
  // Notification Tracker = all scheduled reminders, including status-based reminders.
  const manualOnlyLeads = useMemo(() => {
    return dateFilteredLeads.filter((lead) => shouldIncludeInManualFollowUpQueue(lead));
  }, [dateFilteredLeads]);

  const priorityLeads = useMemo<FollowUpDisplayItem[]>(() => {
    const highlighted = manualOnlyLeads
      .filter((lead) => isCallReceivedOutcomePendingLead(lead))
      .map((lead) => toFollowUpDisplayItem(lead, todayIso))
      .filter(matchesFollowUpSearch);

    return sortCallReceivedOutcomePendingLeads(highlighted);
  }, [manualOnlyLeads, todayIso, matchesFollowUpSearch]);

  const manualSummaryBaseLeads = useMemo(
    () => dateFilteredLeads.filter((lead) => Boolean(getFollowUpFilterDate(lead))),
    [dateFilteredLeads],
  );

  const outcomeUpdatedLeads = useMemo<FollowUpDisplayItem[]>(() => {
    return manualSummaryBaseLeads
      .filter((lead) => hasUpdatedOutcome(lead))
      .map((lead) => toFollowUpDisplayItem(lead, todayIso))
      .filter(matchesFollowUpSearch)
      .sort((a, b) => parseSortableTimestamp(getLatestSignalTime(b)) - parseSortableTimestamp(getLatestSignalTime(a)));
  }, [manualSummaryBaseLeads, todayIso, matchesFollowUpSearch]);

  const successfulOutcomeLeads = useMemo<FollowUpDisplayItem[]>(() => {
    return manualSummaryBaseLeads
      .filter((lead) => hasSuccessfulOutcome(lead))
      .map((lead) => toFollowUpDisplayItem(lead, todayIso))
      .filter(matchesFollowUpSearch)
      .sort((a, b) => parseSortableTimestamp(getLatestSignalTime(b)) - parseSortableTimestamp(getLatestSignalTime(a)));
  }, [manualSummaryBaseLeads, todayIso, matchesFollowUpSearch]);

  const normalQueueLeads = useMemo(
    () => manualOnlyLeads.filter((lead) => !isCallReceivedOutcomePendingLead(lead)),
    [manualOnlyLeads],
  );

  const followUpBuckets = useMemo<FollowUpPageBuckets>(
    () => buildFollowUpPageBuckets(normalQueueLeads),
    [normalQueueLeads],
  );

  const visibleMissedFollowUps = useMemo<FollowUpDisplayItem[]>(
    () => missedFollowUps.filter(matchesFollowUpSearch),
    [missedFollowUps, matchesFollowUpSearch],
  );

  const visibleFollowUpBuckets = useMemo<FollowUpPageBuckets>(() => {
    const overdueLeads = followUpBuckets.overdueLeads.filter(matchesFollowUpSearch);
    const todayLeads = followUpBuckets.todayLeads.filter(matchesFollowUpSearch);
    const tomorrowLeads = followUpBuckets.tomorrowLeads.filter(matchesFollowUpSearch);
    const weekLeads = followUpBuckets.weekLeads.filter(matchesFollowUpSearch);
    const allLeads = followUpBuckets.allLeads.filter(matchesFollowUpSearch);

    return {
      overdueCount: overdueLeads.length,
      todayCount: todayLeads.length,
      tomorrowCount: tomorrowLeads.length,
      weekCount: weekLeads.length,
      allCount: allLeads.length,
      overdueLeads,
      todayLeads,
      tomorrowLeads,
      weekLeads,
      allLeads,
    };
  }, [followUpBuckets, matchesFollowUpSearch]);

  const sections: FollowUpBucketSectionView[] = useMemo(
    () => [
      {
        key: 'priority',
        label: 'Needs Outcome',
        count: priorityLeads.length,
        accent: bucketAccent.priority,
        leads: priorityLeads,
      },
      {
        key: 'outcome-updated',
        label: 'Outcome Updated',
        count: outcomeUpdatedLeads.length,
        accent: bucketAccent['outcome-updated'],
        leads: outcomeUpdatedLeads,
      },
      {
        key: 'successful-outcomes',
        label: 'Successful Outcomes',
        count: successfulOutcomeLeads.length,
        accent: bucketAccent['successful-outcomes'],
        leads: successfulOutcomeLeads,
      },
      {
        key: 'overdue',
        label: 'Overdue',
        count: visibleFollowUpBuckets.overdueCount,
        accent: bucketAccent.overdue,
        leads: visibleFollowUpBuckets.overdueLeads,
      },
      {
        key: 'today',
        label: 'Today',
        count: visibleFollowUpBuckets.todayCount,
        accent: bucketAccent.today,
        leads: visibleFollowUpBuckets.todayLeads,
      },
      {
        key: 'tomorrow',
        label: 'Tomorrow',
        count: visibleFollowUpBuckets.tomorrowCount,
        accent: bucketAccent.tomorrow,
        leads: visibleFollowUpBuckets.tomorrowLeads,
      },
      {
        key: 'week',
        label: 'This Week',
        count: visibleFollowUpBuckets.weekCount,
        accent: bucketAccent.week,
        leads: visibleFollowUpBuckets.weekLeads,
      },
      {
        key: 'all',
        label: 'All Follow-ups',
        count: visibleFollowUpBuckets.allCount,
        accent: bucketAccent.all,
        leads: visibleFollowUpBuckets.allLeads,
      },
      {
        key: 'missed',
        label: 'Missed Follow-up Calls',
        count: visibleMissedFollowUps.length,
        accent: bucketAccent.missed,
        leads: visibleMissedFollowUps,
      },
    ],
    [priorityLeads, outcomeUpdatedLeads, successfulOutcomeLeads, visibleFollowUpBuckets, visibleMissedFollowUps],
  );

  useEffect(() => {
    const requestedSection = String(searchParams.get('section') || '').trim().toLowerCase();
    if (!requestedSection) return;

    const validSections: FollowUpBucketKey[] = ['priority', 'outcome-updated', 'successful-outcomes', 'overdue', 'today', 'tomorrow', 'week', 'all', 'missed'];
    if (validSections.includes(requestedSection as FollowUpBucketKey)) {
      setActiveBucket(requestedSection as FollowUpBucketKey);
    }
  }, [searchParams]);

  useEffect(() => {
    const requestedSection = String(searchParams.get('section') || '').trim().toLowerCase();
    if (requestedSection !== 'priority' || priorityLeads.length === 0) return;

    priorityPanelRef.current?.scrollIntoView({ block: 'start' });
  }, [priorityLeads.length, searchParams]);

  const activeLeads = useMemo<FollowUpDisplayItem[]>(() => {
    const bucket = sections.find((s) => s.key === activeBucket);
    return bucket ? bucket.leads : [];
  }, [sections, activeBucket]);

  const activateBucket = (bucket: FollowUpBucketKey) => {
    setActiveBucket(bucket);
    setMobileView('list');
  };

  const focusPriorityPanel = () => {
    setActiveBucket('priority');
    setMobileView('list');
    priorityPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hasAnyFollowUps =
    followUpBuckets.allCount > 0 ||
    missedFollowUps.length > 0 ||
    priorityLeads.length > 0 ||
    isMissedFilteredLoading;

  const selectedLeadRecord = useMemo(() => {
    if (!selectedLead) return null;
    const selectedLeadId = getLeadActionId(selectedLead);
    return allLeads.find((lead) => Number(lead.id) === Number(selectedLeadId)) || null;
  }, [allLeads, selectedLead]);

  const selectedLeadWithDetails = useMemo<LeadRecord | null>(() => {
    if (!selectedLead) return null;

    return {
      id: getLeadActionId(selectedLead),
      call_id: selectedLead.call_id ?? selectedLeadRecord?.call_id ?? null,
      customer_name: selectedLead.customer_name ?? selectedLeadRecord?.customer_name ?? null,
      phone_number: selectedLead.phone_number ?? selectedLeadRecord?.phone_number ?? null,
      agent_name: selectedLead.agent_name ?? selectedLeadRecord?.agent_name ?? null,
      source: selectedLead.source ?? selectedLeadRecord?.source ?? null,
      type_of_enquiry: selectedLead.type_of_enquiry ?? selectedLeadRecord?.type_of_enquiry ?? null,
      follow_up_date: selectedLead.follow_up_date ?? selectedLeadRecord?.follow_up_date ?? null,
      status: selectedLeadRecord?.status ?? selectedLead.status ?? null,
      followup_highlight_state:
        selectedLeadRecord?.followup_highlight_state ?? selectedLead.followup_highlight_state ?? null,
      called_outcome_missing:
        selectedLeadRecord?.called_outcome_missing ?? selectedLead.called_outcome_missing ?? null,
      compliance_status: selectedLeadRecord?.compliance_status ?? selectedLead.compliance_status ?? null,
      latest_raw_status: selectedLeadRecord?.latest_raw_status ?? selectedLead.latest_raw_status ?? null,
      latest_call_time: selectedLeadRecord?.latest_call_time ?? selectedLead.latest_call_time ?? null,
      matched_call_started_at:
        selectedLeadRecord?.matched_call_started_at ?? selectedLead.matched_call_started_at ?? null,
      followup_state: (selectedLeadRecord?.followup_state as LeadRecord['followup_state']) ?? null,
      followup_completion_source:
        selectedLeadRecord?.followup_completion_source ?? selectedLead.followup_completion_source ?? null,
      reminder_schedule_type:
        (selectedLeadRecord?.reminder_schedule_type as LeadRecord['reminder_schedule_type']) ?? null,
      reminder_scheduled_at: selectedLeadRecord?.reminder_scheduled_at ?? selectedLead.reminder_scheduled_at ?? null,
      reminder_notification_sent:
        selectedLeadRecord?.reminder_notification_sent ?? selectedLead.reminder_notification_sent ?? null,
      reminder_notification_sent_at:
        selectedLeadRecord?.reminder_notification_sent_at ?? selectedLead.reminder_notification_sent_at ?? null,
      reminder_reason: selectedLeadRecord?.reminder_reason ?? selectedLead.reminder_reason ?? null,
      reminder_permanently_closed:
        selectedLeadRecord?.reminder_permanently_closed ?? selectedLead.reminder_permanently_closed ?? null,
      reminder_cancel_reason:
        selectedLeadRecord?.reminder_cancel_reason ?? selectedLead.reminder_cancel_reason ?? null,
      follow_up_change_count:
        selectedLeadRecord?.follow_up_change_count ?? selectedLead.follow_up_change_count ?? null,
      latest_follow_up_change_at:
        selectedLeadRecord?.latest_follow_up_change_at ?? selectedLead.latest_follow_up_change_at ?? null,
      day_1: selectedLeadRecord?.day_1 ?? selectedLead.day_1 ?? null,
      day_2: selectedLeadRecord?.day_2 ?? selectedLead.day_2 ?? null,
      day_3: selectedLeadRecord?.day_3 ?? selectedLead.day_3 ?? null,
      day_4: selectedLeadRecord?.day_4 ?? selectedLead.day_4 ?? null,
      day_5: selectedLeadRecord?.day_5 ?? selectedLead.day_5 ?? null,
      createdAt: selectedLeadRecord?.createdAt ?? selectedLead.createdAt ?? null,
      updatedAt: selectedLeadRecord?.updatedAt ?? selectedLead.updatedAt ?? null,
      created_at: selectedLeadRecord?.created_at ?? selectedLead.created_at ?? null,
      updated_at: selectedLeadRecord?.updated_at ?? selectedLead.updated_at ?? null,
    };
  }, [selectedLead, selectedLeadRecord]);

  const selectedLeadLatestOutcome = useMemo(
    () => getLatestOutcomeStatus(selectedLeadWithDetails),
    [selectedLeadWithDetails],
  );

  const selectedLeadFollowUpLocked = useMemo(
    () => isLeadFollowUpLocked(selectedLeadWithDetails || selectedLead),
    [selectedLead, selectedLeadWithDetails],
  );

  const targetLeadId = selectedLead ? getLeadActionId(selectedLead) : null;

  const { data: historyRes = [], isLoading: historyLoading } = useQuery(
    ['pixelEyeFollowUpHistory', targetLeadId, activeClientKey],
    async () => {
      if (!targetLeadId) return [];

      const response = await _axios(
        'get',
        `/pixeleye/${targetLeadId}/follow-up/history`,
        undefined,
        'application/json',
        isSuperAdmin && activeClientKey ? { _client_key: activeClientKey } : undefined,
      );

      return normalizeHistoryRows(response);
    },
    {
      enabled: hasScopedClientContext && Boolean(targetLeadId),
      retry: (failureCount: number, error: any) => {
        const status = error?.response?.status;
        if (status === 429) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: 1000 * 60 * 2,
    },
  );

  const historyList = useMemo(() => historyRes || [], [historyRes]);

  useEffect(() => {
    if (activeLeads.length > 0) {
      const stillInList = activeLeads.some((l) => l.id === selectedLead?.id);
      if (!stillInList) {
        setQueueExitMessage('');
        setSelectedLead(activeLeads[0]);
      } else {
        setQueueExitMessage('');
        const fresh = activeLeads.find((l) => l.id === selectedLead?.id);
        if (fresh) setSelectedLead(fresh);
      }
    } else {
      setQueueExitMessage('');
      setSelectedLead(null);
    }
  }, [activeBucket, activeLeads, selectedLead]);

  useEffect(() => {
    if (visibleFollowUpBuckets.allCount === 0 && visibleMissedFollowUps.length > 0 && activeBucket === 'all') {
      setActiveBucket('missed');
    }
  }, [activeBucket, visibleFollowUpBuckets.allCount, visibleMissedFollowUps.length]);

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

  const withResolvedLeadDays = (
    lead: FollowUpDisplayItem,
    fullLead?: Partial<LeadRecord> | null,
  ): FollowUpDisplayItem => ({
    ...lead,
    day_1: fullLead?.day_1 ?? lead.day_1 ?? null,
    day_2: fullLead?.day_2 ?? lead.day_2 ?? null,
    day_3: fullLead?.day_3 ?? lead.day_3 ?? null,
    day_4: fullLead?.day_4 ?? lead.day_4 ?? null,
    day_5: fullLead?.day_5 ?? lead.day_5 ?? null,
  });

  const hasLeadActionTarget = useCallback((lead: FollowUpDisplayItem): boolean => {
    if (activeBucket !== 'missed') return Number.isFinite(lead.id);
    return typeof lead.lead_id === 'number' && Number.isFinite(lead.lead_id);
  }, [activeBucket]);

  const shouldHideActionPanel = (lead: FollowUpDisplayItem): boolean =>
    shouldHideFollowUpLead(lead);

  const refetchFollowUpQueues = async () => {
    await Promise.allSettled([refetch(), refetchMissedFollowUps()]);
  };

  const handleOpenOutcome = (lead: FollowUpDisplayItem) => {
    if (isLeadFollowUpLocked(lead)) {
      return;
    }

    const leadId = getLeadActionId(lead);
    const fullLead = allLeads.find((item) => Number(item.id) === Number(leadId));
    const resolvedLead = withResolvedLeadDays(lead, fullLead);

    setOutcomeLead(resolvedLead);
    setOutcomeLeadLookupId(leadId);
    setOutcomeStatus('');
    setOutcomeError('');
    setOutcomeDialogOpen(true);
  };

  const handleCloseOutcome = () => {
    if (outcomeMutation.isLoading) return;
    setOutcomeDialogOpen(false);
    setOutcomeLead(null);
    setOutcomeLeadLookupId(null);
    setOutcomeStatus('');
    setOutcomeError('');
  };

  useEffect(() => {
    if (!outcomeLeadDetails || !outcomeLeadLookupId) return;

    setOutcomeLead((currentLead) => {
      if (!currentLead || Number(getLeadActionId(currentLead)) !== Number(outcomeLeadLookupId)) {
        return currentLead;
      }

      return withResolvedLeadDays(currentLead, outcomeLeadDetails);
    });
    setOutcomeLeadLookupId(null);
  }, [outcomeLeadDetails, outcomeLeadLookupId]);

  const isOutcomeLeadResolving = Boolean(outcomeLeadLookupId) && isOutcomeLeadLoading;
  const didOutcomeLeadResolutionFail = Boolean(outcomeLeadLookupId) && isOutcomeLeadError;
  const outcomeLeadResolutionMessage =
    'Could not load the latest day status for this follow-up. Please refresh and try again.';
  const outcomeLeadFollowUpLocked = isLeadFollowUpLocked(outcomeLead);

  const outcomeNextDayNumber =
    isOutcomeLeadResolving || didOutcomeLeadResolutionFail || outcomeLeadFollowUpLocked
      ? null
      : getNextStructuredDayNumber(outcomeLead);
  const outcomeStatusOptions = outcomeNextDayNumber
    ? getDayDropdownStatuses(outcomeNextDayNumber)
    : [];
  const allOutcomeDaysFilledMessage = outcomeLeadFollowUpLocked
    ? 'This lead is closed or completed. Outcome updates are locked.'
    : 'All outcome days are completed.';
  const selectedLeadOutcomeNextDayNumber = getNextStructuredDayNumber(
    selectedLeadWithDetails || selectedLead,
  );
  const isSelectedLeadOutcomeComplete = Boolean(selectedLead) && !selectedLeadOutcomeNextDayNumber;

  const handleSubmitOutcome = async () => {
    if (!outcomeLead) return;
    if (isOutcomeLeadResolving || didOutcomeLeadResolutionFail) {
      setOutcomeError(outcomeLeadResolutionMessage);
      return;
    }
    if (!outcomeNextDayNumber) {
      setOutcomeError(allOutcomeDaysFilledMessage);
      return;
    }
    if (!outcomeStatus) {
      setOutcomeError('Please select an outcome status.');
      return;
    }

    setOutcomeError('');
    try {
      await outcomeMutation.mutateAsync({
        id: getLeadActionId(outcomeLead),
        clientKey: isSuperAdmin ? activeClientKey : undefined,
        status: outcomeStatus,
      });
      const message =
        'Follow-up completed. Outcome saved and follow-up date cleared. View Lead Detail for lifecycle history.';
      setQueueExitMessage(message);
      enqueueSnackbar(message, { variant: 'success' });
      setOutcomeDialogOpen(false);
      setOutcomeLead(null);
      setOutcomeStatus('');
      await refetchFollowUpQueues();
    } catch (err) {
      setOutcomeError(getErrorMessage(err, 'Failed to update follow-up outcome'));
    }
  };

  const handleOpenReschedule = (lead: FollowUpDisplayItem) => {
    if (isLeadFollowUpLocked(lead)) {
      return;
    }

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
    if (isLeadFollowUpLocked(rescheduleLead)) {
      setRescheduleError('This lead is closed or completed. Reschedule is locked.');
      return;
    }

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
        clientKey: isSuperAdmin ? activeClientKey : undefined,
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

    if (!selectedReason) {
      setCancelError('Please choose a negative close status.');
      return;
    }

    setCancelError('');

    const payloadStatus = selectedReason;
    const payloadReason = notes || selectedReason || 'Follow-up cancelled';

    try {
      await cancelMutation.mutateAsync({
        id: getLeadActionId(cancelLead),
        clientKey: isSuperAdmin ? activeClientKey : undefined,
        status: payloadStatus,
        reason: payloadReason,
      });
      await refetchFollowUpQueues();
      handleCloseCancel();
    } catch (err) {
      setCancelError(getErrorMessage(err, 'Failed to cancel follow-up'));
    }
  };

  const formatDateTime = useCallback(
    (value?: string | null): string => formatAppDateTime(value) || 'N/A',
    [],
  );

  const formatDisplayDateTime = useCallback((value?: string | null): string => {
    const text = String(value || '').trim();
    if (!text) return 'N/A';
    return /^\d{4}-\d{2}-\d{2}$/.test(text)
      ? formatAppDate(text) || text
      : formatDateTime(text);
  }, [formatDateTime]);

  const historyEntryLabel = `${historyList.length} ${historyList.length === 1 ? 'Entry' : 'Entries'}`;

  // Fetch Call Compliance matching log entries
  const { data: complianceListRes, isLoading: complianceLoading } = useQuery(
    ['pixelEyeFollowUpCompliance', targetLeadId, activeClientKey],
    async () => {
      const response = await _axios(
        'get',
        '/pixeleye/follow-ups/call-compliance',
        undefined,
        'application/json',
        isSuperAdmin && activeClientKey ? { _client_key: activeClientKey } : undefined,
      );
      const rows = response?.data || response || [];
      if (Array.isArray(rows)) {
        return rows.filter((row: any) => {
          const matchesLeadId = Number(row.lead_id) === Number(targetLeadId);
          const matchesCallId =
            selectedLead?.call_id && row.call_id === selectedLead.call_id;
          return matchesLeadId || matchesCallId;
        });
      }
      return [];
    },
    {
      enabled: hasScopedClientContext && Boolean(targetLeadId || selectedLead?.call_id),
      retry: (failureCount: number, error: any) => {
        const status = error?.response?.status;
        if (status === 429) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: 1000 * 60 * 2,
    },
  );

  const complianceList = useMemo(() => {
    return complianceListRes || [];
  }, [complianceListRes]);

  const selectedLeadSummary = useMemo(
    () =>
      buildFollowUpLifecycleSummary({
        lead: selectedLeadWithDetails || selectedLead || undefined,
        historyRows: historyList,
        complianceRows: complianceList,
      }),
    [selectedLead, selectedLeadWithDetails, historyList, complianceList],
  );

  const selectedLeadTimelineItems = useMemo(() => {
    if (!selectedLeadWithDetails) return [];

    const callStatus = complianceList[0]?.compliance_status || 'PENDING';
    const latestHistoryItem = historyList[0];
    const reminderParts = [] as string[];

    if (selectedLeadWithDetails.reminder_scheduled_at) {
      reminderParts.push(`Scheduled ${formatDateTime(selectedLeadWithDetails.reminder_scheduled_at)}`);
    } else {
      reminderParts.push('Not scheduled');
    }

    if (selectedLeadWithDetails.reminder_notification_sent) {
      reminderParts.push(
        selectedLeadWithDetails.reminder_notification_sent_at
          ? ` - ${formatDateTime(selectedLeadWithDetails.reminder_notification_sent_at)}`
          : 'Notification sent',
      );
    } else {
      reminderParts.push('Notification not sent');
    }

    const lastSavedResultParts = [
      selectedLeadSummary.latestResult,
      selectedLeadSummary.latestOutcomeStatus,
      selectedLeadSummary.latestDayField ? `from ${selectedLeadSummary.latestDayField}` : null,
    ].filter(Boolean);

    const lifecycleStateTone =
      selectedLeadSummary.currentState === 'Done'
        ? 'success'
        : selectedLeadSummary.currentState === 'Missed' ||
          selectedLeadSummary.currentState === 'Cancelled' ||
          selectedLeadSummary.currentState === 'Closed'
          ? 'error'
          : selectedLeadSummary.currentState === 'Reminder Sent'
            ? 'info'
            : 'warning';

    return [
      {
        label: 'Follow-up Created',
        value:
          formatDateTime(
            selectedLeadWithDetails.createdAt || selectedLeadWithDetails.created_at || null,
          ) || 'N/A',
        tone: 'neutral',
      },
      {
        label: 'Current State',
        value: selectedLeadSummary.currentState,
        tone: lifecycleStateTone,
      },
      {
        label: 'Current Follow-up Date',
        value: selectedLeadSummary.latestFollowUpDate
          ? formatDisplayDateTime(selectedLeadSummary.latestFollowUpDate)
          : 'No active follow-up date',
        tone: selectedLeadSummary.latestFollowUpDate ? 'info' : 'neutral',
      },
      {
        label: 'Reminder Progress',
        value: reminderParts.join(' - '),
        tone: selectedLeadWithDetails.reminder_notification_sent
          ? 'success'
          : selectedLeadWithDetails.reminder_scheduled_at
            ? 'info'
            : 'neutral',
      },
      {
        label: 'Call Compliance',
        value:
          String(callStatus).toUpperCase() === 'CALLED'
            ? `Call Done${complianceList[0]?.matched_call_started_at ? ` - ${formatDateTime(complianceList[0].matched_call_started_at)}` : ''}`
            : String(callStatus).toUpperCase() === 'MISSED'
              ? 'Missed compliance window'
              : 'Call Pending',
        tone:
          String(callStatus).toUpperCase() === 'CALLED'
            ? 'success'
            : String(callStatus).toUpperCase() === 'MISSED'
              ? 'error'
              : 'warning',
      },
      ...(selectedLeadWithDetails.followup_highlight_state === 'CALL_RECEIVED_OUTCOME_PENDING'
        ? [
          {
            label: 'Webhook Call Signal',
            value: 'Call received - outcome pending',
            tone: 'warning',
          },
        ]
        : []),
      {
        label: 'Last Saved Result',
        value: lastSavedResultParts.length > 0 ? lastSavedResultParts.join(' - ') : 'No completed follow-up history yet',
        tone: lastSavedResultParts.length > 0 ? 'success' : 'neutral',
      },
      {
        label: 'Queue Status',
        value: isClosedOrCancelledFollowUpLead(selectedLeadWithDetails)
          ? selectedLeadWithDetails.reminder_cancel_reason || selectedLeadLatestOutcome || 'Closed'
          : selectedLeadSummary.latestCompletedAt
            ? 'Active manual follow-up'
            : 'Waiting for follow-up action',
        tone: isClosedOrCancelledFollowUpLead(selectedLeadWithDetails) ? 'error' : 'neutral',
      },
      {
        label: 'Last Change',
        value: latestHistoryItem
          ? ` - ${formatDateTime(latestHistoryItem.created_at || latestHistoryItem.createdAt)}`
          : 'No follow-up history yet',
        tone: latestHistoryItem ? 'info' : 'neutral',
      },
    ];
  }, [
    complianceList,
    formatDateTime,
    formatDisplayDateTime,
    historyList,
    selectedLeadLatestOutcome,
    selectedLeadSummary.currentState,
    selectedLeadSummary.latestCompletedAt,
    selectedLeadSummary.latestDayField,
    selectedLeadSummary.latestFollowUpDate,
    selectedLeadSummary.latestOutcomeStatus,
    selectedLeadSummary.latestResult,
    selectedLeadWithDetails,
  ]);

  const followUpsPageSummary = useMemo(() => {
    return {
      activeManual: lifecycleSummary?.active_manual ?? 0,
      missed: lifecycleSummary?.missed ?? 0,
      doneCount: lifecycleSummary?.completed_done ?? 0,
      calledOutcomeMissing: lifecycleSummary?.called_outcome_missing ?? 0,
      needsReview: lifecycleSummary?.needs_review ?? 0,
      remindersSent: lifecycleSummary?.reminders_sent ?? 0,
      outcomesSaved: lifecycleSummary?.outcomes_saved ?? 0,
      rescheduled: lifecycleSummary?.rescheduled ?? 0,
      cancelled: lifecycleSummary?.cancelled ?? 0,
    };
  }, [lifecycleSummary]);

  const lifecycleSummaryHelperText = !hasScopedClientContext
    ? 'Select client'
    : isLifecycleSummaryError
      ? 'Summary unavailable'
      : isLifecycleSummaryLoading
        ? 'Loading summary...'
        : null;

  const activeSection = sections.find((section) => section.key === activeBucket) || sections[0];

  const activeSectionCopy: Record<
    FollowUpBucketKey,
    { eyebrow: string; helper: string }
  > = {
    priority: {
      eyebrow: 'Needs outcome',
      helper: 'Call received and outcome still pending.',
    },
    'outcome-updated': {
      eyebrow: 'Saved outcomes',
      helper: 'Manual follow-ups with at least one saved outcome.',
    },
    'successful-outcomes': {
      eyebrow: 'Successful',
      helper: 'Saved outcomes that closed successfully.',
    },
    overdue: {
      eyebrow: 'Urgent queue',
      helper: 'Past due follow-ups.',
    },
    today: {
      eyebrow: 'Due now',
      helper: 'Needs update today.',
    },
    tomorrow: {
      eyebrow: 'Next',
      helper: 'Due tomorrow.',
    },
    week: {
      eyebrow: 'This week',
      helper: 'Due later this week.',
    },
    all: {
      eyebrow: 'Full queue',
      helper: 'All active follow-ups.',
    },
    missed: {
      eyebrow: 'Needs review',
      helper: 'Missed call window.',
    },
  };

  const selectedLeadActionCallout = useMemo(() => {
    if (!selectedLead) return null;

    if (!hasLeadActionTarget(selectedLead)) {
      return {
        title: 'Lead required',
        message: 'Link this call to a lead first.',
        tone: 'neutral' as const,
      };
    }

    if (isCallReceivedOutcomePendingLead(selectedLeadWithDetails || selectedLead)) {
      return {
        title: 'Update outcome',
        message: 'Same number called again. Save the outcome first.',
        tone: 'warning' as const,
      };
    }

    if (selectedLeadFollowUpLocked || shouldHideActionPanel(selectedLead)) {
      return {
        title: 'Action locked',
        message: `This lead is ${getReminderLifecycleLabel(
          selectedLead.followup_state,
          selectedLead.followup_completion_source,
        ).toLowerCase()}.`,
        tone: 'neutral' as const,
      };
    }

    if (activeBucket === 'missed') {
      return {
        title: 'Missed follow-up',
        message: 'Check the call and choose the next step.',
        tone: 'error' as const,
      };
    }

    if (isSelectedLeadOutcomeComplete) {
      return {
        title: 'All outcomes saved',
        message: 'Review history if needed.',
        tone: 'success' as const,
      };
    }

    return {
      title: 'Next step',
      message: 'Save outcome, reschedule, or cancel.',
      tone: 'info' as const,
    };
  }, [
    activeBucket,
    hasLeadActionTarget,
    isSelectedLeadOutcomeComplete,
    selectedLead,
    selectedLeadFollowUpLocked,
    selectedLeadWithDetails,
  ]);

  const selectedLeadWorkflowSteps = useMemo(() => {
    if (!selectedLeadWithDetails) return [] as Array<{
      key: string;
      label: string;
      description: string;
      state: 'done' | 'current' | 'alert' | 'pending';
    }>;

    const complianceStatus = String(complianceList[0]?.compliance_status || '').trim().toUpperCase();
    const hasOutcome = Boolean(selectedLeadSummary.latestOutcomeStatus || selectedLeadSummary.latestResult);
    const hasFollowUpDate = Boolean(selectedLeadSummary.latestFollowUpDate);
    const reminderSent = Boolean(selectedLeadWithDetails.reminder_notification_sent);
    const hasPendingSignal = isCallReceivedOutcomePendingLead(selectedLeadWithDetails);

    return [
      {
        key: 'scheduled',
        label: '1. Follow-up date',
        description: hasFollowUpDate
          ? `Current target: ${formatDisplayDateTime(selectedLeadSummary.latestFollowUpDate)}`
          : 'No date set.',
        state: hasFollowUpDate ? 'done' : 'pending',
      },
      {
        key: 'reminder',
        label: '2. Reminder',
        description: reminderSent
          ? 'Reminder sent.'
          : selectedLeadWithDetails.reminder_scheduled_at
            ? ` - ${formatDateTime(selectedLeadWithDetails.reminder_scheduled_at)}.`
            : 'No reminder set.',
        state: reminderSent ? 'done' : selectedLeadWithDetails.reminder_scheduled_at ? 'current' : 'pending',
      },
      {
        key: 'call-signal',
        label: '3. Call',
        description:
          complianceStatus === 'CALLED'
            ? `Call done${complianceList[0]?.matched_call_started_at ? ` - ${formatDateTime(complianceList[0].matched_call_started_at)}` : ''}`
            : complianceStatus === 'MISSED'
              ? 'Missed call window.'
              : hasPendingSignal
                ? 'Call received. Outcome needed.'
                : 'No call signal yet.',
        state:
          complianceStatus === 'MISSED'
            ? 'alert'
            : complianceStatus === 'CALLED' || hasPendingSignal
              ? 'current'
              : 'pending',
      },
      {
        key: 'outcome',
        label: '4. Outcome',
        description: hasOutcome
          ? `${selectedLeadSummary.latestOutcomeStatus || selectedLeadSummary.latestResult}${selectedLeadSummary.latestDayField ? ` saved to ${selectedLeadSummary.latestDayField}` : ''}.`
          : 'No outcome saved.',
        state: hasOutcome ? 'done' : hasPendingSignal ? 'alert' : 'pending',
      },
    ];
  }, [
    complianceList,
    formatDateTime,
    formatDisplayDateTime,
    selectedLeadSummary.latestDayField,
    selectedLeadSummary.latestFollowUpDate,
    selectedLeadSummary.latestOutcomeStatus,
    selectedLeadSummary.latestResult,
    selectedLeadWithDetails,
  ]);

  const workflowOverviewCards = [
    {
      key: 'tomorrow',
      label: 'Tomorrow',
      value: visibleFollowUpBuckets.tomorrowCount,
      helper: 'Due tomorrow',
      color: '#3B82F6',
      icon: 'mdi:calendar-clock',
      onClick: () => activateBucket('tomorrow'),
    },
    {
      key: 'week',
      label: 'This Week',
      value: visibleFollowUpBuckets.weekCount,
      helper: 'Due later this week',
      color: '#14B8A6',
      icon: 'mdi:calendar-range',
      onClick: () => activateBucket('week'),
    },
    {
      key: 'all',
      label: 'All',
      value: visibleFollowUpBuckets.allCount,
      helper: 'Total active queue',
      color: '#06B6D4',
      icon: 'mdi:calendar-multiple',
      onClick: () => activateBucket('all'),
    },
    {
      key: 'missed',
      label: 'Missed Calls',
      value: visibleMissedFollowUps.length,
      helper: 'Compliance windows marked as missed',
      color: '#EC4899',
      icon: 'mdi:phone-missed-outline',
      onClick: () => activateBucket('missed'),
    },
  ] as const;

  const lifecycleOverviewCards = [
    {
      key: 'reminders-sent',
      label: 'Reminder Sent',
      value: followUpsPageSummary.remindersSent,
      helper: 'Reminder history total',
      color: '#6366F1',
      icon: 'mdi:bell-check-outline',
    },
    {
      key: 'saved',
      label: 'Outcomes Saved',
      value: followUpsPageSummary.outcomesSaved,
      helper: 'Follow-up results already captured',
      color: '#10B981',
      icon: 'mdi:content-save-check-outline',
    },
    {
      key: 'rescheduled',
      label: 'Rescheduled',
      value: followUpsPageSummary.rescheduled,
      helper: 'History total',
      color: '#8B5CF6',
      icon: 'mdi:calendar-sync-outline',
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      value: followUpsPageSummary.cancelled,
      helper: 'History total',
      color: '#F97316',
      icon: 'mdi:close-circle-outline',
    },
    {
      key: 'needs-review',
      label: 'Needs Review',
      value: followUpsPageSummary.needsReview,
      helper: 'Lifecycle review total',
      color: '#A855F7',
      icon: 'mdi:clipboard-alert-outline',
    },
  ] as const;

  const queueOverviewCards = [
    {
      key: 'outcome-pending',
      label: 'Needs Outcome',
      value: priorityLeads.length,
      helper: 'Call received, no outcome',
      color: '#F59E0B',
      icon: 'mdi:phone-alert-outline',
      onClick: focusPriorityPanel,
    },
    {
      key: 'due-today',
      label: 'Due Today',
      value: visibleFollowUpBuckets.todayCount,
      helper: 'Due today',
      color: '#0EA5E9',
      icon: 'mdi:calendar-today',
      onClick: () => activateBucket('today'),
    },
    {
      key: 'overdue',
      label: 'Overdue',
      value: visibleFollowUpBuckets.overdueCount,
      helper: 'Past due',
      color: '#EF4444',
      icon: 'mdi:alert-circle-outline',
      onClick: () => activateBucket('overdue'),
    },
    ...workflowOverviewCards,
  ] as const;

  return (
    <PixelEyePageShell>
      {!hasScopedClientContext ? (
        <Box className="w-full rounded-[22px] border p-6" sx={{ borderColor: 'divider' }}>
          <div className="text-xl font-bold">Please select a client</div>
          <div className="mt-1 text-sm" style={{ color: 'var(--mui-palette-text-secondary)' }}>
            Select a client from route context to load manual follow-up queue data.
          </div>
        </Box>
      ) : (
        <Box className="flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div
              className={`xl:col-span-8 rounded-[24px] border p-5 md:p-6 ${mode === 'dark'
                ? 'border-[#1E2E25] bg-[linear-gradient(135deg,#0B1511_0%,#0E1814_45%,#08110D_100%)]'
                : 'border-slate-200 bg-white'
                }`}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] bg-emerald-500/10 text-[#22C55E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                    Follow-up
                  </div>
                  <h1 className={`mt-3 text-3xl font-black tracking-tight ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Follow-up Queue
                  </h1>
                  <p className={`mt-2 text-sm leading-relaxed ${mode === 'dark' ? 'text-[#9AAFB5]' : 'text-slate-600'}`}>
                    Pick a lead. Check the call. Save outcome or reschedule.
                  </p>
                  {/* <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      'Start with Needs Outcome',
                      'Check call history',
                      'Save outcome first',
                    ].map((item) => (
                      <span
                        key={item}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${mode === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {item}
                      </span>
                    ))}
                  </div> */}
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
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
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
                    startIcon={<IconifyIcon icon="mdi:refresh" className={isRefreshing ? 'animate-spin' : ''} />}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderColor: mode === 'dark' ? '#1F3A2D' : '#E2E8F0',
                    }}
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${mode === 'dark' ? 'text-[#4B6356]' : 'text-slate-400'}`}>
                    Queue totals
                  </div>
                  <div className={`mt-1 text-xs ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Cards match the visible rows.
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {queueOverviewCards.map((card) => (
                      <div
                        key={card.key}
                        onClick={card.onClick}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            card.onClick();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`rounded-2xl border p-4 transition-all duration-200 ${mode === 'dark' ? 'border-[#15271E] bg-[#07100C] hover:border-[#1F3E30]' : 'border-slate-100 bg-slate-50/70 hover:border-slate-200'}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${card.color}18`, color: card.color }}
                          >
                            <IconifyIcon icon={card.icon} sx={{ fontSize: 18 }} />
                          </div>
                          <span className={`text-[11px] font-black uppercase tracking-[0.16em] ${mode === 'dark' ? 'text-[#4B6356]' : 'text-slate-400'}`}>
                            {card.label}
                          </span>
                        </div>
                        <div className={`mt-4 text-3xl font-black ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {card.value.toLocaleString()}
                        </div>
                        <div className={`mt-1 text-xs ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {card.helper}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${mode === 'dark' ? 'text-[#4B6356]' : 'text-slate-400'}`}>
                    Lifecycle totals
                  </div>
                  <div className={`mt-1 text-xs ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    History totals do not map to the active list rows.
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-3">
                    {lifecycleOverviewCards.map((card) => (
                      <div
                        key={card.key}
                        className={`rounded-2xl border p-4 ${mode === 'dark' ? 'border-[#15271E] bg-[#07100C]' : 'border-slate-100 bg-slate-50/70'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${card.color}18`, color: card.color }}
                          >
                            <IconifyIcon icon={card.icon} sx={{ fontSize: 18 }} />
                          </div>
                          <span className={`text-[11px] font-black uppercase tracking-[0.16em] ${mode === 'dark' ? 'text-[#4B6356]' : 'text-slate-400'}`}>
                            {card.label}
                          </span>
                        </div>
                        <div className={`mt-4 text-3xl font-black ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {card.value.toLocaleString()}
                        </div>
                        <div className={`mt-1 text-xs ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {card.helper}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`xl:col-span-4 rounded-[24px] border p-5 ${mode === 'dark' ? 'border-[#15271E] bg-[#0B1410]' : 'border-slate-200 bg-white'}`}>
              <div className={`text-[11px] font-black uppercase tracking-[0.18em] ${mode === 'dark' ? 'text-[#4B6356]' : 'text-slate-400'}`}>
                Queue
              </div>
              <div className={`mt-2 text-xl font-black ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {activeSection.label}
              </div>
              <div className={`mt-1 text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {activeSectionCopy[activeBucket].helper}
              </div>

              <div className="mt-4 space-y-2">
                {sections.map((section) => {
                  const isActive = section.key === activeBucket;
                  return (
                    <button
                      key={section.key}
                      onClick={() => {
                        setActiveBucket(section.key);
                        setMobileView('list');
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${isActive
                        ? mode === 'dark'
                          ? 'border-[#22C55E] bg-[#10241A]'
                          : 'border-[#156A45] bg-[#E8F5E9]/60'
                        : mode === 'dark'
                          ? 'border-[#15271E] bg-[#070D0A] hover:border-[#1F3E30]'
                          : 'border-slate-100 bg-slate-50/40 hover:border-slate-200'
                        }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className={`text-[10px] font-black uppercase tracking-[0.16em] ${isActive ? (mode === 'dark' ? 'text-[#4ade80]' : 'text-[#156A45]') : (mode === 'dark' ? 'text-slate-400' : 'text-slate-500')}`}>
                          {activeSectionCopy[section.key].eyebrow}
                        </div>
                        <div className={`mt-1 text-sm font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {section.label}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <IconifyIcon icon={bucketIcons[section.key]} sx={{ fontSize: 18, color: section.accent }} />
                        <span className={`text-xl font-black ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {section.count.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {lifecycleSummaryHelperText ? (
                <div className={`mt-4 text-xs font-semibold ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lifecycleSummaryHelperText}
                </div>
              ) : null}
            </div>
          </div>

          {isError && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: '16px' }}>
              Failed to load follow-up leads: {getErrorMessage(error, 'Unknown error')}
            </Alert>
          )}

          {isMissedFilteredError && (
            <Alert severity="warning" sx={{ mt: 2.5, borderRadius: '16px' }}>
              Failed to load filtered missed follow-up calls:{' '}
              {getErrorMessage(missedFilteredError, 'Unknown error')}
            </Alert>
          )}

          {queueExitMessage ? (
            <Alert severity="info" sx={{ borderRadius: '16px' }}>
              {queueExitMessage}
            </Alert>
          ) : null}

          {isLifecycleSummaryError ? (
            <Alert severity="warning" sx={{ borderRadius: '16px' }}>
              Summary unavailable
            </Alert>
          ) : null}

          {priorityLeads.length > 0 ? (
            <Box
              ref={priorityPanelRef}
              className={`rounded-2xl border p-3 shadow-sm ${mode === 'dark'
                ? 'border-amber-500/25 bg-[#0B1410]'
                : 'border-amber-200 bg-white'
                }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className={`text-[12px] font-black uppercase tracking-[0.16em] ${mode === 'dark' ? 'text-amber-100' : 'text-amber-900'}`}>
                    Call Received - Outcome Pending
                  </div>
                  <div className={`mt-0.5 text-xs font-medium ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Same number called again. Update outcome.
                  </div>
                </div>
                <Chip
                  size="small"
                  label={`${priorityLeads.length} open`}
                  sx={{
                    alignSelf: { xs: 'flex-start', sm: 'center' },
                    bgcolor: mode === 'dark' ? 'rgba(245,158,11,0.14)' : '#FEF3C7',
                    color: mode === 'dark' ? '#FDE68A' : '#92400E',
                    fontWeight: 900,
                    border: '1px solid rgba(245,158,11,0.25)',
                  }}
                />
              </div>

              <div className={`mt-3 overflow-hidden rounded-xl border ${mode === 'dark' ? 'border-[#15271E]' : 'border-slate-100'}`}>
                {priorityLeads.map((lead) => {
                  const signalTime = getLatestSignalTime(lead);
                  const sourceText = String(lead.source || '').trim();

                  return (
                    <div
                      key={`call-received-outcome-pending-${lead.id}`}
                      className={`flex flex-col gap-3 border-b p-3 last:border-b-0 lg:flex-row lg:items-center lg:justify-between ${mode === 'dark'
                        ? 'border-[#15271E] bg-[#070D0A]'
                        : 'border-slate-100 bg-white'
                        }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {lead.customer_name || 'Unknown customer'}
                          </span>
                          <span className={`text-xs font-semibold ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {lead.phone_number || 'N/A'}
                          </span>
                          <Chip
                            size="small"
                            label="Call Received - Outcome Pending"
                            sx={{
                              height: 24,
                              bgcolor: mode === 'dark' ? 'rgba(245,158,11,0.16)' : '#FEF3C7',
                              color: mode === 'dark' ? '#FDE68A' : '#92400E',
                              fontSize: '0.65rem',
                              fontWeight: 900,
                            }}
                          />
                          <Chip
                            size="small"
                            label="Outcome needed"
                            sx={{
                              height: 24,
                              bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                              color: mode === 'dark' ? '#CBD5E1' : '#475569',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                            }}
                          />
                        </div>
                        <div className={`mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {lead.latest_raw_status ? <span>Status: {lead.latest_raw_status}</span> : null}
                          {signalTime ? <span>Last call: {formatDisplayDateTime(signalTime)}</span> : null}
                          {String(lead.compliance_status || '').toUpperCase() === 'CALLED' ? <span>Compliance: CALLED</span> : null}
                          {sourceText ? <span>Source: {sourceText}</span> : null}
                          {lead.follow_up_date ? <span>Date: {lead.follow_up_date}</span> : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenOutcome(lead)}
                          disabled={outcomeMutation.isLoading || isLeadFollowUpLocked(lead)}
                          sx={{
                            minHeight: 30,
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            bgcolor: '#F59E0B',
                            color: '#111827',
                            '&:hover': { bgcolor: '#D97706' },
                          }}
                        >
                          Update Outcome
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenReschedule(lead)}
                          disabled={reschedulingLeadId === getLeadActionId(lead) || isLeadFollowUpLocked(lead)}
                          sx={{ minHeight: 30, borderRadius: '10px', textTransform: 'none', fontSize: '0.75rem', fontWeight: 800 }}
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleOpenCancel(lead)}
                          disabled={cancellingLeadId === getLeadActionId(lead)}
                          sx={{ minHeight: 30, borderRadius: '10px', textTransform: 'none', fontSize: '0.75rem', fontWeight: 800 }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Box>
          ) : null}

          {/* --- Main Workspace Content --- */}
          {isLoading ? (
            <div className="mt-8 flex flex-col items-center justify-center py-20">
              <CircularProgress size={40} sx={{ color: '#156A45' }} />
              <span
                className={`mt-4 text-sm font-medium ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
              >
                Loading queue...
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
                No follow-ups
              </h3>
              <p
                className={`mt-2 text-sm max-w-md mx-auto ${mode === 'dark' ? 'text-[#94A3B8]' : 'text-slate-500'}`}
              >
                New follow-ups will appear here.
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
                  <div className="mb-3">
                    <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${mode === 'dark' ? 'text-[#4B6356]' : 'text-slate-400'}`}>
                      {activeSectionCopy[activeBucket].eyebrow}
                    </div>
                    <div className={`mt-1 text-lg font-black ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {activeSection.label}
                    </div>
                    <div className={`mt-1 text-xs ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {activeSectionCopy[activeBucket].helper}
                    </div>
                  </div>

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
                    <div className={`mt-2 text-[11px] ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Cards show total bucket counts. Search filters only the list below.
                    </div>
                  </Box>

                  {/* Leads Queue List */}

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {activeBucket === 'missed' && isMissedFilteredLoading ? (
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
                          <div
                            key={lead.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setSelectedLead(lead);
                              setMobileView('detail');
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                setSelectedLead(lead);
                                setMobileView('detail');
                              }
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
                                .join(' - ')
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
                                {isCallReceivedOutcomePendingLead(lead) && (
                                  <span
                                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${mode === 'dark'
                                      ? 'bg-[#1B1730] text-[#C4B5FD]'
                                      : 'bg-violet-50 text-violet-700'
                                      }`}
                                  >
                                    Call Received - Outcome Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
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
                    <div className="space-y-6 overflow-y-auto pr-1">
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
                              .join(' - ')
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

                      {selectedLeadActionCallout ? (
                        <div
                          className={`rounded-2xl border p-4 ${selectedLeadActionCallout.tone === 'warning'
                            ? mode === 'dark'
                              ? 'border-amber-500/30 bg-amber-500/10'
                              : 'border-amber-200 bg-amber-50/70'
                            : selectedLeadActionCallout.tone === 'error'
                              ? mode === 'dark'
                                ? 'border-rose-500/25 bg-rose-500/10'
                                : 'border-rose-200 bg-rose-50/80'
                              : selectedLeadActionCallout.tone === 'success'
                                ? mode === 'dark'
                                  ? 'border-emerald-500/25 bg-emerald-500/10'
                                  : 'border-emerald-200 bg-emerald-50/70'
                                : mode === 'dark'
                                  ? 'border-[#15271E] bg-[#07100C]'
                                  : 'border-slate-200 bg-slate-50/70'
                            }`}
                        >
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="max-w-2xl">
                              <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${mode === 'dark' ? 'text-[#4B6356]' : 'text-slate-400'}`}>
                                Next
                              </div>
                              <div className={`mt-1 text-lg font-black ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {selectedLeadActionCallout.title}
                              </div>
                              <div className={`mt-1 text-sm leading-relaxed ${mode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                {selectedLeadActionCallout.message}
                              </div>
                            </div>

                            {hasLeadActionTarget(selectedLead) && !shouldHideActionPanel(selectedLead) ? (
                              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 xl:justify-end">
                                <Button
                                  variant="contained"
                                  onClick={() => handleOpenOutcome(selectedLead)}
                                  disabled={
                                    outcomeMutation.isLoading ||
                                    isSelectedLeadOutcomeComplete ||
                                    selectedLeadFollowUpLocked
                                  }
                                  sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    minWidth: 172,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    backgroundColor: '#156A45',
                                    '&:hover': { backgroundColor: '#0F5738' },
                                  }}
                                >
                                  Update Outcome
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={() => handleOpenReschedule(selectedLead)}
                                  disabled={
                                    reschedulingLeadId === selectedLead.id || selectedLeadFollowUpLocked
                                  }
                                  sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                  }}
                                >
                                  Reschedule
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleOpenCancel(selectedLead)}
                                  disabled={
                                    cancellingLeadId === selectedLead.id || reschedulingLeadId === selectedLead.id
                                  }
                                  sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      <div
                        className={`p-5 rounded-2xl border ${mode === 'dark'
                          ? 'bg-[#080E0A] border-[#15271E] shadow-lg shadow-black/20'
                          : 'bg-white border-slate-200 shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 mb-5">
                          <div
                            className={`p-2 rounded-xl flex ${mode === 'dark' ? 'bg-[#12241A] text-[#86EFAC]' : 'bg-emerald-50 text-emerald-600'
                              }`}
                          >
                            <IconifyIcon icon="mdi:transit-connection-variant" sx={{ fontSize: 20 }} />
                          </div>
                          <div>
                            <div className={`text-sm font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              Follow-up flow
                            </div>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                              Understand where this lead is in the workflow
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {selectedLeadWorkflowSteps.map((step) => {
                            const tone =
                              step.state === 'done'
                                ? { dot: '#10B981', box: mode === 'dark' ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50/70' }
                                : step.state === 'alert'
                                  ? { dot: '#F59E0B', box: mode === 'dark' ? 'border-amber-500/25 bg-amber-500/10' : 'border-amber-200 bg-amber-50/70' }
                                  : step.state === 'current'
                                    ? { dot: '#06B6D4', box: mode === 'dark' ? 'border-cyan-500/20 bg-cyan-500/10' : 'border-cyan-200 bg-cyan-50/80' }
                                    : { dot: mode === 'dark' ? '#64748B' : '#94A3B8', box: mode === 'dark' ? 'border-[#15271E] bg-[#070D0A]' : 'border-slate-100 bg-slate-50/60' };

                            return (
                              <div key={step.key} className={`rounded-xl border p-4 ${tone.box}`}>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                                    {step.label}
                                  </div>
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tone.dot, boxShadow: `0 0 8px ${tone.dot}88` }} />
                                </div>
                                <div className={`mt-2 text-sm font-semibold leading-relaxed ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                  {step.description}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Follow-up Timeline */}
                      <div
                        className={`p-5 rounded-2xl border transition-all duration-300 ${mode === 'dark'
                          ? 'bg-[#080E0A] border-[#15271E] shadow-lg shadow-black/20'
                          : 'bg-white border-slate-200 shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 mb-5">
                          <div
                            className={`p-2 rounded-xl flex ${mode === 'dark' ? 'bg-[#12241A] text-[#86EFAC]' : 'bg-emerald-50 text-emerald-600'
                              }`}
                          >
                            <IconifyIcon icon="mdi:timeline-clock-outline" sx={{ fontSize: 20 }} />
                          </div>
                          <div>
                            <div
                              className={`text-sm font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
                            >
                              Follow-up Timeline
                            </div>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                              Reminder, call, outcome, and closure visibility
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {selectedLeadTimelineItems.map((item) => {
                            const toneColor =
                              item.tone === 'success'
                                ? '#10B981'
                                : item.tone === 'warning'
                                  ? '#F59E0B'
                                  : item.tone === 'error'
                                    ? '#EF4444'
                                    : item.tone === 'info'
                                      ? '#06B6D4'
                                      : mode === 'dark'
                                        ? '#94A3B8'
                                        : '#64748B';

                            return (
                              <div
                                key={item.label}
                                className={`p-4 rounded-xl border ${mode === 'dark'
                                  ? 'bg-[#070D0A] border-slate-200/10'
                                  : 'bg-slate-50/50 border-slate-100'
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    {item.label}
                                  </div>
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: toneColor, boxShadow: `0 0 8px ${toneColor}AA` }}
                                  />
                                </div>
                                <div className={`mt-2 text-sm font-semibold leading-relaxed ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                  {item.value}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Lower Area: History vs. Metadata/Compliance */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                        {/* Left Side: Activity Audit Timeline */}
                        <div className="md:col-span-7">
                          <div
                            className={`p-5 rounded-2xl border flex flex-col h-full transition-all duration-300 ${mode === 'dark'
                              ? 'bg-[#080E0A] border-[#15271E] shadow-lg shadow-black/20'
                              : 'bg-white border-slate-200 shadow-sm'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`p-2 rounded-xl flex ${mode === 'dark' ? 'bg-[#12241A] text-[#86EFAC]' : 'bg-emerald-50 text-emerald-600'
                                    }`}
                                >
                                  <IconifyIcon icon="mdi:history" sx={{ fontSize: 20 }} />
                                </div>
                                <div>
                                  <div
                                    className={`text-sm font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
                                  >
                                    Activity Audit Timeline
                                  </div>
                                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                                    Every operational follow-up transaction
                                  </div>
                                </div>
                              </div>
                              <Chip
                                label={historyEntryLabel}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  borderRadius: '6px',
                                  bgcolor:
                                    mode === 'dark'
                                      ? 'rgba(255,255,255,0.05)'
                                      : 'rgba(0,0,0,0.05)',
                                  color: mode === 'dark' ? '#94A3B8' : '#64748B',
                                  border: 'none',
                                }}
                              />
                            </div>

                            {historyLoading ? (
                              <div className="flex justify-center py-6">
                                <CircularProgress size={20} />
                              </div>
                            ) : historyList.length === 0 ? (
                              <div className="py-8 text-center border border-dashed border-slate-200/20 rounded-xl">
                                <IconifyIcon
                                  icon="mdi:history"
                                  sx={{ fontSize: 32, opacity: 0.1, mb: 1 }}
                                />
                                <div className="text-xs font-bold text-slate-500">
                                  No audit history recorded
                                </div>
                              </div>
                            ) : (
                              <Box
                                className="flex flex-col gap-4 overflow-y-auto max-h-[320px] pr-1"
                                sx={{
                                  '&::-webkit-scrollbar': { width: 4 },
                                  '&::-webkit-scrollbar-thumb': {
                                    bgcolor:
                                      mode === 'dark'
                                        ? 'rgba(255,255,255,0.1)'
                                        : 'rgba(0,0,0,0.1)',
                                    borderRadius: 2,
                                  },
                                }}
                              >
                                {historyList.map((item: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="relative pl-4 border-l-2 border-slate-200/10 last:border-l-0 pb-4 last:pb-0"
                                  >
                                    <div
                                      className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full border-2 ${mode === 'dark' ? 'border-[#080E0A]' : 'border-white'
                                        } ${item.change_type === 'CREATED'
                                          ? 'bg-emerald-500'
                                          : item.change_type === 'RESCHEDULED'
                                            ? 'bg-amber-500'
                                            : 'bg-blue-500'
                                        }`}
                                    />
                                    <div className="flex items-center gap-2 mb-1">
                                      <span
                                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${mode === 'dark'
                                          ? 'bg-slate-800 text-slate-300'
                                          : 'bg-slate-100 text-slate-600'
                                          }`}
                                      >
                                        {(item.change_type || 'UPDATE').toUpperCase()}
                                      </span>
                                      <span
                                        className={`text-[11px] font-bold ${mode === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}
                                      >
                                        {item.changed_by_name || 'System'}
                                      </span>
                                    </div>
                                    <div className="text-[12px] italic font-medium text-slate-400 mb-1 leading-snug">
                                      <FollowUpLifecycleDetails
                                        row={item}
                                        showFallbackReason
                                        fallbackNoWrap={false}
                                      />
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500">
                                      {formatDateTime(item.created_at || item.createdAt)}
                                    </div>
                                  </div>
                                ))}
                              </Box>
                            )}
                          </div>
                        </div>

                        {/* Right Side: Compliance & Lead Details */}
                        <div className="md:col-span-5 flex flex-col gap-4">
                          {/* Call Compliance */}
                          <div
                            className={`p-5 rounded-2xl border flex flex-col transition-all duration-300 ${mode === 'dark'
                              ? 'bg-[#080E0A] border-[#15271E] shadow-lg shadow-black/20'
                              : 'bg-white border-slate-200 shadow-sm'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 mb-5">
                              <div
                                className={`p-2 rounded-xl flex ${mode === 'dark' ? 'bg-[#12241A] text-[#86EFAC]' : 'bg-emerald-50 text-emerald-600'
                                  }`}
                              >
                                <IconifyIcon icon="mdi:shield-check" sx={{ fontSize: 20 }} />
                              </div>
                              <div>
                                <div
                                  className={`text-sm font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}
                                >
                                  Call Compliance
                                </div>
                                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                                  SLA monitoring
                                </div>
                              </div>
                            </div>

                            {complianceLoading ? (
                              <div className="flex justify-center py-6">
                                <CircularProgress size={20} />
                              </div>
                            ) : complianceList.length === 0 ? (
                              <div className="py-8 text-center border border-dashed border-slate-200/20 rounded-xl">
                                <IconifyIcon
                                  icon="mdi:shield-alert"
                                  sx={{ fontSize: 32, opacity: 0.1, mb: 1 }}
                                />
                                <div className="text-xs font-bold text-slate-500">
                                  No compliance data
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                  <Chip
                                    label={(
                                      complianceList[0].compliance_status || 'PENDING'
                                    ).toUpperCase()}
                                    size="small"
                                    sx={{
                                      height: 24,
                                      fontSize: '0.65rem',
                                      fontWeight: 900,
                                      borderRadius: '8px',
                                      bgcolor:
                                        complianceList[0].compliance_status === 'MET'
                                          ? 'rgba(16,185,129,0.1)'
                                          : 'rgba(245,158,11,0.1)',
                                      color:
                                        complianceList[0].compliance_status === 'MET'
                                          ? '#10B981'
                                          : '#F59E0B',
                                      border: 'none',
                                    }}
                                  />
                                  <div className={`text-[11px] font-black uppercase text-slate-400`}>
                                    {complianceList[0].compliance_status === 'PENDING'
                                      ? 'AWAITING CALL'
                                      : 'EVALUATED'}
                                  </div>
                                </div>

                                <div
                                  className={`p-4 rounded-xl border relative overflow-hidden ${mode === 'dark'
                                    ? 'bg-[#0A1410] border-amber-500/20'
                                    : 'bg-amber-50/30 border-amber-200'
                                    }`}
                                >
                                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                    Window
                                  </div>
                                  <div
                                    className={`text-xs font-bold leading-relaxed ${mode === 'dark' ? 'text-amber-100/90' : 'text-amber-900'}`}
                                  >
                                    {formatDisplayDateTime(
                                      complianceList[0].scheduled_follow_up_at ||
                                      complianceList[0].follow_up_date,
                                    )}
                                    <span className="mx-2 opacity-40">-&gt;</span>
                                    {formatDisplayDateTime(complianceList[0].allowed_until)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Metadata Details */}
                          <div
                            className={`p-5 rounded-2xl border flex flex-col transition-all duration-300 ${mode === 'dark'
                              ? 'bg-[#080E0A] border-[#15271E] shadow-lg shadow-black/20'
                              : 'bg-white border-slate-200 shadow-sm'
                              }`}
                          >
                            <h3
                              className={`text-xs font-bold uppercase tracking-widest mb-4 ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                            >
                              Lead Metadata
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                              <div
                                className={`p-3 rounded-xl border ${mode === 'dark' ? 'bg-[#070D0A] border-slate-200/5' : 'bg-slate-50/50 border-slate-100'}`}
                              >
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Agent</div>
                                <div
                                  className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                                >
                                  {selectedLead.agent_name || 'Unassigned'}
                                </div>
                              </div>

                              <div
                                className={`p-3 rounded-xl border ${mode === 'dark' ? 'bg-[#070D0A] border-slate-200/5' : 'bg-slate-50/50 border-slate-100'}`}
                              >
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Source</div>
                                <div
                                  className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                                >
                                  {selectedLead.source || 'Direct'}
                                </div>
                              </div>

                              <div
                                className={`p-3 rounded-xl border ${mode === 'dark' ? 'bg-[#070D0A] border-slate-200/5' : 'bg-slate-50/50 border-slate-100'}`}
                              >
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Enquiry</div>
                                <div
                                  className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                                >
                                  {selectedLead.type_of_enquiry || 'N/A'}
                                </div>
                              </div>

                              <div
                                className={`p-3 rounded-xl border ${mode === 'dark' ? 'bg-[#070D0A] border-slate-200/5' : 'bg-slate-50/50 border-slate-100'}`}
                              >
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</div>
                                <div
                                  className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${mode === 'dark' ? 'text-white' : 'text-slate-800'}`}
                                >
                                  {selectedLead.status || 'Active'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section footer */}
                    <div className="pt-4">
                      {!hasLeadActionTarget(selectedLead) ? (
                        <div
                          className={`p-4 rounded-xl border text-center ${mode === 'dark'
                            ? 'bg-[#070D0A] border-[#15271E] text-[#DFFFE3]'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                        >
                          This missed call has no linked lead record yet. Create or match the lead
                          before updating outcome, rescheduling, or closing it.
                        </div>
                      ) : !shouldHideActionPanel(selectedLead) ? (
                        <div
                          className={`p-4 rounded-xl border text-center ${mode === 'dark'
                            ? 'bg-[#07100C] border-[#15271E] text-[#DFFFE3]'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                        >
                          Primary actions are shown above in the "What to do next" section for faster workflow handling.
                        </div>
                      ) : (
                        <div
                          className={`p-4 rounded-xl border text-center ${mode === 'dark'
                            ? 'bg-[#070D0A] border-[#15271E] text-[#DFFFE3]'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                        >
                          Follow-up state is{' '}
                          <strong>
                            {getReminderLifecycleLabel(
                              selectedLead.followup_state,
                              selectedLead.followup_completion_source,
                            )}
                          </strong>
                          . No
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
      )}

      {/* --- Outcome Drawer --- */}
      <Drawer
        anchor="right"
        open={outcomeDialogOpen}
        onClose={handleCloseOutcome}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 440 },
            borderLeft: mode === 'dark' ? '1px solid #1C3429' : '1px solid #E2E8F0',
            backgroundColor: mode === 'dark' ? '#0B1410' : '#ffffff',
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
      >
        <div
          className={`flex items-center justify-between px-6 py-5 border-b ${mode === 'dark' ? 'border-[#14241C]' : 'border-slate-100'}`}
        >
          <div>
            <h3 className={`text-lg font-bold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Update Outcome
            </h3>
            <p className={`mt-1 text-xs ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {outcomeNextDayNumber
                ? `Saving outcome to Day ${outcomeNextDayNumber}`
                : allOutcomeDaysFilledMessage}
            </p>
          </div>
          <IconButton onClick={handleCloseOutcome} disabled={outcomeMutation.isLoading}>
            <IconifyIcon icon="mdi:close" sx={{ fontSize: 20 }} />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className={`p-4 rounded-xl border ${mode === 'dark' ? 'bg-[#060B08] border-[#14241C]' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`text-sm font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {outcomeLead?.customer_name || 'Unknown customer'}
            </div>
            <div className={`mt-1 text-xs ${mode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {outcomeLead?.phone_number || 'N/A'}
            </div>
          </div>

          <PixelEyeField
            select
            fullWidth
            label="Customer outcome"
            value={outcomeStatus}
            disabled={!outcomeNextDayNumber || isOutcomeLeadResolving || didOutcomeLeadResolutionFail}
            helperText={
              isOutcomeLeadResolving
                ? 'Loading latest lead day status...'
                : didOutcomeLeadResolutionFail
                  ? outcomeLeadResolutionMessage
                  : outcomeNextDayNumber
                    ? `Allowed statuses for Day ${outcomeNextDayNumber}`
                    : allOutcomeDaysFilledMessage
            }
            onChange={(event) => {
              setOutcomeStatus(event.target.value);
              setOutcomeError('');
            }}
          >
            {outcomeStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </PixelEyeField>

          {outcomeError && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {outcomeError}
            </Alert>
          )}
        </div>

        <div className={`px-6 py-5 border-t flex justify-end gap-3 ${mode === 'dark' ? 'border-[#14241C]' : 'border-slate-100'}`}>
          <Button onClick={handleCloseOutcome} disabled={outcomeMutation.isLoading} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitOutcome}
            disabled={
              !outcomeNextDayNumber ||
              !outcomeStatus ||
              outcomeMutation.isLoading ||
              isOutcomeLeadResolving ||
              didOutcomeLeadResolutionFail
            }
            variant="contained"
            startIcon={
              outcomeMutation.isLoading ? (
                <CircularProgress size={14} sx={{ color: '#fff' }} />
              ) : (
                <IconifyIcon icon="mdi:content-save-check-outline" />
              )
            }
            sx={{ backgroundColor: '#156A45', '&:hover': { backgroundColor: '#0F5738' } }}
          >
            {outcomeMutation.isLoading ? 'Saving...' : 'Save Outcome'}
          </Button>
        </div>
      </Drawer>

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
              mode === 'dark'
                ? '-10px 0 35px rgba(0,0,0,0.5)'
                : '-10px 0 35px rgba(0,0,0,0.05)',
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-5 border-b shrink-0 ${mode === 'dark' ? 'border-[#14241C]' : 'border-slate-100'}`}
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
            className={`p-4 rounded-xl border ${mode === 'dark' ? 'bg-[#060B08] border-[#14241C]' : 'bg-slate-50 border-slate-100'}`}
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
                  ? `Reminder notification will be sent on ${rescheduleFollowUpDate} at 9:00 AM`
                  : 'Select a date - notification auto-sends at 9:00 AM on that day'
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
          className={`px-6 py-5 border-t shrink-0 flex items-center justify-end gap-3 ${mode === 'dark' ? 'border-[#14241C]' : 'border-slate-100'}`}
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
              mode === 'dark'
                ? '-10px 0 35px rgba(0,0,0,0.5)'
                : '-10px 0 35px rgba(0,0,0,0.05)',
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-5 border-b shrink-0 ${mode === 'dark' ? 'border-[#281414]' : 'border-slate-100'}`}
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
            className={`p-4 rounded-xl border ${mode === 'dark' ? 'bg-[#0A0505] border-[#281414]' : 'bg-rose-50/50 border-rose-100'}`}
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
          className={`px-6 py-5 border-t shrink-0 flex items-center justify-end gap-3 ${mode === 'dark' ? 'border-[#281414]' : 'border-slate-100'}`}
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













