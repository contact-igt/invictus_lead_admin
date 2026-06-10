import { useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { ColumnConfig } from 'config/clients';
import dayjs from 'dayjs';
import { getDayDropdownStatuses, isStatusTerminalForDays } from 'components/sections/pixel-eye/pixelEyeStatuses';

interface DynamicFormProps {
  title: string;
  columns: ColumnConfig[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onCancel: () => void;
  isLoading: boolean;
  isReadOnly?: boolean;
}

const generateValidationSchema = (columns: ColumnConfig[]) => {
  const shape: Record<string, Yup.AnySchema> = {};
  columns.forEach((col) => {
    let validator = Yup.string();
    if (col.required) validator = validator.required(`${col.header} is required`);
    if (col.type === 'email') validator = validator.email('Must be a valid email');
    if (col.type === 'phone') validator = validator.matches(/^[0-9+\-\s]+$/, 'Must be a valid phone number');
    shape[col.field] = validator;
  });
  return Yup.object().shape(shape);
};

// Fields that take full row width
const FULL_WIDTH_TYPES = new Set(['textarea', 'status_chip']);

// Whether a field should span full width based on type or field name
const isFullWidth = (col: ColumnConfig) =>
  FULL_WIDTH_TYPES.has(col.type);

// Day fields get 4-column spans (3 per row)
const isDayField = (field: string) => /^day_[1-5]$/.test(field);

const DAY_FIELDS = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'];

const getDayIndex = (field: string) => DAY_FIELDS.indexOf(field);

const isDayFieldLocked = (values: Record<string, any>, field: string) => {
  const dayIndex = getDayIndex(field);
  if (dayIndex < 0) return false;

  if (isStatusTerminalForDays(values.status)) {
    return true;
  }

  for (let i = 0; i < dayIndex; i++) {
    if (isStatusTerminalForDays(values[DAY_FIELDS[i]])) {
      return true;
    }
  }

  return false;
};

const DynamicForm = ({
  title,
  columns,
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
  isReadOnly = false,
}: DynamicFormProps) => {
  const validationSchema = useMemo(() => generateValidationSchema(columns), [columns]);

  const defaultValues = useMemo(() => {
    const vals: Record<string, any> = {};
    columns.forEach((col) => {
      vals[col.field] = initialValues?.[col.field] !== undefined ? initialValues[col.field] : '';
      if (col.type === 'date' && vals[col.field]) {
        vals[col.field] = dayjs(vals[col.field]).format('YYYY-MM-DD');
      }
    });
    return vals;
  }, [columns, initialValues]);

  const formik = useFormik({
    initialValues: defaultValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const trimmed = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
      );
      onSubmit(trimmed);
    },
  });

  const handleTrimmedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.value = e.target.value.trimStart();
    formik.handleChange(e);
  };

  const handleTrimBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value.trim());
    formik.handleBlur(e);
  };

  const renderField = (col: ColumnConfig, index: number) => {
    const isError = formik.touched[col.field] && Boolean(formik.errors[col.field]);
    const errorText = formik.touched[col.field] ? String(formik.errors[col.field] || '') : '';
    const autoFocus = index === 0;
    const fieldDisabled = isReadOnly || isDayFieldLocked(formik.values, col.field);
    const options = isDayField(col.field)
      ? getDayDropdownStatuses(parseInt(col.field.replace('day_', ''), 10))
      : col.options;
    const lockedHelpText =
      !isReadOnly && isDayFieldLocked(formik.values, col.field)
        ? 'Closed - no next follow-up needed'
        : '';

    const label = (
      <Typography variant="body2" fontWeight={600} color="text.primary" mb={0.5}>
        {col.header}
        {col.required && (
          <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>
            *
          </Box>
        )}
      </Typography>
    );

    switch (col.type) {
      case 'select':
      case 'status_chip':
        return (
          <Box key={col.field}>
            {label}
            <FormControl fullWidth error={isError} disabled={fieldDisabled}>
              <Select
                id={col.field}
                name={col.field}
                value={formik.values[col.field]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select {col.header}
                </MenuItem>
                {options?.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
              {isError && <FormHelperText>{errorText}</FormHelperText>}
              {!isError && lockedHelpText && <FormHelperText>{lockedHelpText}</FormHelperText>}
            </FormControl>
          </Box>
        );

      case 'date':
        return (
          <Box key={col.field}>
            {label}
            <TextField
              fullWidth
              id={col.field}
              name={col.field}
              type="date"
              value={formik.values[col.field]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={isError}
              helperText={errorText}
              autoFocus={autoFocus}
              disabled={fieldDisabled}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );

      case 'time':
        return (
          <Box key={col.field}>
            {label}
            <TextField
              fullWidth
              id={col.field}
              name={col.field}
              type="time"
              value={formik.values[col.field]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={isError}
              helperText={errorText}
              autoFocus={autoFocus}
              disabled={fieldDisabled}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );

      case 'textarea':
        return (
          <Box key={col.field}>
            {label}
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              id={col.field}
              name={col.field}
              placeholder={`Enter ${col.header}`}
              value={formik.values[col.field]}
              onChange={handleTrimmedChange}
              onBlur={handleTrimBlur}
              error={isError}
              helperText={errorText}
              disabled={fieldDisabled}
            />
          </Box>
        );

      case 'email':
        return (
          <Box key={col.field}>
            {label}
            <TextField
              fullWidth
              id={col.field}
              name={col.field}
              type="email"
              placeholder={`Enter ${col.header}`}
              value={formik.values[col.field]}
              onChange={handleTrimmedChange}
              onBlur={handleTrimBlur}
              error={isError}
              helperText={errorText}
              autoFocus={autoFocus}
              disabled={fieldDisabled}
            />
          </Box>
        );

      case 'phone':
        return (
          <Box key={col.field}>
            {label}
            <TextField
              fullWidth
              id={col.field}
              name={col.field}
              type="tel"
              placeholder={`Enter ${col.header}`}
              value={formik.values[col.field]}
              onChange={handleTrimmedChange}
              onBlur={handleTrimBlur}
              error={isError}
              helperText={errorText}
              autoFocus={autoFocus}
              disabled={fieldDisabled}
              inputProps={{ inputMode: 'tel' }}
            />
          </Box>
        );

      case 'text':
      default:
        return (
          <Box key={col.field}>
            {label}
            <TextField
              fullWidth
              id={col.field}
              name={col.field}
              placeholder={`Enter ${col.header}`}
              value={formik.values[col.field]}
              onChange={handleTrimmedChange}
              onBlur={handleTrimBlur}
              error={isError}
              helperText={errorText}
              autoFocus={autoFocus}
              disabled={isReadOnly}
            />
          </Box>
        );
    }
  };

  // Separate main fields from day_1–day_5 fields
  const mainColumns = columns.filter((c) => !isDayField(c.field));
  const dayColumns = columns.filter((c) => isDayField(c.field));
  const mainStartIndex = 0;
  const dayStartIndex = mainColumns.length;

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Sticky Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {isReadOnly ? 'View Record' : initialValues ? 'Edit Record' : 'Create Record'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {title}
          </Typography>
        </Box>
        <IconButton onClick={onCancel} size="small" sx={{ color: 'text.secondary' }}>
          <IconifyIcon icon="mdi:close" width={24} height={24} />
        </IconButton>
      </Box>

      <Divider />

      {/* Scrollable Body */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 3,
          py: 3,
        }}
      >
        {/* Main fields — 2-column grid */}
        <Grid container spacing={2}>
          {mainColumns.map((col, idx) => (
            <Grid
              item
              key={col.field}
              xs={12}
              sm={isFullWidth(col) ? 12 : 6}
            >
              {renderField(col, mainStartIndex + idx)}
            </Grid>
          ))}
        </Grid>

        {/* Follow-up Days section */}
        {dayColumns.length > 0 && (
          <Box mt={3}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Divider sx={{ flex: 1 }} />
              <Chip
                label="Follow-up Days"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary' }}
              />
              <Divider sx={{ flex: 1 }} />
            </Stack>

            <Grid container spacing={2}>
              {dayColumns.map((col, idx) => (
                <Grid item key={col.field} xs={12} sm={4}>
                  {renderField(col, dayStartIndex + idx)}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Sticky Footer */}
      <Box sx={{ px: 3, py: 2.5, backgroundColor: 'background.paper' }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={isLoading}
            size="large"
          >
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading || !formik.isValid}
              size="large"
              startIcon={isLoading ? <IconifyIcon icon="eos-icons:loading" /> : null}
            >
              {isLoading ? 'Saving...' : initialValues ? 'Save Changes' : 'Create Record'}
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default DynamicForm;
