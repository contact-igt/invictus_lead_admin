import dayjs from 'dayjs';

export const formatVlsDateTime = (value?: unknown): string => {
  if (!value) return '---';
  const str = String(value).trim();
  if (!str || str === '---' || str === '-') return '---';

  const parsed = dayjs(str);
  if (!parsed.isValid()) return str;

  // Check if string is date-only or has UTC midnight (00:00:00) time
  const isDateOnlyOrUtcMidnight =
    !str.includes('T') ||
    Boolean(str.match(/T00:00:00(\.000)?(Z|\+00:00)?$/i));

  if (!isDateOnlyOrUtcMidnight) {
    return parsed.format('DD MMM YYYY, hh:mm A');
  }

  return parsed.format('DD MMM YYYY');
};
