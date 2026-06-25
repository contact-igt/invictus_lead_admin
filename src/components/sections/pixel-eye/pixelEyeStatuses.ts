export const ALL_STATUSES = [
  'Enquiry',
  'Appointment Fixed',
  'Doctor Appointment Fixed',
  'Walk In',
  'Visited',
  'Hot Followup',
  'Followup Post Appointment',
  'Will Call & Take Appointment Later',
  'Not Willing To Come As Of Now',
  'Not Interested',
  'Not Answering',
  'DNP 1',
  'DNP 2',
  'DNP 3',
  'DNP 4',
  'Switch Off',
  'Not In Network',
  'Disconnected',
  'Number Not In Service',
  'Incoming Call Not Available',
  'On Another Call Busy',
  'Wrong Number',
  'Not Speaking',
  'DND',
  'Not In Hospital City',
  'Far From Hospital',
  'Going To Other Hospital',
  'Searching For Specific Hospital',
  'Appointment Cancelled As Per Patient Request',
  'Address Requested',
  'Doctor Time Requested',
  'Want To Speak With Doctor',
  'Medicine Enquiry',
  'Missed Call',
  'Closed',
  'Others',
] as const;

export const LEGACY_STATUS_ALIASES: Record<string, string> = {
  'dnp 1': 'DNP 1',
  'dnp 2': 'DNP 2',
  'dnp 3': 'DNP 3',
  'dnp 4': 'DNP 4',
  disconnecting: 'Disconnected',
  'not in hyderabad': 'Not In Hospital City',
  'will call & take appointment later': 'Will Call & Take Appointment Later',
  'not willing to come as of now': 'Not Willing To Come As Of Now',
  'not interested': 'Not Interested',
  'dr abdul appointment fixed': 'Doctor Appointment Fixed',
  'dr poojita appointment fixed': 'Doctor Appointment Fixed',
  'dr ar/kp appointment fixed': 'Doctor Appointment Fixed',
  'appointment cancelled as per patient req': 'Appointment Cancelled As Per Patient Request',
  address: 'Address Requested',
  'doctor time': 'Doctor Time Requested',
  medicine: 'Medicine Enquiry',
  misscall: 'Missed Call',
  'wrong number': 'Wrong Number',
  'wrongly dialed': 'Wrong Number',
  'fraud call': 'Wrong Number',
  'abdul sir family-frnd call': 'Wrong Number',
  'long distance': 'Far From Hospital',
  'baby playing with phone': 'Not Speaking',
};

export const normalizePixelEyeStatus = (status?: string | null): string => {
  const text = String(status || '').trim();
  if (!text) return '';
  const direct = (ALL_STATUSES as readonly string[]).find(
    (value) => value.toLowerCase() === text.toLowerCase(),
  );
  return direct || LEGACY_STATUS_ALIASES[text.toLowerCase()] || text;
};

export const MAIN_STATUS_OPTIONS = ALL_STATUSES.filter(
  (status) => !/^dnp [1-4]$/i.test(status),
);

export const THIRTY_MIN_STATUSES_TO_EXCLUDE = [
  'Switch Off',
  'Not In Network',
  'Disconnected',
  'Not Answering',
  'On Another Call Busy',
  'Incoming Call Not Available',
  'Not Speaking',
  'DND',
  'Missed Call',
] as const;

export const TWENTY_FOUR_HR_STATUSES = [
  'Enquiry',
  'Hot Followup',
  'Others',
  'Followup Post Appointment',
  'Address Requested',
  'Doctor Time Requested',
  'Want To Speak With Doctor',
  'Searching For Specific Hospital',
  'Appointment Cancelled As Per Patient Request',
] as const;

export const FORTY_EIGHT_HR_STATUSES = ['Will Call & Take Appointment Later'] as const;

export const NO_REMINDER_STATUSES = ['Medicine Enquiry'] as const;

export const TERMINATION_STATUSES = [
  'Not In Hospital City',
  'Not Willing To Come As Of Now',
  'Not Interested',
  'Number Not In Service',
  'Wrong Number',
  'Closed',
  'Going To Other Hospital',
  'Far From Hospital',
] as const;

export const NO_ACTION_STATUSES = [
  'Walk In',
  'Appointment Fixed',
  'Doctor Appointment Fixed',
  'Visited',
] as const;

export const SUCCESS_STATUSES = NO_ACTION_STATUSES;
export const FINAL_STATUSES = [...TERMINATION_STATUSES, ...NO_ACTION_STATUSES] as const;
export const ONGOING_STATUSES = ALL_STATUSES.filter(
  (status) => !(FINAL_STATUSES as readonly string[]).includes(status),
);

const DNP_STATUSES = ['DNP 1', 'DNP 2', 'DNP 3', 'DNP 4'] as const;
const DROPDOWN_EXCLUDED_DAY_STATUSES = ['DND'] as const;

