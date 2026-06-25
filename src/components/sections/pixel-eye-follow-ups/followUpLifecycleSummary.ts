import type { PixelEyeFollowUpCallComplianceRow } from 'components/hooks/usePixelEyeQuery';
import type { FollowUpHistoryRow } from './FollowUpLifecycleDetails';
import { getHistoryMetadata } from './FollowUpLifecycleDetails';
import { FINAL_STATUSES, normalizePixelEyeStatus } from '../pixel-eye/pixelEyeStatuses';

type LeadLike = {
    follow_up_date?: string | null;
    status?: string | null;
    reminder_permanently_closed?: boolean | null;
    followup_state?: string | null;
    followup_completion_source?: string | null;
    reminder_notification_sent?: boolean | null;
    reminder_cancel_reason?: string | null;
};

export interface FollowUpLifecycleSummaryInput {
    lead?: LeadLike | null;
    historyRows?: FollowUpHistoryRow[];
    complianceRows?: PixelEyeFollowUpCallComplianceRow[];
}

export interface FollowUpLifecycleSummary {
    totalCreated: number;
    totalDone: number;
    totalMissed: number;
    totalCancelled: number;
    totalRescheduled: number;
    currentState:
    | 'Pending'
    | 'Reminder Sent'
    | 'Done'
    | 'Missed'
    | 'Cancelled'
    | 'Closed'
    | 'No Active Follow-Up';
    latestResult: string | null;
    latestOutcomeStatus: string | null;
    latestDayField: string | null;
    latestFollowUpDate: string | null;
    latestCompletedAt: string | null;
    latestActor: string | null;
    latestSource: string | null;
}

const TERMINAL_STATUS_SET = new Set(
    (FINAL_STATUSES as readonly string[]).map((status) => status.toLowerCase()),
);

const normalizeText = (value?: string | null) => String(value || '').trim();
const normalizeStatus = (value?: string | null) => normalizePixelEyeStatus(value).toLowerCase();
const normalizeDisplayStatus = (value?: string | null) => normalizePixelEyeStatus(value) || null;
const normalizeUpper = (value?: string | null) => normalizeText(value).toUpperCase();

