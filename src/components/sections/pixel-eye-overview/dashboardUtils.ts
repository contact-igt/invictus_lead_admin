import {
  DashboardFilters,
  FollowUpComplianceSummary,
  DashboardMetrics,
  FollowUpBuckets,
  FollowUpPageBuckets,
  FollowUpReminder,
  FollowUpSummaryMetrics,
  HighPriorityLead,
  LeadRecord,
  SourceBreakdownItem,
  StatusCategoryItem,
  TrendPoint,
} from './types';
import {
  FORTY_EIGHT_HR_STATUSES,
  NO_ACTION_STATUSES,
  TERMINATION_STATUSES,
  THIRTY_MIN_STATUSES_TO_EXCLUDE,
  TWENTY_FOUR_HR_STATUSES,
  normalizePixelEyeStatus,
} from '../pixel-eye/pixelEyeStatuses';
import { addCalendarDays, calendarDaysBetween, getAppDateKey, normalizeAppDate } from 'utils/dateTime';

// Status groups are mutually exclusive and mirror backend reminder behavior.
const CONTACT_EXCLUDED = new Set(
  (THIRTY_MIN_STATUSES_TO_EXCLUDE as readonly string[]).map((status) => status.toLowerCase()),
);

const APPOINTMENT_KPI_SET = new Set(
  (NO_ACTION_STATUSES as readonly string[]).map((status) => status.toLowerCase()),
);

const CONVERTED_SET = new Set(APPOINTMENT_KPI_SET);

const FOLLOW_UP_SET = new Set(
  [...TWENTY_FOUR_HR_STATUSES, ...FORTY_EIGHT_HR_STATUSES].map((status) =>
    status.toLowerCase(),
  ),
);

const INVALID_SET = new Set(
  ['Number Not In Service', 'Wrong Number'].map((status) => status.toLowerCase()),
);

const LOST_SET = new Set(
  (TERMINATION_STATUSES as readonly string[])
    .map((status) => status.toLowerCase())
    .filter((status) => !INVALID_SET.has(status)),
);

const CLOSED_OR_CANCELLED_SET = new Set([
  ...Array.from(LOST_SET),
  ...Array.from(INVALID_SET),
]);

const TERMINAL_STATUS_SET = new Set([
  ...Array.from(APPOINTMENT_KPI_SET),
  ...Array.from(LOST_SET),
  ...Array.from(INVALID_SET),
]);

const INTERESTED_SET = new Set([
  ...Array.from(FOLLOW_UP_SET),
  ...Array.from(APPOINTMENT_KPI_SET),
]);

const HIGH_PRIORITY_SET = new Set(['Hot Followup'.toLowerCase()]);
const DAY_FIELDS: Array<keyof LeadRecord> = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'];

const normalizeDate = (value?: string | null): string => normalizeAppDate(value);

const normalizeText = (value?: string | null): string => (value || '').trim();
const normalizeStatus = (value?: string | null): string =>
  normalizePixelEyeStatus(normalizeText(value)).toLowerCase();

const CALL_RECEIVED_OUTCOME_PENDING = 'call_received_outcome_pending';

export const isCallReceivedOutcomePendingLead = (
  lead?:
    | {
      followup_highlight_state?: string | null;
      called_outcome_missing?: boolean | null;
    }
    | null,
): boolean => {
  if (!lead) return false;

  return (
    normalizeText(lead.followup_highlight_state).toLowerCase() === CALL_RECEIVED_OUTCOME_PENDING ||
    lead.called_outcome_missing === true
  );
};

const hasCalledComplianceSignal = (lead?: LeadRecord | null): boolean => {
  if (!lead) return false;

  return (
    normalizeStatus(lead.compliance_status) === 'called' ||
    Boolean(normalizeText(lead.latest_call_time)) ||
    Boolean(normalizeText(lead.matched_call_started_at)) ||
    Boolean(normalizeText(lead.matched_call_id)) ||
    Boolean(lead.matched_call_log_id)
  );
};

