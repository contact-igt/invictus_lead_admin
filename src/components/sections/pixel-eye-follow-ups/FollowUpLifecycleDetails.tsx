import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { normalizePixelEyeStatus } from '../pixel-eye/pixelEyeStatuses';

export interface FollowUpHistoryRow {
    old_follow_up_date?: string | null;
    new_follow_up_date?: string | null;
    change_type?: string | null;
    reason?: string | null;
    changed_by_name?: string | null;
    source?: string | null;
    metadata?: unknown;
    created_at?: string | null;
    createdAt?: string | null;
}

type ResolvedDateValue = {
    value: string | null;
    isDateOnly: boolean;
};

const IST_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
});

const isDateOnlyValue = (value: unknown): boolean =>
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

const pickFirstPresent = (...values: unknown[]): string | null => {
    for (const value of values) {
        if (value === null || value === undefined) continue;
        const text = String(value).trim();
        if (text) return text;
    }

    return null;
};

export const formatValue = (value: unknown, empty = 'empty'): string => {
    if (value === null || value === undefined) return empty;
    const text = String(value).trim();
    return text ? text : empty;
};

const formatStatusValue = (value: unknown, empty = 'empty'): string => {
    const text = formatValue(value, '');
    return text ? normalizePixelEyeStatus(text) : empty;
};

