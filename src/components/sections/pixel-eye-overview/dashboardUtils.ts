import {
  DashboardFilters,
  DashboardMetrics,
  FollowUpMetrics,
  FollowUpReminder,
  HighPriorityLead,
  LeadRecord,
  SourceBreakdownItem,
  StatusCategoryItem,
  TrendPoint,
} from './types';

// Normalize all known status lists to lowercase to allow case-insensitive matching
const CONTACT_EXCLUDED = new Set(['Not Answering', 'Switched Off'].map((s) => s.toLowerCase()));
const APPOINTMENT_KPI_SET = new Set(['Appointment Fixed', 'Visited', 'Walk-in'].map((s) => s.toLowerCase()));

const CONVERTED_SET = new Set(['Appointment Fixed', 'Visited', 'Walk-in', 'Closed'].map((s) => s.toLowerCase()));
const FOLLOW_UP_SET = new Set([
  'Enquiry',
  'Hot Follow-up',
  'Follow-up Required',
  'Will Call Later',
  'Rescheduling',
  'Doctor Time',
  'Follow-up Post Appointment',
  'Want to Speak With Doctor',
  'Address Requested',
].map((s) => s.toLowerCase()));
const LOST_SET = new Set([
  'Not Interested',
  'Not Willing to Come Now',
  'Searching for Specific Hospital',
  'Going to Other Hospital',
  'Not in Hyderabad',
  'Long Distance',
  'Appointment Cancelled',
].map((s) => s.toLowerCase()));
const INVALID_SET = new Set([
  'Wrong Number',
  'Wrongly Dialed',
  'Fraud Call',
  'Not in Network',
  'Incoming Call Not Available',
  'Number Not in Service',
  'DND',
].map((s) => s.toLowerCase()));

const INTERESTED_SET = new Set([
  ...Array.from(FOLLOW_UP_SET),
  'Enquiry',
  'Appointment Fixed',
  'Visited',
  'Walk-in',
  'Closed',
].map((s) => s.toLowerCase()));

const HIGH_PRIORITY_SET = new Set(['Hot Follow-up', 'Follow-up Required', 'Appointment Fixed'].map((s) => s.toLowerCase()));
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

export const getAvailableAgents = (leads: LeadRecord[]): string[] => {
  return Array.from(
    new Set(
      leads
        .map((lead) => normalizeText(lead.agent_name))
        .filter((name) => Boolean(name)),
    ),
  ).sort((a, b) => a.localeCompare(b));
};

export const applyDashboardFilters = (leads: LeadRecord[], filters: DashboardFilters): LeadRecord[] => {
  const { dateFrom, dateTo, agent } = filters;
  const normalizedAgent = normalizeText(agent).toLowerCase();

  return leads.filter((lead) => {
    const leadDate = normalizeDate(lead.date);
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
  const appointment = leads.filter((lead) => normalizeStatus(lead.status) === 'appointment fixed').length;
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

const buildFollowUpReminders = (leads: LeadRecord[]): FollowUpMetrics => {
  const today = todayIso();
  const in7Days = addDays(today, 7);

  const leadsWithDate = leads.filter((lead) => Boolean(normalizeDate(lead.follow_up_date)));

  const toReminder = (lead: LeadRecord): FollowUpReminder => {
    const fud = normalizeDate(lead.follow_up_date) || '';
    return {
      id: lead.id,
      customer_name: normalizeText(lead.customer_name) || 'Unknown',
      phone_number: normalizeText(lead.phone_number) || 'N/A',
      agent_name: normalizeText(lead.agent_name) || 'Unassigned',
      status: normalizeText(lead.status) || 'N/A',
      follow_up_date: fud,
      daysRelative: daysBetween(today, fud),
    };
  };

  const overdue = leadsWithDate
    .filter((lead) => normalizeDate(lead.follow_up_date)! < today)
    .sort((a, b) => normalizeDate(a.follow_up_date)!.localeCompare(normalizeDate(b.follow_up_date)!))
    .map(toReminder);

  const todayLeads = leadsWithDate
    .filter((lead) => normalizeDate(lead.follow_up_date) === today)
    .map(toReminder);

  const upcoming = leadsWithDate
    .filter((lead) => {
      const fud = normalizeDate(lead.follow_up_date)!;
      return fud > today && fud <= in7Days;
    })
    .sort((a, b) => normalizeDate(a.follow_up_date)!.localeCompare(normalizeDate(b.follow_up_date)!))
    .map(toReminder);

  return {
    overdueCount: overdue.length,
    todayCount: todayLeads.length,
    upcomingCount: upcoming.length,
    overdueLeads: overdue.slice(0, 6),
    todayLeads: todayLeads.slice(0, 6),
    upcomingLeads: upcoming.slice(0, 6),
  };
};

const SOURCE_COLORS = [
  '#0288D1', '#7C3AED', '#ED6C02', '#2E7D32', '#D32F2F',
  '#0D9488', '#C2185B', '#F57C00', '#1565C0', '#558B2F',
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

export const buildDashboardMetrics = (leads: LeadRecord[]): DashboardMetrics => {  const totalLeads = leads.length;
  const contactedLeads = leads.filter((lead) => {
    const status = normalizeStatus(lead.status);
    return Boolean(status) && !CONTACT_EXCLUDED.has(status);
  }).length;
  const appointments = countByStatus(leads, APPOINTMENT_KPI_SET);
  const lostLeads = countByStatus(leads, LOST_SET);

  const today = todayIso();
  const todayFollowUps = leads.filter((lead) => normalizeDate(lead.follow_up_date) === today).length;

  const notAnswering = leads.filter((lead) => {
    const status = normalizeStatus(lead.status);
    if (status === 'not answering') return true;

    return DAY_FIELDS.some((field) => normalizeStatus(lead[field] as string | null) === 'not answering');
  }).length;

  const highPriority = buildHighPriorityLeads(leads);

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
    followUps: buildFollowUpReminders(leads),
  };
};