export const getLatestOutcomeStatus = (lead?: LeadRecord | null): string => {
  if (!lead) return '';

  for (let index = DAY_FIELDS.length - 1; index >= 0; index -= 1) {
    const value = normalizeText(lead[DAY_FIELDS[index]] as string | null);
    if (value) {
      return value;
    }
  }

  return normalizeText(lead.status);
};

export const hasUpdatedOutcome = (lead?: LeadRecord | null): boolean => {
  if (!lead) return false;
  return DAY_FIELDS.some((field) => Boolean(normalizeText(lead[field] as string | null)));
};

export const hasSuccessfulOutcome = (lead?: LeadRecord | null): boolean => {
  const latestOutcome = normalizeStatus(getLatestOutcomeStatus(lead));
  return Boolean(latestOutcome) && APPOINTMENT_KPI_SET.has(latestOutcome);
};

export const isClosedOrCancelledFollowUpLead = (lead?: LeadRecord | null): boolean => {
  if (!lead) return false;

  if (normalizeStatus(lead.followup_state) === 'cancelled') {
    return true;
  }

  if (lead.reminder_permanently_closed) {
    return true;
  }

  const latestOutcome = normalizeStatus(getLatestOutcomeStatus(lead));
  return Boolean(latestOutcome) && CLOSED_OR_CANCELLED_SET.has(latestOutcome);
};

export const getTodayIsoInIst = (): string => getAppDateKey();

const endOfWeekIso = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return addCalendarDays(isoDate, 7 - dayOfWeek);
};