export const formatISTDateTime = (value?: string | null): string => {
    if (!value) return '---';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    const parts = IST_DATE_TIME_FORMATTER.formatToParts(date);
    const getPart = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((part) => part.type === type)?.value || '';

    const day = getPart('day');
    const month = getPart('month');
    const year = getPart('year');
    const hour = getPart('hour');
    const minute = getPart('minute');
    const dayPeriod = getPart('dayPeriod').toUpperCase();

    if (!day || !month || !year || !hour || !minute) {
        return String(value);
    }

    return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod} IST`;
};

export const formatISTDate = (value?: string | null): string => {
    if (!value) return '---';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD MMM YYYY') : String(value);
};

export const normalizeHistoryMetadata = (metadata: unknown) => {
    if (metadata === null || metadata === undefined) return null;
    if (typeof metadata !== 'string') return metadata;

    const text = metadata.trim();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

export const normalizeHistoryRows = (response: any): FollowUpHistoryRow[] => {
    const rows = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.history)
                ? response.data.history
                : Array.isArray(response?.history)
                    ? response.history
                    : [];

    return rows.map((row: any) => ({
        ...(row || {}),
        metadata: normalizeHistoryMetadata(row?.metadata),
    }));
};

export const getHistoryMetadata = (row?: FollowUpHistoryRow | null) =>
    normalizeHistoryMetadata(row?.metadata) as Record<string, any> | null;

export const isOutcomeAppliedHistoryRow = (row?: FollowUpHistoryRow | null): boolean =>
    String(getHistoryMetadata(row)?.action || '').trim() === 'OUTCOME_APPLIED';

export const getLatestOutcomeAppliedHistoryRow = (
    rows: FollowUpHistoryRow[] = [],
): FollowUpHistoryRow | null => rows.find((row) => isOutcomeAppliedHistoryRow(row)) || null;

const formatResolvedDateValue = ({ value, isDateOnly }: ResolvedDateValue): string => {
    if (!value) return 'empty';
    return isDateOnly ? formatISTDate(value) : formatISTDateTime(value);
};

const resolveOldFollowUpDateTime = (
    metadata: Record<string, any>,
    row: FollowUpHistoryRow,
): ResolvedDateValue => {
    const value = pickFirstPresent(
        metadata?.old_follow_up_datetime,
        metadata?.prev_reminder?.scheduled_at,
        metadata?.prev_compliance?.[0]?.scheduled_follow_up_at,
        metadata?.old_follow_up_date,
        row.old_follow_up_date,
    );

    return {
        value,
        isDateOnly: isDateOnlyValue(value),
    };
};

const resolveNewFollowUpDateTime = (
    metadata: Record<string, any>,
    row: FollowUpHistoryRow,
): ResolvedDateValue => {
    const value = pickFirstPresent(
        metadata?.new_reminder?.scheduled_at,
        metadata?.new_follow_up_datetime,
        metadata?.new_follow_up_date,
        row.new_follow_up_date,
    );

    return {
        value,
        isDateOnly: isDateOnlyValue(value),
    };
};

const resolveComplianceAllowedUntil = (metadata: Record<string, any>): string | null =>
    pickFirstPresent(
        metadata?.prev_compliance?.[0]?.allowed_until,
        metadata?.new_compliance?.[0]?.allowed_until,
    );

const formatReminderTransition = (snapshot: Record<string, any> | null | undefined): string => {
    if (!snapshot) return 'none';

    const parts = [
        formatValue(snapshot.state, 'unknown state'),
        formatValue(snapshot.schedule_type, 'no schedule'),
    ];

    if (snapshot.scheduled_at) {
        parts.push(formatISTDateTime(snapshot.scheduled_at));
    }

    if (snapshot.notification_sent) {
        parts.push(
            snapshot.notification_sent_at
                ? `notification sent ${formatISTDateTime(snapshot.notification_sent_at)}`
                : 'notification sent',
        );
    }

    if (snapshot.completion_source) {
        parts.push(`source ${formatValue(snapshot.completion_source, 'unknown')}`);
    }

    return parts.join(' · ');
};

const formatComplianceSummary = (rows: any): string => {
    if (!Array.isArray(rows) || rows.length === 0) return 'none';

    const values = rows
        .map((row) => {
            const status = formatValue(row?.compliance_status, 'unknown');
            const matchedAt = row?.matched_call_started_at
                ? formatISTDateTime(row.matched_call_started_at)
                : null;

            return matchedAt ? `${status} (${matchedAt})` : status;
        })
        .filter(Boolean);

    return values.length > 0 ? Array.from(new Set(values)).join(', ') : 'none';
};

interface FollowUpLifecycleDetailsProps {
    row: FollowUpHistoryRow;
    showFallbackReason?: boolean;
    fallbackNoWrap?: boolean;
}

const FollowUpLifecycleDetails = ({
    row,
    showFallbackReason = false,
    fallbackNoWrap = false,
}: FollowUpLifecycleDetailsProps) => {
    const metadata = getHistoryMetadata(row);

    if (!metadata || metadata.action !== 'OUTCOME_APPLIED') {
        if (!showFallbackReason) {
            return null;
        }

        return (
            <Typography
                variant="body2"
                title={row.reason || ''}
                sx={
                    fallbackNoWrap
                        ? {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }
                        : undefined
                }
            >
                {row.reason || '---'}
            </Typography>
        );
    }

    const oldFollowUp = resolveOldFollowUpDateTime(metadata, row);
    const newFollowUp = resolveNewFollowUpDateTime(metadata, row);
    const allowedUntil = resolveComplianceAllowedUntil(metadata);

    return (
        <Box>
            <Typography variant="body2" fontWeight={600}>
                Outcome updated: {formatStatusValue(metadata.outcome_status, '---')}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                Day updated: {formatValue(metadata.day_field, '---')}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
                Day value: {formatStatusValue(metadata.old_day_value)} {'->'} {formatStatusValue(metadata.new_day_value)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
                Follow-up date: {formatResolvedDateValue(oldFollowUp)} {'->'}{' '}
                {newFollowUp.value ? formatResolvedDateValue(newFollowUp) : 'Cleared'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
                Reminder: {formatReminderTransition(metadata.prev_reminder)} {'->'}{' '}
                {formatReminderTransition(metadata.new_reminder)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
                Compliance: {formatComplianceSummary(metadata.prev_compliance)} {'->'}{' '}
                {formatComplianceSummary(metadata.new_compliance)}
            </Typography>
            {allowedUntil && (
                <Typography variant="caption" color="text.secondary" display="block">
                    Compliance window: Pending until {formatISTDateTime(allowedUntil)}
                </Typography>
            )}
            <Typography variant="caption" color="text.secondary" display="block">
                Reason: {metadata.follow_up_date_cleared_reason || row.reason || '---'}
            </Typography>
        </Box>
    );
};

export default FollowUpLifecycleDetails;