 
import React, { useRef, useState, useEffect } from 'react';
import { useField, useFormikContext, FormikValues } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconifyIcon from 'components/base/IconifyIcon';
import AppErrorMessage from 'components/common/Forms/AppErrorMessage';

type Props = {
  name: string;
  size?: number;
  placeholderIcon?: string;
};

const AppFormImagePicker: React.FC<Props> = ({ name, size = 150, placeholderIcon = 'mdi-dog' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setFieldValue, touched, errors } = useFormikContext<FormikValues>();
  const [field] = useField(name);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (field.value instanceof File) {
      const objectUrl = URL.createObjectURL(field.value);
      setPreviewUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
    if (typeof field.value === 'string' && field.value) {
      setPreviewUrl(field.value);
      return;
    }
    setPreviewUrl(null);
  }, [field.value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // store the File object in Formik
      setFieldValue(name, file);
    }
  };

  const showError = Boolean(touched[name] && errors[name]);

  return (
    <Box mb="10px" display="flex" flexDirection="column" alignItems="center">
      <Box
        onClick={() => fileInputRef.current?.click()}
        sx={{
          width: size,
          height: size,
          border: `2px dashed`,
          borderColor: 'primary.main',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          backgroundColor: '#fafafa',
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <IconifyIcon icon={placeholderIcon} width="6rem" height="6rem" />
        )}
      </Box>

      <Button
        variant="outlined"
        size="small"
        onClick={() => fileInputRef.current?.click()}
        sx={{
          mt: 1,
          width: `${size}px`,
          height: '30px',
        }}
      >
        Pick Image
      </Button>

      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} hidden />

      <AppErrorMessage error={String(errors[name] || '')} visible={showError} />
    </Box>
  );
};

export default AppFormImagePicker;
