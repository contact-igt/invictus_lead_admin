import {
  DashboardFilters,
  DashboardMetrics,
  FollowUpBuckets,
  FollowUpPageBuckets,
  FollowUpReminder,
  HighPriorityLead,
  LeadRecord,
  SourceBreakdownItem,
  StatusCategoryItem,
  TrendPoint,
} from './types';

// Normalize all known status lists to lowercase to allow case-insensitive matching
const CONTACT_EXCLUDED = new Set(['Not Answering', 'Switched Off'].map((s) => s.toLowerCase()));
const APPOINTMENT_KPI_SET = new Set(
  ['Appointment Fixed', 'Visited', 'Walk-in'].map((s) => s.toLowerCase()),
);

const CONVERTED_SET = new Set(
  ['Appointment Fixed', 'Visited', 'Walk-in', 'Closed'].map((s) => s.toLowerCase()),
);
const FOLLOW_UP_SET = new Set(
  [
    'Enquiry',
    'Hot Follow-up',
    'Follow-up Required',
    'Will Call Later',
    'Will Call & Take Appointment Later',
    'Medicine',
    'Doctor Time',
    'Follow-up Post Appointment',
    'Want to Speak With Doctor',
    'Appointment Cancelled',
    'Address Requested',
    'Searching for Specific Hospital',
    'Others',
  ].map((s) => s.toLowerCase()),
);
const LOST_SET = new Set(
  [
    'Not Interested',
    'Not Willing to Come Now',
    'Searching for Specific Hospital',
    'Going to Other Hospital',
    'Not in Hyderabad',
    'Long Distance',
    'Appointment Cancelled',
  ].map((s) => s.toLowerCase()),
);
const INVALID_SET = new Set(
  [
    'Wrong Number',
    'Wrongly Dialed',
    'Fraud Call',
    'Not in Network',
    'Incoming Call Not Available',
    'Number Not in Service',
    'DND',
  ].map((s) => s.toLowerCase()),
);

const TERMINAL_STATUS_SET = new Set(
  [
    'Wrong Number',
    'Wrongly Dialed',
    'Fraud Call',
    'Not Interested',
    'Not Willing to Come Now',
    'Going to Other Hospital',
    'Not in Hyderabad',
    'Long Distance',
    'Number Not in Service',
    'Walk-in',
    'Closed',
    'Appointment Fixed',
    'Visited',
  ].map((s) => s.toLowerCase()),
);

const INTERESTED_SET = new Set(
  [
    ...Array.from(FOLLOW_UP_SET),
    'Enquiry',
    'Appointment Fixed',
    'Visited',
    'Walk-in',
    'Closed',
  ].map((s) => s.toLowerCase()),
);

const HIGH_PRIORITY_SET = new Set(
  ['Hot Follow-up', 'Follow-up Required', 'Appointment Fixed'].map((s) => s.toLowerCase()),
);
const DAY_FIELDS: Array<keyof LeadRecord> = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'];

const normalizeDate = (value?: string | null): string => {
  if (!value) return '';

  const trimmed = value.trim();
  const directIsoDate = trimmed.match(/^\d{4}-\d{2}-\d{2}/);
  if (directIsoDate) {
    return directIsoDate[0];
  }

  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return trimmed.slice(0, 10);
};

const normalizeText = (value?: string | null): string => (value || '').trim();
const normalizeStatus = (value?: string | null): string => normalizeText(value).toLowerCase();

const todayIso = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfLocalDay = (isoDate: string): Date => {
  const date = new Date(isoDate);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfWeekIso = (isoDate: string): string => {
  const date = startOfLocalDay(isoDate);
  const day = date.getDay();
  const deltaToSunday = 7 - day;
  date.setDate(date.getDate() + deltaToSunday);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
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

const isHandledReminderState = (state?: string | null): boolean => {
  const normalized = normalizeStatus(state);
  return normalized === 'completed' || normalized === 'cancelled';
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
  if (isHandledReminderState(lead.followup_state)) return false;
  return (
    !isTerminalFollowUpStatus(lead.status) &&
    (isValidFollowUpDate(lead.follow_up_date) || isFollowUpStatus(lead.status))
  );
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

  return leads.filter((lead) => {
    const leadDate =
      normalizeDate(lead.date) || normalizeDate(lead.createdAt) || normalizeDate(lead.created_at);
    const leadAgent = normalizeText(lead.agent_name).toLowerCase();

    const isAfterFrom = !dateFrom || (leadDate && leadDate >= dateFrom);
    const isBeforeTo = !dateTo || (leadDate && leadDate <= dateTo);
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
    (lead) => normalizeStatus(lead.status) === 'appointment fixed',
  ).length;
  const visited = leads.filter((lead) => {
    const status = normalizeStatus(lead.status);
    return status === 'visited' || status === 'walk-in' || status === 'closed';
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
  const today = todayIso();

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

const addDays = (isoDate: string, days: number): string => {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const daysBetween = (fromIso: string, toIso: string): number =>
  Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86400000);

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
  const today = todayIso();
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
  const today = todayIso();
  const tomorrow = addDays(today, 1);
  const weekEnd = endOfWeekIso(today);

  const followUpLeads = leads.filter((lead) => isFollowUpLead(lead));
  const dateBasedLeads = followUpLeads.filter((lead) => isValidFollowUpDate(lead.follow_up_date));

  const toReminder = (lead: LeadRecord): FollowUpReminder => {
    const followUpDate = normalizeDate(lead.follow_up_date) || '';
    return {
      id: lead.id,
      customer_name: normalizeText(lead.customer_name) || 'Unknown',
      phone_number: normalizeText(lead.phone_number) || 'N/A',
      agent_name: normalizeText(lead.agent_name) || 'Unassigned',
      status: normalizeText(lead.status) || 'N/A',
      follow_up_date: followUpDate,
      followup_state: normalizeText(lead.followup_state) || '',
      source: normalizeText(lead.source) || '',
      type_of_enquiry: normalizeText(lead.type_of_enquiry) || '',
      daysRelative: daysBetween(today, followUpDate || today),
    };
  };

  const sortByDateThenActivity = (a: LeadRecord, b: LeadRecord) => {
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

  const allLeads = followUpLeads
    .slice()
    .sort((a, b) => {
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

export const buildDashboardMetrics = (leads: LeadRecord[]): DashboardMetrics => {
  const totalLeads = leads.length;
  const contactedLeads = leads.filter((lead) => {
    const status = normalizeStatus(lead.status);
    return Boolean(status) && !CONTACT_EXCLUDED.has(status);
  }).length;
  const appointments = countByStatus(leads, APPOINTMENT_KPI_SET);
  const lostLeads = countByStatus(leads, LOST_SET);

  const today = todayIso();
  const todayFollowUps = leads.filter(
    (lead) => normalizeDate(lead.follow_up_date) === today,
  ).length;

  const notAnswering = leads.filter((lead) => {
    const status = normalizeStatus(lead.status);
    if (status === 'not answering') return true;

    return DAY_FIELDS.some(
      (field) => normalizeStatus(lead[field] as string | null) === 'not answering',
    );
  }).length;

  const highPriority = buildHighPriorityLeads(leads);
  const followUpBuckets = buildFollowUpBuckets(leads);

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
      todayFollowUps,
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
  };
};