export const getDayDropdownStatuses = (dayNumber: number): string[] => {
  if (dayNumber >= 1 && dayNumber <= 4) {
    return ALL_STATUSES.filter(
      (status) =>
        !(DROPDOWN_EXCLUDED_DAY_STATUSES as readonly string[]).includes(status) &&
        !(DNP_STATUSES as readonly string[]).includes(status) ||
        status === DNP_STATUSES[dayNumber - 1],
    );
  }
  if (dayNumber === 5) {
    return [...NO_ACTION_STATUSES, ...TERMINATION_STATUSES, ...NO_REMINDER_STATUSES].filter(
      (status) => !(DROPDOWN_EXCLUDED_DAY_STATUSES as readonly string[]).includes(status),
    );
  }
  return ALL_STATUSES.filter(
    (status) => !(THIRTY_MIN_STATUSES_TO_EXCLUDE as readonly string[]).includes(status),
  );
};

export const DAY_STATUSES = ALL_STATUSES.filter(
  (status) => !(THIRTY_MIN_STATUSES_TO_EXCLUDE as readonly string[]).includes(status),
);

export const PIXEL_EYE_DAY_FIELDS = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'] as const;

type PixelEyeLeadWorkflowLike = Partial<
  Record<(typeof PIXEL_EYE_DAY_FIELDS)[number], string | null | undefined>
> & {
  status?: string | null | undefined;
  follow_up_date?: string | null | undefined;
  followup_state?: string | null | undefined;
  followup_completion_source?: string | null | undefined;
  reminder_permanently_closed?: boolean | null | undefined;
};

const normalizeLeadText = (value?: string | null) => String(value || '').trim();

export const isLeadFollowUpLocked = (lead?: PixelEyeLeadWorkflowLike | null): boolean => {
  if (!lead) return false;

  if (isFinalStatus(normalizeLeadText(lead.status) || null)) {
    return true;
  }

  const normalizedFollowUpState = normalizeLeadText(lead.followup_state).toLowerCase();
  if (Boolean(lead.reminder_permanently_closed) || normalizedFollowUpState === 'cancelled') {
    return true;
  }

  if (normalizedFollowUpState !== 'completed') {
    return false;
  }

  const completionSource = normalizeLeadText(lead.followup_completion_source).toLowerCase();
  return completionSource !== 'notification_sent';
};

export const canClientSetInitialFollowUpDate = (
  lead?: Pick<
    PixelEyeLeadWorkflowLike,
    'follow_up_date' | 'status' | 'followup_state' | 'reminder_permanently_closed'
  > | null,
): boolean => {
  if (isLeadFollowUpLocked(lead)) {
    return false;
  }

  return !normalizeLeadText(lead?.follow_up_date);
};

export const getNextEmptyDayNumber = (
  lead?: Partial<Record<(typeof PIXEL_EYE_DAY_FIELDS)[number], string | null | undefined>> | null,
): number | null => {
  for (let index = 0; index < PIXEL_EYE_DAY_FIELDS.length; index += 1) {
    const field = PIXEL_EYE_DAY_FIELDS[index];
    const value = String(lead?.[field] || '').trim();
    if (!value) {
      return index + 1;
    }
  }

  return null;
};

export const getNextStructuredDayNumber = (
  lead?:
    | PixelEyeLeadWorkflowLike
    | null,
): number | null => {
  if (isLeadFollowUpLocked(lead)) {
    return null;
  }

  for (let index = 0; index < PIXEL_EYE_DAY_FIELDS.length; index += 1) {
    const currentField = PIXEL_EYE_DAY_FIELDS[index];
    const currentValue = String(lead?.[currentField] || '').trim();

    if (index > 0) {
      const previousField = PIXEL_EYE_DAY_FIELDS[index - 1];
      const previousValue = String(lead?.[previousField] || '').trim();

      if (!previousValue) {
        return null;
      }

      if (isStatusTerminalForDays(previousValue)) {
        return null;
      }
    }

    if (!currentValue) {
      return index + 1;
    }
  }

  return null;
};

export type PixelEyeStatus = (typeof ALL_STATUSES)[number];

export const isFinalStatus = (status: string | null): boolean => {
  if (!status) return false;
  return (FINAL_STATUSES as readonly string[]).includes(normalizePixelEyeStatus(status));
};

export const getStatusChipColor = (
  status: string | null,
): 'success' | 'warning' | 'error' | 'default' => {
  if (!status) return 'default';
  const normalized = normalizePixelEyeStatus(status);
  if ((SUCCESS_STATUSES as readonly string[]).includes(normalized)) return 'success';
  if ((ONGOING_STATUSES as readonly string[]).includes(normalized)) return 'warning';
  if ((FINAL_STATUSES as readonly string[]).includes(normalized)) return 'error';
  return 'default';
};

export const isStatusTerminalForDays = (status: string | null | undefined): boolean => {
  if (!status) return false;
  const normalized = normalizePixelEyeStatus(status).toLowerCase();
  const terminalStatuses = [...TERMINATION_STATUSES, ...NO_ACTION_STATUSES].map((value) =>
    value.toLowerCase(),
  );
  return terminalStatuses.includes(normalized);
};