export const ONGOING_STATUSES = [
    'Busy',
    'Not Answering',
    'On Another Call',
    'Switched Off',
    'Missed Call',
    'Not Speaking',
    'Disconnecting',
    'Not in Network',
    'Incoming Call Not Available',
    'Number Not in Service',
    'Enquiry',
    'Hot Follow-up',
    'Follow-up Required',
    'Will Call Later',
    'Rescheduling',
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

export const SUCCESS_STATUSES = [
    'Appointment Fixed',
    'Visited',
    'Walk-in',
] as const;

export const ALL_STATUSES = [...ONGOING_STATUSES, ...FINAL_STATUSES] as const;

export type PixelEyeStatus = typeof ALL_STATUSES[number];

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
