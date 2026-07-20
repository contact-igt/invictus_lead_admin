 
import React from 'react';
import { useField, useFormikContext, FormikValues } from 'formik';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import IconifyIcon from 'components/base/IconifyIcon';
import AppErrorMessage from 'components/common/Forms/AppErrorMessage'; 

export type AppFormTextFieldProps = TextFieldProps & {
  name: string;
  icon?: string;
};

const AppFormTextField: React.FC<AppFormTextFieldProps> = ({
  name,
  icon,
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
        InputProps={{
          ...inputProps,
          startAdornment: icon ? (
            <InputAdornment position="start">
              <IconifyIcon icon={icon} />
            </InputAdornment>
          ) : (
            inputProps?.startAdornment
          ),
          sx: {
            marginTop: '30px !important',
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

export default AppFormTextField;
