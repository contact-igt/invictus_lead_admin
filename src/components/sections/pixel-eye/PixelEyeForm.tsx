import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Button,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
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

const menuProps = {
    PaperProps: {
        sx: { maxHeight: 280, overflowY: 'auto' },
    },
    MenuListProps: { dense: true },
};

const SectionLabel = ({ label }: { label: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Typography
            variant="overline"
            color="text.secondary"
            sx={{ whiteSpace: 'nowrap', lineHeight: 1.5, letterSpacing: '0.07em' }}
        >
            {label}
        </Typography>
        <Divider sx={{ flex: 1 }} />
    </Box>
);

const PixelEyeForm = ({ initialValues, onSubmit, onCancel, isLoading }: PixelEyeFormProps) => {
    const isEdit = Boolean(initialValues?.call_id);
    const agentOptions =
        initialValues?.agent_name &&
        !DEFAULT_AGENT_NAMES.includes(initialValues.agent_name as (typeof DEFAULT_AGENT_NAMES)[number])
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
        onSubmit: (values) => {
            const trimmed = {
                ...values,
                call_id: values.call_id.trim(),
                customer_name: values.customer_name.trim(),
                phone_number: values.phone_number.trim(),
            };
            onSubmit(trimmed);
        },
    });

    const handleTrimmedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.value = e.target.value.trimStart();
        formik.handleChange(e);
    };

    const handleTrimBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        formik.setFieldValue(name, value.trim());
        formik.handleBlur(e);
    };

    return (
        <Box
            sx={{
                p: { xs: 2.5, sm: 3.5 },
                width: { xs: '100%', sm: 620 },
                maxWidth: '100%',
            }}
        >
            {/* Header */}
            <Box sx={{ mb: 3.5 }}>
                <Typography variant="h5" fontWeight={700}>
                    {isEdit ? 'Edit Lead' : 'New Lead'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {isEdit
                        ? 'Update the lead record details below'
                        : 'Fill in the details to create a new pixel eye lead'}
                </Typography>
            </Box>

            <form onSubmit={formik.handleSubmit} noValidate>
                <Stack spacing={3.5}>
                    {/* ─── Call Details ────────────────────────────────────── */}
                    <Box>
                        <SectionLabel label="Call Details" />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="date"
                                    label="Date"
                                    required
                                    value={formik.values.date}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.date && Boolean(formik.errors.date)}
                                    helperText={formik.touched.date && formik.errors.date}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="time"
                                    name="time"
                                    label="Time"
                                    required
                                    value={formik.values.time}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.time && Boolean(formik.errors.time)}
                                    helperText={formik.touched.time && formik.errors.time}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="call_id"
                                    label="Call ID"
                                    required
                                    placeholder="Enter call ID"
                                    value={formik.values.call_id}
                                    onChange={handleTrimmedChange}
                                    onBlur={handleTrimBlur}
                                    error={formik.touched.call_id && Boolean(formik.errors.call_id)}
                                    helperText={formik.touched.call_id && formik.errors.call_id}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* ─── Customer Info ────────────────────────────────────── */}
                    <Box>
                        <SectionLabel label="Customer Info" />
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="customer_name"
                                    label="Customer Name"
                                    required
                                    placeholder="Full name"
                                    value={formik.values.customer_name}
                                    onChange={handleTrimmedChange}
                                    onBlur={handleTrimBlur}
                                    error={formik.touched.customer_name && Boolean(formik.errors.customer_name)}
                                    helperText={formik.touched.customer_name && formik.errors.customer_name}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    name="phone_number"
                                    label="Phone Number"
                                    required
                                    placeholder="+91 00000 00000"
                                    value={formik.values.phone_number}
                                    onChange={handleTrimmedChange}
                                    onBlur={handleTrimBlur}
                                    error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
                                    helperText={formik.touched.phone_number && formik.errors.phone_number}
                                    inputProps={{ inputMode: 'tel' }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="follow_up_date"
                                    label="Follow-up Date"
                                    value={formik.values.follow_up_date}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.follow_up_date && Boolean(formik.errors.follow_up_date)}
                                    helperText={formik.touched.follow_up_date && formik.errors.follow_up_date}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {/* ─── Classification ───────────────────────────────────── */}
                    <Box>
                        <SectionLabel label="Classification" />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControl
                                    fullWidth
                                    error={formik.touched.source && Boolean(formik.errors.source)}
                                >
                                    <InputLabel id="pe-source-label" shrink>
                                        Source
                                    </InputLabel>
                                    <Select
                                        labelId="pe-source-label"
                                        name="source"
                                        value={formik.values.source}
                                        label="Source"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        displayEmpty
                                        notched
                                        MenuProps={menuProps}
                                    >
                                        <MenuItem value="">
                                            <em style={{ opacity: 0.55 }}>None</em>
                                        </MenuItem>
                                        <MenuItem value="Website">Website</MenuItem>
                                        <MenuItem value="Facebook">Facebook</MenuItem>
                                        <MenuItem value="Google">Google</MenuItem>
                                        <MenuItem value="Referral">Referral</MenuItem>
                                        <MenuItem value="Walk-in">Walk-in</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                    {formik.touched.source && formik.errors.source && (
                                        <FormHelperText>{formik.errors.source}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl
                                    fullWidth
                                    error={
                                        formik.touched.type_of_enquiry &&
                                        Boolean(formik.errors.type_of_enquiry)
                                    }
                                >
                                    <InputLabel id="pe-enquiry-label" shrink>
                                        Enquiry Type
                                    </InputLabel>
                                    <Select
                                        labelId="pe-enquiry-label"
                                        name="type_of_enquiry"
                                        value={formik.values.type_of_enquiry}
                                        label="Enquiry Type"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        displayEmpty
                                        notched
                                        MenuProps={menuProps}
                                    >
                                        <MenuItem value="">
                                            <em style={{ opacity: 0.55 }}>None</em>
                                        </MenuItem>
                                        <MenuItem value="General">General</MenuItem>
                                        <MenuItem value="OPD">OPD</MenuItem>
                                        <MenuItem value="Surgery">Surgery</MenuItem>
                                        <MenuItem value="Emergency">Emergency</MenuItem>
                                        <MenuItem value="Diagnostics">Diagnostics</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                    {formik.touched.type_of_enquiry && formik.errors.type_of_enquiry && (
                                        <FormHelperText>{formik.errors.type_of_enquiry}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl
                                    fullWidth
                                    error={formik.touched.agent_name && Boolean(formik.errors.agent_name)}
                                >
                                    <InputLabel id="pe-agent-label">Agent Name</InputLabel>
                                    <Select
                                        labelId="pe-agent-label"
                                        name="agent_name"
                                        value={formik.values.agent_name}
                                        label="Agent Name"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        MenuProps={menuProps}
                                    >
                                        <MenuItem value="">Select Agent</MenuItem>
                                        {agentOptions.map((name) => (
                                            <MenuItem key={name} value={name}>
                                                {name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formik.touched.agent_name && formik.errors.agent_name && (
                                        <FormHelperText>{formik.errors.agent_name}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl
                                    fullWidth
                                    required
                                    error={formik.touched.status && Boolean(formik.errors.status)}
                                >
                                    <InputLabel id="pe-status-label">Status</InputLabel>
                                    <Select
                                        labelId="pe-status-label"
                                        name="status"
                                        value={formik.values.status}
                                        label="Status"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        MenuProps={menuProps}
                                    >
                                        {ONGOING_STATUSES.map((s) => (
                                            <MenuItem key={s} value={s}>
                                                {s}
                                            </MenuItem>
                                        ))}
                                        {FINAL_STATUSES.map((s) => (
                                            <MenuItem key={s} value={s}>
                                                {s}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formik.touched.status && formik.errors.status && (
                                        <FormHelperText>{formik.errors.status}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </Stack>

                {/* Footer */}
                <Stack
                    direction={{ xs: 'column-reverse', sm: 'row' }}
                    spacing={1.5}
                    justifyContent="flex-end"
                    sx={{ pt: 4 }}
                >
                    <Button
                        onClick={onCancel}
                        color="inherit"
                        sx={{ textTransform: 'none', minWidth: { sm: 100 } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        sx={{ textTransform: 'none', minWidth: { sm: 150 } }}
                    >
                        {isEdit ? 'Save Changes' : 'Create Record'}
                    </Button>
                </Stack>
            </form>
        </Box>
    );
};

export default PixelEyeForm;
