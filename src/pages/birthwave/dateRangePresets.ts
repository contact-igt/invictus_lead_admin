// Date-range preset math for the Birthwave dashboard. Operates on calendar
// days using the browser's local date — consistent with the existing raw
// <input type="date"> fields this replaces, and with how the backend's own
// APP_TIME_ZONE-aware helpers interpret plain YYYY-MM-DD strings.
export type DateRangePreset = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'custom';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export const PRESET_LABELS: Record<DateRangePreset, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  '7d': '7D',
  '30d': '30D',
  '90d': '90D',
  custom: 'Custom',
};

const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const resolvePresetRange = (preset: DateRangePreset, today: Date = new Date()): DateRange | null => {
  switch (preset) {
    case 'today':
      return { startDate: toDateKey(today), endDate: toDateKey(today) };
    case 'yesterday': {
      const y = addDays(today, -1);
      return { startDate: toDateKey(y), endDate: toDateKey(y) };
    }
    case '7d':
      return { startDate: toDateKey(addDays(today, -6)), endDate: toDateKey(today) };
    case '30d':
      return { startDate: toDateKey(addDays(today, -29)), endDate: toDateKey(today) };
    case '90d':
      return { startDate: toDateKey(addDays(today, -89)), endDate: toDateKey(today) };
    case 'custom':
      return null;
    default:
      return null;
  }
};

// The immediately preceding period of equal length, used for trend comparison.
export const resolveComparisonRange = (range: DateRange): DateRange => {
  const start = new Date(`${range.startDate}T00:00:00`);
  const end = new Date(`${range.endDate}T00:00:00`);
  const spanDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(spanDays - 1));
  return { startDate: toDateKey(prevStart), endDate: toDateKey(prevEnd) };
};

// Percentage change, or null when it can't be meaningfully derived (e.g. a
// zero baseline) — callers must omit the trend rather than invent a number.
export const percentChange = (current: number, previous: number): number | null => {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};
