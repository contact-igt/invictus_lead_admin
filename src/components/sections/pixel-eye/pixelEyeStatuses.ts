export const ONGOING_STATUSES = [
  'Busy',
  'Not Answering',
  'On Another Call',
  'Switched Off',
  'Missed Call',
  'Dnp 1',
  'Dnp 2',
  'Dnp 3',
  'Dnp 4',
  'Not Speaking',
  'Disconnecting',
  'Not in Network',
  'Incoming Call Not Available',
  'Enquiry',
  'Hot Follow-up',
  'Follow-up Required',
  'Will Call Later',
  'Will Call & Take Appointment Later',
  'Medicine',
  'Doctor Time',
  'Follow-up Post Appointment',
  'Want to Speak With Doctor',
  'Address Requested',
  'Others',
] as const;

export const FINAL_STATUSES = [
  'DND',
  'Wrong Number',
  'Wrongly Dialed',
  'Fraud Call',
  'Number Not in Service',
  'Appointment Fixed',
  'Appointment Cancelled',
  'Visited',
  'Walk-in',
  'Not Interested',
  'Not Willing to Come Now',
  'Searching for Specific Hospital',
  'Going to Other Hospital',
  'Not in Hyderabad',
  'Long Distance',
  'Closed',
] as const;

export const SUCCESS_STATUSES = ['Appointment Fixed', 'Visited', 'Walk-in'] as const;

export const THIRTY_MIN_STATUSES_TO_EXCLUDE = [
  'Busy',
  'Not Answering',
  'Switched Off',
  'Missed Call',
  'On Another Call',
  'DND',
  'Not Speaking',
  'Disconnecting',
  'Not in Network',
  'Incoming Call Not Available',
] as const;

export const TWENTY_FOUR_HR_STATUSES = [
  'Enquiry',
  'Hot Follow-up',
  'Follow-up Required',
  'Will Call Later',
  'Doctor Time',
  'Follow-up Post Appointment',
  'Want to Speak With Doctor',
  'Appointment Cancelled',
  'Address Requested',
  'Searching for Specific Hospital',
  'Others',
] as const;

export const FORTY_EIGHT_HR_STATUSES = ['Will Call & Take Appointment Later'] as const;

export const TERMINATION_STATUSES = [
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
] as const;

export const NO_ACTION_STATUSES = ['Appointment Fixed', 'Visited'] as const;

export const ALL_STATUSES = [...ONGOING_STATUSES, ...FINAL_STATUSES] as const;

// Helper to filter and return the correct dropdown statuses for each day
export const getDayDropdownStatuses = (dayNumber: number): string[] => {
  const nonThirtyMin = ALL_STATUSES.filter(
    (status) => !(THIRTY_MIN_STATUSES_TO_EXCLUDE as readonly string[]).includes(status),
  );

  const otherStatuses = nonThirtyMin.filter(
    (status) =>
      !(TWENTY_FOUR_HR_STATUSES as readonly string[]).includes(status) &&
      !(FORTY_EIGHT_HR_STATUSES as readonly string[]).includes(status) &&
      !['Dnp 1', 'Dnp 2', 'Dnp 3', 'Dnp 4'].includes(status),
  );

  if (dayNumber === 1) {
    return ['Dnp 1', ...TWENTY_FOUR_HR_STATUSES, ...FORTY_EIGHT_HR_STATUSES, ...otherStatuses];
  }
  if (dayNumber === 2) {
    return ['Dnp 2', ...TWENTY_FOUR_HR_STATUSES, ...FORTY_EIGHT_HR_STATUSES, ...otherStatuses];
  }
  if (dayNumber === 3) {
    return ['Dnp 3', ...TWENTY_FOUR_HR_STATUSES, ...FORTY_EIGHT_HR_STATUSES, ...otherStatuses];
  }
  if (dayNumber === 4) {
    return ['Dnp 4', ...TWENTY_FOUR_HR_STATUSES, ...FORTY_EIGHT_HR_STATUSES, ...otherStatuses];
  }
  if (dayNumber === 5) {
    return otherStatuses;
  }
  return nonThirtyMin;
};

export const DAY_STATUSES = ALL_STATUSES.filter(
  (status) => !(THIRTY_MIN_STATUSES_TO_EXCLUDE as readonly string[]).includes(status),
);

export type PixelEyeStatus = (typeof ALL_STATUSES)[number];

export const isFinalStatus = (status: string | null): boolean => {
  if (!status) return false;
  return (FINAL_STATUSES as readonly string[]).includes(status);
};

export const getStatusChipColor = (
  status: string | null,
): 'success' | 'warning' | 'error' | 'default' => {
  if (!status) return 'default';
  if ((SUCCESS_STATUSES as readonly string[]).includes(status)) return 'success';
  if ((ONGOING_STATUSES as readonly string[]).includes(status)) return 'warning';
  if ((FINAL_STATUSES as readonly string[]).includes(status)) return 'error';
  return 'default';
};

export const isStatusTerminalForDays = (status: string | null | undefined): boolean => {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  const terminalStatuses = [
    ...TERMINATION_STATUSES,
    ...NO_ACTION_STATUSES,
    'Converted',
    'Invalid Number',
    'Patient not required',
  ].map((v) => v.toLowerCase());

  return terminalStatuses.includes(s);
};
