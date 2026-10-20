import type { Tone } from 'components/ui';

export type FollowUpBucketKey =
  | 'all'
  | 'overdue'
  | 'today'
  | 'tomorrow'
  | 'week'
  | 'missed'
  | 'priority'
  | 'outcome-updated'
  | 'successful-outcomes';

/**
 * Nine queues mapped onto four semantic tones.
 *
 * The previous palette used nine unrelated accent hues (amber, blue, green,
 * red, amber, blue, emerald, cyan, rose) which carried no meaning — two
 * different queues shared amber while "today" and "tomorrow" looked unrelated.
 * Tone now encodes urgency, so colour is readable without memorising it.
 */
export const queueTone: Record<FollowUpBucketKey, Tone> = {
  priority: 'warning', // call received, outcome still owed
  overdue: 'danger',
  missed: 'danger',
  today: 'warning',
  tomorrow: 'info',
  week: 'info',
  all: 'neutral',
  'outcome-updated': 'success',
  'successful-outcomes': 'success',
};

export const queueIcon: Record<FollowUpBucketKey, string> = {
  priority: 'solar:phone-calling-linear',
  'outcome-updated': 'solar:clipboard-check-linear',
  'successful-outcomes': 'solar:verified-check-linear',
  overdue: 'solar:danger-circle-linear',
  today: 'solar:calendar-mark-linear',
  tomorrow: 'solar:calendar-linear',
  week: 'solar:calendar-date-linear',
  all: 'solar:layers-minimalistic-linear',
  missed: 'solar:phone-rounded-cross-linear',
};
