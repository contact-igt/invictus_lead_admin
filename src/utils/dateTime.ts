export const APP_TIME_ZONE = import.meta.env.VITE_APP_TIME_ZONE || 'Asia/Kolkata';
const APP_TIME_ZONE_OFFSET = '+05:30';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NAIVE_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/;

export const parseAppDateTime = (value?: string | number | Date | null): Date | null => {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date) {
    const copy = new Date(value.getTime());
    return Number.isNaN(copy.getTime()) ? null : copy;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = new Date(value < 1e12 ? value * 1000 : value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const text = String(value).trim();
  if (!text) return null;
  const normalized = DATE_ONLY_PATTERN.test(text)
    ? `${text}T00:00:00${APP_TIME_ZONE_OFFSET}`
    : NAIVE_DATE_TIME_PATTERN.test(text)
      ? `${text.replace(' ', 'T')}${APP_TIME_ZONE_OFFSET}`
      : text;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getAppDateKey = (value: string | number | Date = new Date()): string => {
  const parsed = parseAppDateTime(value);
  if (!parsed) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(parsed);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
};

export const normalizeAppDate = (value?: string | number | Date | null): string => {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (DATE_ONLY_PATTERN.test(text)) return text;
  if (NAIVE_DATE_TIME_PATTERN.test(text)) return text.slice(0, 10);
  return getAppDateKey(value as string | number | Date);
};

export const formatAppDateTime = (
  value?: string | number | Date | null,
  options: Intl.DateTimeFormatOptions = {},
): string => {
  const parsed = parseAppDateTime(value);
  if (!parsed) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: APP_TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  }).format(parsed);
};

export const formatAppDate = (value?: string | number | Date | null): string =>
  formatAppDateTime(value, { hour: undefined, minute: undefined, hour12: undefined });

export const addCalendarDays = (isoDate: string, days: number): string => {
  if (!DATE_ONLY_PATTERN.test(isoDate)) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

export const calendarDaysBetween = (fromIso: string, toIso: string): number => {
  if (!DATE_ONLY_PATTERN.test(fromIso) || !DATE_ONLY_PATTERN.test(toIso)) return 0;
  const toUtc = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUtc(toIso) - toUtc(fromIso)) / 86400000);
};