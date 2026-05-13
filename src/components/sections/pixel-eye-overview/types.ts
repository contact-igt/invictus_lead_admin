export interface LeadRecord {
    id: number;
    client_id?: number | null;
    date?: string | null;
    time?: string | null;
    call_id?: string | null;
    customer_name?: string | null;
    phone_number?: string | null;
    agent_name?: string | null;
    source?: string | null;
    type_of_enquiry?: string | null;
    follow_up_date?: string | null;
    status?: string | null;
    day_1?: string | null;
    day_2?: string | null;
    day_3?: string | null;
    day_4?: string | null;
    day_5?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface DashboardFilters {
    dateFrom: string;
    dateTo: string;
    agent: string;
}

export interface KPIItem {
    key: string;
    label: string;
    value: number;
    icon: string;
    color: 'primary' | 'success' | 'warning' | 'error';
    subtext?: string;
}

export interface StatusCategoryItem {
    label: 'Converted' | 'Follow-up' | 'In Progress' | 'Lost' | 'Invalid';
    count: number;
    color: string;
}

export interface FunnelStageItem {
    stage: 'Leads' | 'Contacted' | 'Interested' | 'Appointment' | 'Visited';
    count: number;
    percent: number;
}

export interface TrendPoint {
    day: string; // ISO date 'YYYY-MM-DD'
    contacted: number;
    converted: number;
}

export interface HighPriorityLead {
    id: number;
    customer_name: string;
    phone_number: string;
    agent_name: string;
    status: string;
    follow_up_date: string;
}

export interface FollowUpReminder {
    id: number;
    customer_name: string;
    phone_number: string;
    agent_name: string;
    status: string;
    follow_up_date: string;
    daysRelative: number; // negative = overdue, 0 = today, positive = upcoming
}

export interface FollowUpMetrics {
    overdueCount: number;
    todayCount: number;
    upcomingCount: number;
    overdueLeads: FollowUpReminder[];
    todayLeads: FollowUpReminder[];
    upcomingLeads: FollowUpReminder[];
}

export interface SourceBreakdownItem {
    source: string;
    count: number;
    percent: number;
    color: string;
}

export interface DashboardMetrics {
    kpis: {
        totalLeads: number;
        contactedLeads: number;
        appointments: number;
        lostLeads: number;
    };
    statusBreakdown: StatusCategoryItem[];
    sourceBreakdown: SourceBreakdownItem[];
    funnel: FunnelStageItem[];
    trend: TrendPoint[];
    actions: {
        todayFollowUps: number;
        notAnswering: number;
        highPriorityCount: number;
        highPriorityLeads: HighPriorityLead[];
    };
    followUps: FollowUpMetrics;
}
