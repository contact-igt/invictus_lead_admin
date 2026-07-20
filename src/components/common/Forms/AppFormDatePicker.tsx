 
import React from 'react';
import { useFormikContext, FormikValues } from 'formik';
import Box from '@mui/material/Box';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import AppErrorMessage from 'components/common/Forms/AppErrorMessage';

type MuiDatePickerProps = Omit<React.ComponentProps<typeof DatePicker>, 'value' | 'onChange'>;
type MuiTimePickerProps = Omit<React.ComponentProps<typeof TimePicker>, 'value' | 'onChange'>;
type MuiDateTimePickerProps = Omit<
  React.ComponentProps<typeof DateTimePicker>,
  'value' | 'onChange'
>;

export interface AppFormDateTimePickerProps {
  dateName: string;
  timeName?: string;
  showDate?: boolean;
  showTime?: boolean;
  dateLabel?: string;
  timeLabel?: string;
  datePickerProps?: MuiDatePickerProps | MuiDateTimePickerProps;
  timePickerProps?: MuiTimePickerProps;
}

const AppFormDateTimePicker: React.FC<AppFormDateTimePickerProps> = ({
  dateName,
  timeName,
  showDate = true,
  showTime = true,
  dateLabel,
  timeLabel,
  datePickerProps,
  timePickerProps,
}) => {
  const { values, touched, errors, setFieldValue } = useFormikContext<FormikValues>();

  // ── PARSE DATE VALUE ─────────────────────────────────────────────────────────
  const rawDate = values[dateName];
  let dateValue: Dayjs | null = null;

  if (typeof rawDate === 'string') {
    dateValue = dayjs(rawDate);
  } else if (rawDate instanceof Date) {
    dateValue = dayjs(rawDate);
  } else if (rawDate && (rawDate as Dayjs).isValid?.()) {
    dateValue = rawDate as Dayjs;
  }

  // ── PARSE TIME VALUE ─────────────────────────────────────────────────────────
  let timeValue: Dayjs | null = null;
  if (timeName) {
    const rawTime = values[timeName];
    if (typeof rawTime === 'string') {
      const [h = '0', m = '0', s = '0'] = rawTime.split(':');
      timeValue = dayjs().hour(parseInt(h, 10)).minute(parseInt(m, 10)).second(parseInt(s, 10));
    } else if (rawTime instanceof Date) {
      timeValue = dayjs(rawTime);
    } else if (rawTime && (rawTime as Dayjs).isValid?.()) {
      timeValue = rawTime as Dayjs;
    }
  }

  const dateError = touched[dateName] && errors[dateName] ? String(errors[dateName]) : '';
  const timeError =
    timeName && touched[timeName] && errors[timeName] ? String(errors[timeName]) : '';
  const showDateTime = showDate && showTime && !timeName;

  return (
    <Box display="flex" mb="10px" mt="10px" gap={2}>
      {showDateTime ? (
        <Box flex={1}>
          <DateTimePicker
            label={dateLabel || 'Date & Time'}
            value={dateValue}
            onChange={(newVal) => setFieldValue(dateName, newVal)}
            slotProps={{
              textField: {
                fullWidth: true,
                error: false,
                helperText: null,
                sx: {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: 'none' },
                  },
                  '& .MuiInputBase-input': { height: '30px' },
                },
              },
            }}
            {...(datePickerProps as MuiDateTimePickerProps)}
          />
          {dateError && <AppErrorMessage error={dateError} visible />}
        </Box>
      ) : (
        <>
          {showDate && (
            <Box flex={1}>
              <DatePicker
                label={dateLabel || 'Date'}
                value={dateValue}
                onChange={(newVal) => setFieldValue(dateName, newVal)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: false,
                    helperText: null,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: 'none' },
                      },
                      '& .MuiInputBase-input': { height: '30px' },
                    },
                  },
                }}
                {...(datePickerProps as MuiDatePickerProps)}
              />
              {dateError && <AppErrorMessage error={dateError} visible />}
            </Box>
          )}
          {showTime && timeName && (
            <Box flex={1}>
              <TimePicker
                label={timeLabel || 'Time'}
                value={timeValue}
                onChange={(newVal) => setFieldValue(timeName, newVal)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: false,
                    helperText: null,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: 'none' },
                      },
                      '& .MuiInputBase-input': { height: '30px' },
                    },
                  },
                }}
                {...timePickerProps}
              />
              {timeError && <AppErrorMessage error={timeError} visible />}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AppFormDateTimePicker;
