import { useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
    FormHelperText,
} from '@mui/material';
import { UserPayload } from 'services/management';
import IconifyIcon from 'components/base/IconifyIcon';
import { useClientQuery } from 'components/hooks/useClientQuery';
import { normalizeClientKey } from 'utils/clientKey';

const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().when('isEdit', {
        is: false,
        then: (schema) => schema.required('Password is required').min(8, 'Minimum 8 characters'),
        otherwise: (schema) => schema.notRequired(),
    }),
    mobile: Yup.string()
        .matches(/^[0-9]+$/, 'Must contain only digits')
        .length(10, 'Must be exactly 10 digits')
        .required('Mobile number is required'),
    role: Yup.string().oneOf(['super-admin', 'admin', 'client']).required('Role is required'),
    client_key: Yup.string().when('role', {
        is: (role: string) => role === 'admin' || role === 'client',
        then: (schema) => schema.required('Client Key is required for admin/client users'),
        otherwise: (schema) => schema.notRequired(),
    }),
});

interface UserFormProps {
    initialValues?: any;
    onSubmit: (values: UserPayload) => void;
    onCancel: () => void;
    isLoading?: boolean;
    isReadOnly?: boolean;
}

const UserForm = ({ initialValues, onSubmit, onCancel, isLoading, isReadOnly }: UserFormProps) => {
    const isEdit = !!initialValues;
    const { data: clientRecords = [], isLoading: isClientsLoading } = useClientQuery();

    const formik = useFormik({
        initialValues: {
            title: initialValues?.title || 'Mr',
            username: initialValues?.username || '',
            email: initialValues?.email || '',
            country_code: initialValues?.country_code?.replace('+', '') || '91',
            mobile: initialValues?.mobile || '',
            password: '',
            role: initialValues?.role || 'client',
            client_key: normalizeClientKey(initialValues?.client_key || ''),
            isEdit,
        },
        validationSchema,
        onSubmit: (values) => {
            const payload: any = { ...values };
            delete payload.isEdit;

            if (payload.role === 'super-admin') {
                delete payload.client_key;
            }

            if (isEdit && !payload.password) {
                delete payload.password;
            }
            // Ensure mobile only contains digits before sending
            payload.mobile = payload.mobile.replace(/\D/g, '');
            onSubmit(payload);
        },
    });

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const countryCodes = [
        { label: 'India (+91)', value: '91' },
        { label: 'USA (+1)', value: '1' },
        { label: 'UK (+44)', value: '44' },
        { label: 'UAE (+971)', value: '971' },
        { label: 'Singapore (+65)', value: '65' },
    ];

    const clientKeys = useMemo(() => {
        const options = clientRecords
            .filter((client) => Boolean(client.client_key))
            .map((client) => {
                const value = normalizeClientKey(client.client_key);
                const label = client.name ? `${client.name} (${value})` : value;
                return { label, value };
            });

        const selectedKey = normalizeClientKey(formik.values.client_key);
        if (selectedKey && !options.some((option) => option.value === selectedKey)) {
            options.unshift({ label: selectedKey, value: selectedKey });
        }

        return options;
    }, [clientRecords, formik.values.client_key]);

    const ctrl = {
        height: 44,
        '& .MuiInputBase-root': { height: 44 },
        '& .MuiOutlinedInput-input': { padding: '10px 14px' },
    };

    return (
        <Box
            component="form"
            onSubmit={formik.handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', bgcolor: 'background.paper' }}
        >
            {/* Header */}
            <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        {isEdit ? (isReadOnly ? 'User Details' : 'Edit User') : 'Create User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        User Management
                    </Typography>
                </Box>
                <IconButton onClick={onCancel} size="small" sx={{ color: 'text.secondary' }}>
                    <IconifyIcon icon="mdi:close" width={22} height={22} />
                </IconButton>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />

            {/* Body */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
                {/* Row 1 - Title + Username */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2.5} alignItems="stretch">
                    <FormControl disabled={isReadOnly} sx={{ width: { xs: '100%', sm: 140 }, ...ctrl }}>
                        <InputLabel id="title-label">Title</InputLabel>
                        <Select labelId="title-label" name="title" value={formik.values.title} label="Title" onChange={formik.handleChange}>
                            <MenuItem value="Mr">Mr.</MenuItem>
                            <MenuItem value="Ms">Ms.</MenuItem>
                            <MenuItem value="Mrs">Mrs.</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        name="username"
                        label="Username"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && typeof formik.errors.username === 'string' ? formik.errors.username : ''}
                        disabled={isReadOnly}
                        sx={ctrl}
                    />
                </Stack>

                {/* Row 2 - Email */}
                <TextField
                    fullWidth
                    name="email"
                    label="Email Address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && typeof formik.errors.email === 'string' ? formik.errors.email : ''}
                    disabled={isReadOnly}
                    sx={{ ...ctrl, mb: 2.5 }}
                />

                {/* Row 3 - Country code + Mobile */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2.5} alignItems="stretch">
                    <FormControl disabled={isReadOnly} sx={{ width: { xs: '100%', sm: 160 }, ...ctrl }}>
                        <InputLabel id="cc-label">Code</InputLabel>
                        <Select labelId="cc-label" name="country_code" value={formik.values.country_code} label="Code" onChange={formik.handleChange}>
                            {countryCodes.map((cc) => (
                                <MenuItem key={cc.value} value={cc.value}>+{cc.value}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        name="mobile"
                        label="Mobile Number"
                        value={formik.values.mobile}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 20) formik.setFieldValue('mobile', val);
                        }}
                        error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                        helperText={formik.touched.mobile && typeof formik.errors.mobile === 'string' ? formik.errors.mobile : ''}
                        disabled={isReadOnly}
                        sx={ctrl}
                    />
                </Stack>

                {/* Row 4 - Password (create / edit only) */}
                {!isReadOnly && (
                    <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        label={isEdit ? 'New Password (Optional)' : 'Password'}
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && typeof formik.errors.password === 'string' ? formik.errors.password : ''}
                        sx={{ ...ctrl, mb: 2.5 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClickShowPassword} edge="end" size="small">
                                        <IconifyIcon icon={showPassword ? 'mingcute:eye-line' : 'mingcute:eye-close-line'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                )}

                {/* Row 5 - Role + Client (when role = client) */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
                    <FormControl disabled={isReadOnly} sx={{ flex: 1, ...ctrl }}>
                        <InputLabel id="role-label">Account Role</InputLabel>
                        <Select labelId="role-label" name="role" value={formik.values.role} label="Account Role" onChange={formik.handleChange}>
                            <MenuItem value="super-admin">Super Admin</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="client">Client</MenuItem>
                        </Select>
                    </FormControl>
                    {formik.values.role !== 'super-admin' && (
                        <FormControl
                            error={formik.touched.client_key && Boolean(formik.errors.client_key)}
                            disabled={isReadOnly || isClientsLoading}
                            sx={{ flex: 1, ...ctrl }}
                        >
                            <InputLabel id="client-key-label">Client</InputLabel>
                            <Select labelId="client-key-label" name="client_key" value={formik.values.client_key} label="Client" onChange={formik.handleChange}>
                                {clientKeys.length === 0 ? (
                                    <MenuItem value="" disabled>
                                        No clients available
                                    </MenuItem>
                                ) : null}
                                {clientKeys.map((ck) => (
                                    <MenuItem key={ck.value} value={ck.value}>{ck.label}</MenuItem>
                                ))}
                            </Select>
                            {formik.touched.client_key && formik.errors.client_key ? (
                                <FormHelperText>
                                    {typeof formik.errors.client_key === 'string' ? formik.errors.client_key : ''}
                                </FormHelperText>
                            ) : null}
                        </FormControl>
                    )}
                </Stack>
            </Box>

            <Box sx={{ borderTop: 1, borderColor: 'divider' }} />

            {/* Footer */}
            <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'flex-end', gap: 1.5 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    sx={{
                        height: 44,
                        px: 3,
                        width: { xs: '100%', sm: 'auto' },
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: 'divider',
                        color: 'text.secondary',
                        '&:hover': { borderColor: 'text.secondary', backgroundColor: 'transparent' },
                    }}
                >
                    {isReadOnly ? 'Close' : 'Cancel'}
                </Button>
                {!isReadOnly && (
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        startIcon={isLoading ? <IconifyIcon icon="eos-icons:loading" /> : null}
                        sx={{
                            height: 44,
                            px: 3.5,
                            width: { xs: '100%', sm: 'auto' },
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: '8px',
                            boxShadow: 'none',
                            backgroundColor: '#2E8B57',
                            '&:hover': { backgroundColor: '#1F6B40', boxShadow: 'none' },
                        }}
                    >
                        {isLoading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create User')}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default UserForm;

