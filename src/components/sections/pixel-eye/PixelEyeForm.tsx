import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { FINAL_STATUSES, ONGOING_STATUSES } from './pixelEyeStatuses';

const DEFAULT_AGENT_NAMES = ['Shadan', 'PXLS RECEPTION SN'] as const;

export interface PixelEyeFormValues {
    date: string;
    time: string;
    call_id: string;
    customer_name: string;
    phone_number: string;
    agent_name: string;
    status: string;
    source?: string;
    type_of_enquiry?: string;
    follow_up_date?: string;
}

interface PixelEyeFormProps {
    initialValues?: Partial<PixelEyeFormValues>;
    onSubmit: (values: PixelEyeFormValues) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const validationSchema = Yup.object({
    date: Yup.string().required('Date is required'),
    time: Yup.string().required('Time is required'),
    call_id: Yup.string().trim().required('Call ID is required'),
    customer_name: Yup.string().trim().required('Customer name is required'),
    phone_number: Yup.string().trim().required('Phone number is required'),
    agent_name: Yup.string().trim().nullable(),
    status: Yup.string().trim().required('Status is required'),
    source: Yup.string().nullable(),
    type_of_enquiry: Yup.string().nullable(),
    follow_up_date: Yup.string().nullable(),
});

const inputSx = {
    minWidth: 0,
    '& .MuiInputBase-root': {
        minHeight: 48,
    },
    '& .MuiFormLabel-root': {
        whiteSpace: 'nowrap',
    },
};

const statusMenuProps = {
    PaperProps: {
        sx: {
            maxHeight: 280,
            overflowY: 'auto',
        },
    },
    MenuListProps: {
        dense: true,
        sx: {
            py: 0.5,
        },
    },
};

const requiredLabel = (label: string) => `${label} *`;

const PixelEyeForm = ({ initialValues, onSubmit, onCancel, isLoading }: PixelEyeFormProps) => {
    const isEdit = Boolean(initialValues?.call_id);
    const agentOptions = initialValues?.agent_name && !DEFAULT_AGENT_NAMES.includes(initialValues.agent_name as (typeof DEFAULT_AGENT_NAMES)[number])
        ? [initialValues.agent_name, ...DEFAULT_AGENT_NAMES]
        : [...DEFAULT_AGENT_NAMES];

    const formik = useFormik<PixelEyeFormValues>({
        initialValues: {
            date: initialValues?.date || '',
            time: initialValues?.time || '',
            call_id: initialValues?.call_id || '',
            customer_name: initialValues?.customer_name || '',
            phone_number: initialValues?.phone_number || '',
            agent_name: initialValues?.agent_name || '',
            status: initialValues?.status || '',
            source: initialValues?.source || '',
            type_of_enquiry: initialValues?.type_of_enquiry || '',
            follow_up_date: initialValues?.follow_up_date || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit,
    });

    return (
        <Box sx={{ p: { xs: 1, sm: 2 }, width: { xs: 'min(92vw, 100%)', sm: 620, md: 700 }, maxWidth: '100%' }}>
            <Typography variant="h5" mb={3} sx={{ fontWeight: 700 }}>
                {isEdit ? 'Edit Pixel Eye Record' : 'Add Pixel Eye Record'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Fields marked with * are mandatory.
            </Typography>

            <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
                <Stack direction="column" spacing={2.25} sx={{ width: '100%' }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                            gap: 2,
                            width: '100%',
                        }}
                    >
                        <TextField
                            fullWidth
                            type="date"
                            name="date"
                            label={requiredLabel('Date')}
                            value={formik.values.date}
                            onChange={formik.handleChange}
                            error={formik.touched.date && Boolean(formik.errors.date)}
                            helperText={formik.touched.date && formik.errors.date ? formik.errors.date : ''}
                            InputLabelProps={{ shrink: true }}
                            sx={inputSx}
                        />
                        <TextField
                            fullWidth
                            type="time"
                            name="time"
                            label={requiredLabel('Time')}
                            value={formik.values.time}
                            onChange={formik.handleChange}
                            error={formik.touched.time && Boolean(formik.errors.time)}
                            helperText={formik.touched.time && formik.errors.time ? formik.errors.time : ''}
                            InputLabelProps={{ shrink: true }}
                            sx={inputSx}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        name="call_id"
                        label={requiredLabel('Call ID')}
                        value={formik.values.call_id}
                        onChange={formik.handleChange}
                        error={formik.touched.call_id && Boolean(formik.errors.call_id)}
                        helperText={formik.touched.call_id && formik.errors.call_id ? formik.errors.call_id : ''}
                        sx={inputSx}
                    />

                    <TextField
                        fullWidth
                        name="customer_name"
                        label={requiredLabel('Customer Name')}
                        value={formik.values.customer_name}
                        onChange={formik.handleChange}
                        error={formik.touched.customer_name && Boolean(formik.errors.customer_name)}
                        helperText={formik.touched.customer_name && formik.errors.customer_name ? formik.errors.customer_name : ''}
                        sx={inputSx}
                    />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                            gap: 2,
                            width: '100%',
                        }}
                    >
                        <FormControl fullWidth error={formik.touched.source && Boolean(formik.errors.source)} sx={{ ...inputSx, minHeight: 48 }} size="medium">
                            <InputLabel id="pixel-eye-source-label" shrink>Source</InputLabel>
                            <Select
                                labelId="pixel-eye-source-label"
                                name="source"
                                value={formik.values.source}
                                label="Source"
                                onChange={formik.handleChange}
                                MenuProps={statusMenuProps}
                                size="medium"
                                sx={{ minHeight: 48 }}
                            >
                                <MenuItem value="Website">Website</MenuItem>
                                <MenuItem value="Facebook">Facebook</MenuItem>
                                <MenuItem value="Google">Google</MenuItem>
                                <MenuItem value="Referral">Referral</MenuItem>
                                <MenuItem value="Walk-in">Walk-in</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                            {formik.touched.source && formik.errors.source ? (
                                <FormHelperText>{formik.errors.source}</FormHelperText>
                            ) : null}
                        </FormControl>

                        <FormControl fullWidth error={formik.touched.type_of_enquiry && Boolean(formik.errors.type_of_enquiry)} sx={{ ...inputSx, minHeight: 48 }} size="medium">
                            <InputLabel id="pixel-eye-enquiry-type-label" shrink>Enquiry Type</InputLabel>
                            <Select
                                labelId="pixel-eye-enquiry-type-label"
                                name="type_of_enquiry"
                                value={formik.values.type_of_enquiry}
                                label="Enquiry Type"
                                onChange={formik.handleChange}
                                MenuProps={statusMenuProps}
                                size="medium"
                                sx={{ minHeight: 48 }}
                            >
                                <MenuItem value="General">General</MenuItem>
                                <MenuItem value="OPD">OPD</MenuItem>
                                <MenuItem value="Surgery">Surgery</MenuItem>
                                <MenuItem value="Emergency">Emergency</MenuItem>
                                <MenuItem value="Diagnostics">Diagnostics</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                            {formik.touched.type_of_enquiry && formik.errors.type_of_enquiry ? (
                                <FormHelperText>{formik.errors.type_of_enquiry}</FormHelperText>
                            ) : null}
                        </FormControl>
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                            gap: 2,
                            width: '100%',
                        }}
                    >
                        <TextField
                            fullWidth
                            name="phone_number"
                            label={requiredLabel('Phone Number')}
                            value={formik.values.phone_number}
                            onChange={formik.handleChange}
                            error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
                            helperText={formik.touched.phone_number && formik.errors.phone_number ? formik.errors.phone_number : ''}
                            sx={inputSx}
                        />
                        <TextField
                            fullWidth
                            type="date"
                            name="follow_up_date"
                            label="Follow-up Date"
                            value={formik.values.follow_up_date}
                            onChange={formik.handleChange}
                            error={formik.touched.follow_up_date && Boolean(formik.errors.follow_up_date)}
                            helperText={formik.touched.follow_up_date && formik.errors.follow_up_date ? formik.errors.follow_up_date : ''}
                            InputLabelProps={{ shrink: true }}
                            sx={inputSx}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                            gap: 2,
                            width: '100%',
                        }}
                    >
                        <FormControl fullWidth error={formik.touched.agent_name && Boolean(formik.errors.agent_name)} sx={inputSx}>
                            <InputLabel id="pixel-eye-agent-label">Agent Name</InputLabel>
                            <Select
                                labelId="pixel-eye-agent-label"
                                name="agent_name"
                                value={formik.values.agent_name}
                                label="Agent Name"
                                onChange={formik.handleChange}
                                MenuProps={statusMenuProps}
                            >
                                <MenuItem value="">Select Agent Name</MenuItem>
                                {agentOptions.map((agentName) => (
                                    <MenuItem key={agentName} value={agentName}>{agentName}</MenuItem>
                                ))}
                            </Select>
                            {formik.touched.agent_name && formik.errors.agent_name ? (
                                <FormHelperText>{formik.errors.agent_name}</FormHelperText>
                            ) : null}
                        </FormControl>
                    </Box>

                    <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)} sx={inputSx}>
                        <InputLabel id="pixel-eye-status-label">{requiredLabel('Status')}</InputLabel>
                        <Select
                            labelId="pixel-eye-status-label"
                            name="status"
                            value={formik.values.status}
                            label={requiredLabel('Status')}
                            onChange={formik.handleChange}
                            MenuProps={statusMenuProps}
                        >
                            {ONGOING_STATUSES.map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                            {FINAL_STATUSES.map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                        {formik.touched.status && formik.errors.status ? (
                            <FormHelperText>{formik.errors.status}</FormHelperText>
                        ) : null}
                    </FormControl>

                    <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
                        <Button onClick={onCancel} fullWidth={false} sx={{ textTransform: 'none', color: 'text.secondary', minWidth: { sm: 110 } }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={isLoading} sx={{ textTransform: 'none', minWidth: { sm: 150 } }}>
                            {isEdit ? 'Save Changes' : 'Create Record'}
                        </Button>
                    </Stack>
                </Stack>
            </form>
        </Box>
    );
};

export default PixelEyeForm;