const parseDateTime = (value?: string | null): number => {
  const text = normalizeText(value);
  if (!text) return 0;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const getLeadActivityTimestamp = (lead: LeadRecord): number => {
  return (
    parseDateTime(lead.updatedAt) ||
    parseDateTime(lead.updated_at) ||
    parseDateTime(lead.createdAt) ||
    parseDateTime(lead.created_at)
  );
};

const isValidFollowUpDate = (value?: string | null): boolean => Boolean(normalizeDate(value));

export const hasAllOutcomeDaysFilled = (lead?: LeadRecord | null): boolean => {
  if (!lead) return false;
  return DAY_FIELDS.every((field) => Boolean(normalizeText(lead[field] as string | null)));
};

type FollowUpStateLike = {
  followup_state?: string | null;
  followup_completion_source?: string | null;
};

export const shouldHideFollowUpLead = (lead: FollowUpStateLike): boolean => {
  const normalizedState = normalizeStatus(lead.followup_state);

  if (normalizedState === 'cancelled') {
    return true;
  }

  if (normalizedState !== 'completed') {
    return false;
  }

  const completionSource = normalizeStatus(lead.followup_completion_source);
  return completionSource !== 'notification_sent';
};

export const isTerminalFollowUpStatus = (status?: string | null): boolean => {
  const normalized = normalizeStatus(status);
  if (!normalized) return false;
  return TERMINAL_STATUS_SET.has(normalized);
};

export const isFollowUpStatus = (status?: string | null): boolean => {
  const normalized = normalizeStatus(status);
  if (!normalized) return false;
  return FOLLOW_UP_SET.has(normalized);
};

export const isFollowUpLead = (lead: LeadRecord): boolean => {
  if (shouldHideFollowUpLead(lead)) return false;
  if (hasAllOutcomeDaysFilled(lead)) return false;
  if (isClosedOrCancelledFollowUpLead(lead)) return false;

  const latestOutcome = getLatestOutcomeStatus(lead);
  return (
    !isTerminalFollowUpStatus(latestOutcome) &&
    (isValidFollowUpDate(lead.follow_up_date) || isFollowUpStatus(latestOutcome))
  );
};

export const shouldIncludeInManualFollowUpQueue = (lead: LeadRecord): boolean => {
  if (!isValidFollowUpDate(lead.follow_up_date)) return false;
  if (shouldHideFollowUpLead(lead)) return false;
  if (hasAllOutcomeDaysFilled(lead)) return false;
  if (isClosedOrCancelledFollowUpLead(lead)) return false;

  const latestOutcome = getLatestOutcomeStatus(lead);
  if (isTerminalFollowUpStatus(latestOutcome)) return false;

  return true;
};

export const getAvailableAgents = (leads: LeadRecord[]): string[] => {
  return Array.from(
    new Set(leads.map((lead) => normalizeText(lead.agent_name)).filter((name) => Boolean(name))),
  ).sort((a, b) => a.localeCompare(b));
};

export const applyDashboardFilters = (
  leads: LeadRecord[],
  filters: DashboardFilters,
): LeadRecord[] => {
  const { dateFrom, dateTo, agent } = filters;
  const normalizedAgent = normalizeText(agent).toLowerCase();
  const normalizedFrom = normalizeDate(dateFrom);
  const normalizedTo = normalizeDate(dateTo);
  const effectiveFrom =
    normalizedFrom && normalizedTo && normalizedFrom > normalizedTo ? normalizedTo : normalizedFrom;
  const effectiveTo =
    normalizedFrom && normalizedTo && normalizedFrom > normalizedTo ? normalizedFrom : normalizedTo;

  return leads.filter((lead) => {
    const leadDate =
      normalizeDate(lead.date) || normalizeDate(lead.createdAt) || normalizeDate(lead.created_at);
    const leadAgent = normalizeText(lead.agent_name).toLowerCase();

    const isAfterFrom = !effectiveFrom || (leadDate && leadDate >= effectiveFrom);
    const isBeforeTo = !effectiveTo || (leadDate && leadDate <= effectiveTo);
    const isAgentMatch = !normalizedAgent || leadAgent === normalizedAgent;

    return isAfterFrom && isBeforeTo && isAgentMatch;
  });
};

const countByStatus = (leads: LeadRecord[], statuses: Set<string>): number => {
  return leads.filter((lead) => statuses.has(normalizeStatus(lead.status))).length;
};

const buildStatusBreakdown = (leads: LeadRecord[]): StatusCategoryItem[] => {
  const converted = countByStatus(leads, CONVERTED_SET);
  const followUp = countByStatus(leads, FOLLOW_UP_SET);
  const lost = countByStatus(leads, LOST_SET);
  const invalid = countByStatus(leads, INVALID_SET);
  const inProgress = Math.max(leads.length - (converted + followUp + lost + invalid), 0);

  return [
    { label: 'Converted', count: converted, color: '#2E7D32' },
    { label: 'Follow-up', count: followUp, color: '#ED6C02' },
    { label: 'In Progress', count: inProgress, color: '#0288D1' },
    { label: 'Lost', count: lost, color: '#D32F2F' },
    { label: 'Invalid', count: invalid, color: '#6B7280' },
  ];
};

const buildFunnel = (leads: LeadRecord[]) => {
  const total = leads.length;
  const contacted = leads.filter((lead) => {
    const status = normalizeStatus(lead.status);
    return Boolean(status) && !CONTACT_EXCLUDED.has(status);
  }).length;

  const interested = countByStatus(leads, INTERESTED_SET);
  const appointment = leads.filter(
    (lead) => APPOINTMENT_KPI_SET.has(normalizeStatus(lead.status)),
  ).length;
  const visited = leads.filter((lead) => {
    const status = normalizeStatus(lead.status);
    return status === 'visited' || status === 'walk in' || status === 'closed';
  }).length;

  const asPercent = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return [
    { stage: 'Leads' as const, count: total, percent: 100 },
    { stage: 'Contacted' as const, count: contacted, percent: asPercent(contacted) },
    { stage: 'Interested' as const, count: interested, percent: asPercent(interested) },
    { stage: 'Appointment' as const, count: appointment, percent: asPercent(appointment) },
    { stage: 'Visited' as const, count: visited, percent: asPercent(visited) },
  ];
};

const buildTrend = (leads: LeadRecord[]): TrendPoint[] => {
  return DAY_FIELDS.map((field, index) => {
    let contacted = 0;
    let converted = 0;

    leads.forEach((lead) => {
      const value = normalizeText(lead[field] as string | null);
      if (!value) return;
      const val = value.toLowerCase();

      if (!CONTACT_EXCLUDED.has(val)) {
        contacted += 1;
      }

      if (CONVERTED_SET.has(val)) {
        converted += 1;
      }
    });

    return {
      day: `Day ${index + 1}` as TrendPoint['day'],
      contacted,
      converted,
    };
  });
};

const buildHighPriorityLeads = (
  leads: LeadRecord[],
): { totalCount: number; leads: HighPriorityLead[] } => {
  const today = getTodayIsoInIst();

  const prioritized = leads
    .filter((lead) => {
      const status = normalizeStatus(lead.status);
      const followUp = normalizeDate(lead.follow_up_date);
      const isUrgentFollowUp = Boolean(followUp) && followUp <= today;
      return HIGH_PRIORITY_SET.has(status) || isUrgentFollowUp;
    })
    .sort((a, b) => {
      const aDate = normalizeDate(a.follow_up_date) || '9999-12-31';
      const bDate = normalizeDate(b.follow_up_date) || '9999-12-31';
      return aDate.localeCompare(bDate);
    });

  return {
    totalCount: prioritized.length,
    leads: prioritized.slice(0, 8).map((lead) => ({
      id: lead.id,
      customer_name: normalizeText(lead.customer_name) || 'Unknown',
      phone_number: normalizeText(lead.phone_number) || 'N/A',
      agent_name: normalizeText(lead.agent_name) || 'Unassigned',
      status: normalizeText(lead.status) || 'N/A',
      follow_up_date: normalizeDate(lead.follow_up_date) || 'N/A',
    })),
  };
};

const addDays = addCalendarDays;

const daysBetween = calendarDaysBetween;

const buildFollowUpReminder = (lead: LeadRecord, today: string): FollowUpReminder => {
  const followUpDate = normalizeDate(lead.follow_up_date) || '';

  return {
    id: lead.id,
    customer_name: normalizeText(lead.customer_name) || 'Unknown',
    phone_number: normalizeText(lead.phone_number) || 'N/A',
    agent_name: normalizeText(lead.agent_name) || 'Unassigned',
    status: normalizeText(lead.status) || 'N/A',
    follow_up_date: followUpDate,
    source: normalizeText(lead.source) || '',
    type_of_enquiry: normalizeText(lead.type_of_enquiry) || '',
    daysRelative: daysBetween(today, followUpDate),
  };
};

export const buildFollowUpBuckets = (leads: LeadRecord[]): FollowUpBuckets => {
  const today = getTodayIsoInIst();
  const in7Days = addDays(today, 7);
  const tomorrow = addDays(today, 1);

  const leadsWithDate = leads.filter((lead) => Boolean(normalizeDate(lead.follow_up_date)));

  const overdue = leadsWithDate
    .filter((lead) => normalizeDate(lead.follow_up_date)! < today)
    .sort((a, b) =>
      normalizeDate(a.follow_up_date)!.localeCompare(normalizeDate(b.follow_up_date)!),
    )
    .map((lead) => buildFollowUpReminder(lead, today));

  const todayLeads = leadsWithDate
    .filter((lead) => normalizeDate(lead.follow_up_date) === today)
    .map((lead) => buildFollowUpReminder(lead, today));

  const tomorrowLeads = leadsWithDate
    .filter((lead) => normalizeDate(lead.follow_up_date) === tomorrow)
    .sort((a, b) =>
      normalizeDate(a.follow_up_date)!.localeCompare(normalizeDate(b.follow_up_date)!),
    )
    .map((lead) => buildFollowUpReminder(lead, today));

  const upcoming = leadsWithDate
    .filter((lead) => {
      const fud = normalizeDate(lead.follow_up_date)!;
      return fud > tomorrow && fud <= in7Days;
    })
    .sort((a, b) =>
      normalizeDate(a.follow_up_date)!.localeCompare(normalizeDate(b.follow_up_date)!),
    )
    .map((lead) => buildFollowUpReminder(lead, today));

  const all = leadsWithDate
    .slice()
    .sort((a, b) => {
      const aDate = normalizeDate(a.follow_up_date) || '9999-12-31';
      const bDate = normalizeDate(b.follow_up_date) || '9999-12-31';
      return (
        aDate.localeCompare(bDate) ||
        normalizeText(a.customer_name).localeCompare(normalizeText(b.customer_name))
      );
    })
    .map((lead) => buildFollowUpReminder(lead, today));

  return {
    overdueCount: overdue.length,
    todayCount: todayLeads.length,
    tomorrowCount: tomorrowLeads.length,
    weekCount: upcoming.length,
    allCount: all.length,
    overdueLeads: overdue,
    todayLeads,
    tomorrowLeads,
    weekLeads: upcoming,
    allLeads: all,
  };
};

export const buildFollowUpPageBuckets = (leads: LeadRecord[]): FollowUpPageBuckets => {
  const today = getTodayIsoInIst();
  const tomorrow = addDays(today, 1);
  const weekEnd = endOfWeekIso(today);

  const followUpLeads = leads.filter((lead) => isFollowUpLead(lead));
  const queueOwnedLeads = followUpLeads.filter((lead) => !isCallReceivedOutcomePendingLead(lead));
  const dateBasedLeads = queueOwnedLeads.filter((lead) => isValidFollowUpDate(lead.follow_up_date));

  const toReminder = (lead: LeadRecord): FollowUpReminder => {
    const followUpDate = normalizeDate(lead.follow_up_date) || '';
    return {
      id: lead.id,
      customer_name: normalizeText(lead.customer_name) || 'Unknown',
      phone_number: normalizeText(lead.phone_number) || 'N/A',
      agent_name: normalizeText(lead.agent_name) || 'Unassigned',
      status: normalizeText(lead.status) || 'N/A',
      follow_up_date: followUpDate,
      followup_highlight_state: normalizeText(lead.followup_highlight_state) || null,
      called_outcome_missing: Boolean(lead.called_outcome_missing),
      compliance_status: normalizeText(lead.compliance_status) || null,
      followup_state: normalizeText(lead.followup_state) || '',
      followup_completion_source:
        normalizeStatus(lead.followup_completion_source) === 'notification_sent'
          ? 'NOTIFICATION_SENT'
          : normalizeStatus(lead.followup_completion_source) === 'manual_handled'
            ? 'MANUAL_HANDLED'
            : null,
      source: normalizeText(lead.source) || '',
      type_of_enquiry: normalizeText(lead.type_of_enquiry) || '',
      daysRelative: daysBetween(today, followUpDate || today),
    };
  };

  const sortByDateThenActivity = (a: LeadRecord, b: LeadRecord) => {
    const aPendingSignal = isCallReceivedOutcomePendingLead(a);
    const bPendingSignal = isCallReceivedOutcomePendingLead(b);
    if (aPendingSignal !== bPendingSignal) return aPendingSignal ? -1 : 1;

    const aDate = normalizeDate(a.follow_up_date) || '9999-12-31';
    const bDate = normalizeDate(b.follow_up_date) || '9999-12-31';
    if (aDate !== bDate) return aDate.localeCompare(bDate);

    const aTs = getLeadActivityTimestamp(a);
    const bTs = getLeadActivityTimestamp(b);
    if (aTs !== bTs) return bTs - aTs;

    return normalizeText(a.customer_name).localeCompare(normalizeText(b.customer_name));
  };

  const overdue = dateBasedLeads
    .filter((lead) => normalizeDate(lead.follow_up_date)! < today)
    .sort(sortByDateThenActivity)
    .map(toReminder);

  const todayLeads = dateBasedLeads
    .filter((lead) => normalizeDate(lead.follow_up_date) === today)
    .sort(sortByDateThenActivity)
    .map(toReminder);

  const tomorrowLeads = dateBasedLeads
    .filter((lead) => normalizeDate(lead.follow_up_date) === tomorrow)
    .sort(sortByDateThenActivity)
    .map(toReminder);

  const weekLeads = dateBasedLeads
    .filter((lead) => {
      const followUpDate = normalizeDate(lead.follow_up_date)!;
      return followUpDate > tomorrow && followUpDate <= weekEnd;
    })
    .sort(sortByDateThenActivity)
    .map(toReminder);

  const allLeads = queueOwnedLeads
    .slice()
    .sort((a, b) => {
      const aPendingSignal = isCallReceivedOutcomePendingLead(a);
      const bPendingSignal = isCallReceivedOutcomePendingLead(b);
      if (aPendingSignal !== bPendingSignal) return aPendingSignal ? -1 : 1;

      const aTs = getLeadActivityTimestamp(a);
      const bTs = getLeadActivityTimestamp(b);
      if (aTs !== bTs) return bTs - aTs;

      const aDate = normalizeDate(a.follow_up_date) || '9999-12-31';
      const bDate = normalizeDate(b.follow_up_date) || '9999-12-31';
      if (aDate !== bDate) return aDate.localeCompare(bDate);

      return normalizeText(a.customer_name).localeCompare(normalizeText(b.customer_name));
    })
    .map(toReminder);

  return {
    overdueCount: overdue.length,
    todayCount: todayLeads.length,
    tomorrowCount: tomorrowLeads.length,
    weekCount: weekLeads.length,
    allCount: allLeads.length,
    overdueLeads: overdue,
    todayLeads,
    tomorrowLeads,
    weekLeads,
    allLeads,
  };
};

type FollowUpIdentity = {
  id?: number | null;
  lead_id?: number | null;
  call_id?: string | null;
};

const getFollowUpIdentityKey = (item?: FollowUpIdentity | LeadRecord | null): string => {
  if (!item) return '';

  const leadId =
    typeof (item as FollowUpIdentity).lead_id === 'number' && Number.isFinite((item as FollowUpIdentity).lead_id)
      ? (item as FollowUpIdentity).lead_id
      : typeof item.id === 'number' && Number.isFinite(item.id)
        ? item.id
        : null;

  if (leadId !== null) {
    return `lead:${leadId}`;
  }

  const callId = normalizeText((item as FollowUpIdentity).call_id ?? (item as LeadRecord).call_id);
  return callId ? `call:${callId}` : '';
};

export const buildFollowUpSummaryMetrics = (
  leads: LeadRecord[],
  complianceSummary?: Partial<FollowUpComplianceSummary> | null,
  missedItems: FollowUpIdentity[] = [],
): FollowUpSummaryMetrics => {
  const today = getTodayIsoInIst();
  const manualFollowUps = leads.filter((lead) => isValidFollowUpDate(lead.follow_up_date));
  const actionableManualFollowUps = manualFollowUps.filter((lead) => shouldIncludeInManualFollowUpQueue(lead));
  const overdueLeads = actionableManualFollowUps.filter(
    (lead) => normalizeDate(lead.follow_up_date) && normalizeDate(lead.follow_up_date) < today,
  );

  const overdueOrMissedKeys = new Set<string>();
  overdueLeads.forEach((lead) => {
    const key = getFollowUpIdentityKey(lead);
    if (key) overdueOrMissedKeys.add(key);
  });
  missedItems.forEach((item) => {
    const key = getFollowUpIdentityKey(item);
    if (key) overdueOrMissedKeys.add(key);
  });

  const calledSignalCount = actionableManualFollowUps.filter((lead) => hasCalledComplianceSignal(lead)).length;
  const summaryCalledCount = Number(complianceSummary?.called || 0);
  const outcomePendingCount = actionableManualFollowUps.filter((lead) => isCallReceivedOutcomePendingLead(lead)).length;

  return {
    totalFollowUps: manualFollowUps.length,
    pendingFollowUps: actionableManualFollowUps.length,
    dueToday: actionableManualFollowUps.filter((lead) => normalizeDate(lead.follow_up_date) === today).length,
    overdueCount: overdueLeads.length,
    overdueOrMissed: overdueOrMissedKeys.size,
    notificationSent: manualFollowUps.filter((lead) => Boolean(lead.reminder_notification_sent)).length,
    callDone: Math.max(summaryCalledCount, calledSignalCount),
    outcomePending: outcomePendingCount,
    outcomeUpdated: manualFollowUps.filter((lead) => hasUpdatedOutcome(lead)).length,
    successfulOutcomes: manualFollowUps.filter((lead) => hasSuccessfulOutcome(lead)).length,
    rescheduled: manualFollowUps.filter((lead) => Number(lead.follow_up_change_count || 0) > 0).length,
    closedOrCancelled: manualFollowUps.filter((lead) => isClosedOrCancelledFollowUpLead(lead)).length,
  };
};

const SOURCE_COLORS = [
  '#0288D1',
  '#7C3AED',
  '#ED6C02',
  '#2E7D32',
  '#D32F2F',
  '#0D9488',
  '#C2185B',
  '#F57C00',
  '#1565C0',
  '#558B2F',
];

const buildSourceBreakdown = (leads: LeadRecord[]): SourceBreakdownItem[] => {
  const total = leads.length;
  const counts = new Map<string, number>();

  leads.forEach((lead) => {
    const src = normalizeText(lead.source) || 'Unknown';
    counts.set(src, (counts.get(src) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([source, count], index) => ({
      source,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      color: SOURCE_COLORS[index % SOURCE_COLORS.length],
    }));
};

export const buildDashboardMetrics = (
  leads: LeadRecord[],
  followUpSummary?: FollowUpSummaryMetrics,
): DashboardMetrics => {
  const totalLeads = leads.length;
  const contactedLeads = leads.filter((lead) => {
    const status = normalizeStatus(lead.status);
    return Boolean(status) && !CONTACT_EXCLUDED.has(status);
  }).length;
  const appointments = countByStatus(leads, APPOINTMENT_KPI_SET);
  const lostLeads = countByStatus(leads, LOST_SET);

  const notAnswering = leads.filter((lead) => {
    const status = normalizeStatus(lead.status);
    if (status === 'not answering') return true;

    return DAY_FIELDS.some(
      (field) => normalizeStatus(lead[field] as string | null) === 'not answering',
    );
  }).length;

  const highPriority = buildHighPriorityLeads(leads);
  const followUpBuckets = buildFollowUpBuckets(leads);
  const resolvedFollowUpSummary = followUpSummary || buildFollowUpSummaryMetrics(leads);

  return {
    kpis: {
      totalLeads,
      contactedLeads,
      appointments,
      lostLeads,
    },
    statusBreakdown: buildStatusBreakdown(leads),
    sourceBreakdown: buildSourceBreakdown(leads),
    funnel: buildFunnel(leads),
    trend: buildTrend(leads),
    actions: {
      todayFollowUps: resolvedFollowUpSummary.dueToday,
      notAnswering,
      highPriorityCount: highPriority.totalCount,
      highPriorityLeads: highPriority.leads,
    },
    followUps: {
      overdueCount: followUpBuckets.overdueCount,
      todayCount: followUpBuckets.todayCount,
      upcomingCount: followUpBuckets.weekCount,
      overdueLeads: followUpBuckets.overdueLeads.slice(0, 6),
      todayLeads: followUpBuckets.todayLeads.slice(0, 6),
      upcomingLeads: followUpBuckets.weekLeads.slice(0, 6),
    },
    followUpSummary: resolvedFollowUpSummary,
  };
};

