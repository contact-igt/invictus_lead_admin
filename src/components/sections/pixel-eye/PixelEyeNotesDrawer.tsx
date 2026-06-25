import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import { PixelEyeRow } from './pixelEyeTable';
import PixelEyeField from './PixelEyeField';
import { getPixelEyeFieldSx } from './pixelEyeUi';

interface PixelEyeNotesDrawerProps {
    open: boolean;
    lead?: PixelEyeRow | null;
    isLoading?: boolean;
    onClose: () => void;
    onSubmit: (notes: string) => void;
}

const validationSchema = Yup.object({
    notes: Yup.string().max(5000, 'Notes must be 5000 characters or less').nullable(),
});

const PixelEyeNotesDrawer = ({
    open,
    lead,
    isLoading,
    onClose,
    onSubmit,
}: PixelEyeNotesDrawerProps) => {
    const { mode } = useColorMode();
    const { enqueueSnackbar } = useSnackbar();
    const fieldSx = getPixelEyeFieldSx(mode as any);

    const formik = useFormik<{ notes: string }>({
        initialValues: {
            notes: lead?.notes || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            onSubmit(values.notes);
        },
    });

    useEffect(() => {
        if (!open) {
            formik.resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            formik.setTouched({ notes: true });
            enqueueSnackbar('Please fix the notes field', { variant: 'warning' });
            return;
        }

        formik.handleSubmit(event as any);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 480, md: 540 },
                    maxWidth: '100%',
                    background: mode === 'dark' ? '#0f1b16' : '#ffffff',
                    color: mode === 'dark' ? '#f4fbf6' : '#0F172A',
                    borderLeft: `1px solid ${mode === 'dark' ? 'rgba(129, 199, 132, 0.18)' : '#E2E8F0'}`,
                },
            }}
            ModalProps={{
                BackdropProps: {
                    sx: { backgroundColor: 'rgba(2, 8, 6, 0.68)' },
                },
            }}
        >
            <Box
                component="form"
                onSubmit={handleFormSubmit}
                sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
                <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={2}
                    sx={{
                        px: 3,
                        py: 2.5,
                        borderBottom: '1px solid',
                        borderColor: mode === 'dark' ? 'rgba(176, 205, 185, 0.14)' : '#E2E8F0',
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: mode === 'dark' ? '#FFFFFF' : '#0F172A' }}>
                            Customer Notes
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ mt: 0.5, color: mode === 'dark' ? '#9fb0a6' : '#64748B' }}
                        >
                            {lead?.customer_name || 'Lead'}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        sx={{ color: mode === 'dark' ? '#cfe2d5' : '#64748B' }}
                        aria-label="Close notes drawer"
                    >
                        <IconifyIcon icon="mdi:close" width={20} />
                    </IconButton>
                </Stack>

                <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
                    <PixelEyeField
                        fullWidth
                        multiline
                        rows={12}
                        name="notes"
                        label="Customer Notes"
                        placeholder="Add customer notes..."
                        value={formik.values.notes}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(formik.touched.notes && formik.errors.notes)}
                        helperText={formik.touched.notes && formik.errors.notes}
                        sx={fieldSx}
                    />
                </Box>

                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{
                        px: 3,
                        py: 2.25,
                        backgroundColor: mode === 'dark' ? '#0f1b16' : '#ffffff',
                        borderTop: '1px solid',
                        borderColor: mode === 'dark' ? 'rgba(176, 205, 185, 0.14)' : '#E2E8F0',
                    }}
                >
                    <Button
                        onClick={onClose}
                        color="inherit"
                        sx={{ color: mode === 'dark' ? '#cfe2d5' : '#64748B', textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 800,
                            backgroundColor: mode === 'dark' ? '#1f6b40' : '#1F6B40',
                            '&:hover': {
                                backgroundColor: mode === 'dark' ? '#227a4b' : '#154f2e',
                            },
                        }}
                    >
                        Save Notes
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
};

export default PixelEyeNotesDrawer;