const parseTimestamp = (value?: string | null) => {
    const text = normalizeText(value);
    if (!text) return 0;
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const toUniqueById = <T extends { id?: number | null }>(rows: T[] = []) => {
    const seen = new Set<number>();
    return rows.filter((row) => {
        const id = Number(row?.id || 0);
        if (!Number.isFinite(id) || id <= 0) return true;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

const getLatestOutcomeRow = (historyRows: FollowUpHistoryRow[] = []) => {
    return (
        historyRows
            .filter((row) => String(getHistoryMetadata(row)?.action || '').trim() === 'OUTCOME_APPLIED')
            .slice()
            .sort(
                (a, b) =>
                    parseTimestamp(b.created_at || b.createdAt || null) -
                    parseTimestamp(a.created_at || a.createdAt || null),
            )[0] || null
    );
};

const getLatestComplianceRow = (complianceRows: PixelEyeFollowUpCallComplianceRow[] = []) => {
    return (
        complianceRows
            .slice()
            .sort(
                (a, b) =>
                    parseTimestamp(b.updated_at || b.created_at || null) -
                    parseTimestamp(a.updated_at || a.created_at || null),
            )[0] || null
    );
};

export const buildFollowUpLifecycleSummary = ({
    lead,
    historyRows = [],
    complianceRows = [],
}: FollowUpLifecycleSummaryInput): FollowUpLifecycleSummary => {
    const safeHistoryRows = Array.isArray(historyRows) ? historyRows : [];
    const safeComplianceRows = toUniqueById(Array.isArray(complianceRows) ? complianceRows : []);

    const latestOutcomeRow = getLatestOutcomeRow(safeHistoryRows);
    const latestOutcomeMetadata = getHistoryMetadata(latestOutcomeRow);
    const latestComplianceRow = getLatestComplianceRow(safeComplianceRows);
    const completionSource = normalizeText(lead?.followup_completion_source).toLowerCase();
    const followupState = normalizeText(lead?.followup_state).toLowerCase();
    const latestComplianceStatus = normalizeUpper(latestComplianceRow?.compliance_status);
    const leadStatus = normalizeStatus(lead?.status);
    const activeFollowUpDate = normalizeText(lead?.follow_up_date);

    const totalCreated = safeHistoryRows.filter((row) => normalizeUpper(row.change_type) === 'CREATED').length;
    const totalDone = safeHistoryRows.filter(
        (row) => String(getHistoryMetadata(row)?.action || '').trim() === 'OUTCOME_APPLIED',
    ).length;
    const totalMissedFromCompliance = safeComplianceRows.filter(
        (row) => normalizeUpper(row.compliance_status) === 'MISSED',
    ).length;
    const totalMissedFromHistory = safeHistoryRows.filter((row) => {
        const metadata = getHistoryMetadata(row);
        const action = normalizeText(String(metadata?.action || '')).toLowerCase();
        const reason = normalizeText(row.reason).toLowerCase();
        return action.includes('missed') || reason.includes('missed compliance window');
    }).length;
    const totalMissed = Math.max(totalMissedFromCompliance, totalMissedFromHistory);
    const totalCancelledFromCompliance = safeComplianceRows.filter(
        (row) => normalizeUpper(row.compliance_status) === 'CANCELLED',
    ).length;
    const totalCancelledFromHistory = safeHistoryRows.filter((row) => {
        const metadata = getHistoryMetadata(row);
        const action = normalizeText(String(metadata?.action || '')).toLowerCase();
        const reason = normalizeText(row.reason).toLowerCase();
        return action.includes('cancel') || action.includes('close') || reason.includes('cancel');
    }).length;
    const totalCancelled = Math.max(totalCancelledFromCompliance, totalCancelledFromHistory);
    const totalRescheduled = safeHistoryRows.filter(
        (row) => normalizeUpper(row.change_type) === 'RESCHEDULED',
    ).length;

    let currentState: FollowUpLifecycleSummary['currentState'] = 'No Active Follow-Up';

    if (
        (lead?.reminder_permanently_closed && TERMINAL_STATUS_SET.has(leadStatus)) ||
        TERMINAL_STATUS_SET.has(leadStatus)
    ) {
        currentState = 'Closed';
    } else if (followupState === 'cancelled') {
        currentState = 'Cancelled';
    } else if (latestComplianceStatus === 'MISSED') {
        currentState = 'Missed';
    } else if (latestOutcomeMetadata?.outcome_status) {
        currentState = 'Done';
    } else if (
        activeFollowUpDate &&
        followupState === 'completed' &&
        completionSource === 'notification_sent'
    ) {
        currentState = 'Reminder Sent';
    } else if (activeFollowUpDate) {
        currentState = 'Pending';
    }

    return {
        totalCreated,
        totalDone,
        totalMissed,
        totalCancelled,
        totalRescheduled,
        currentState,
        latestResult:
            normalizeDisplayStatus(String(latestOutcomeMetadata?.new_day_value || '')) ||
            normalizeDisplayStatus(String(latestOutcomeMetadata?.outcome_status || '')) ||
            null,
        latestOutcomeStatus: normalizeDisplayStatus(String(latestOutcomeMetadata?.outcome_status || '')),
        latestDayField: normalizeText(String(latestOutcomeMetadata?.day_field || '')) || null,
        latestFollowUpDate:
            normalizeText(String(latestOutcomeMetadata?.new_follow_up_date || '')) ||
            normalizeText(lead?.follow_up_date) ||
            null,
        latestCompletedAt:
            normalizeText(latestOutcomeRow?.created_at || latestOutcomeRow?.createdAt || null) || null,
        latestActor: normalizeText(latestOutcomeRow?.changed_by_name) || null,
        latestSource: normalizeText(latestOutcomeRow?.source) || null,
    };
};

export default buildFollowUpLifecycleSummary;
