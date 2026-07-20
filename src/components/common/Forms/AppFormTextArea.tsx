 
import React from 'react';
import { useField, useFormikContext, FormikValues } from 'formik';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import IconifyIcon from 'components/base/IconifyIcon';
import AppErrorMessage from 'components/common/Forms/AppErrorMessage';

export type AppFormTextAreaProps = TextFieldProps & {
  name: string;
  icon?: string;
  rows?: number;
  multiline?: boolean;
};

const AppFormTextArea: React.FC<AppFormTextAreaProps> = ({
  name,
  icon,
  rows = 4,
  multiline = true,
  InputProps: inputProps,
  ...textFieldProps
}) => {
  const { touched, errors } = useFormikContext<FormikValues>();
  const [field] = useField(name);

  const showError = Boolean(touched[name] && errors[name]);

  return (
    <Box mb="10px">
      <TextField
        {...field}
        {...textFieldProps}
        name={name}
        id={name}
        error={false}
        helperText={null}
        multiline={multiline}
        {...(multiline ? { rows } : {})}
        InputProps={{
          ...inputProps,
          startAdornment: icon ? (
            <InputAdornment
              position="start"
              sx={{ alignSelf: 'flex-start', mt: '10px !important' }}
            >
              <IconifyIcon icon={icon} />
            </InputAdornment>
          ) : (
            inputProps?.startAdornment
          ),
          sx: {
            mt: '30px !important',
            ...(inputProps?.sx || {}),
          },
        }}
        InputLabelProps={{
          style: { color: 'inherit' },
        }}
        fullWidth
      />
      <AppErrorMessage error={String(errors[name] || '')} visible={showError} />
    </Box>
  );
};

export default AppFormTextArea;
