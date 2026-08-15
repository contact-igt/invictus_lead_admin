import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Icon } from '@iconify/react';
import { useAuth } from 'redux/selectors/auth/authSelector';
import { useLoginMutation } from './hooks/useLogin';
import { getClientHomePath } from 'utils/clientModuleResolver';

// ── Design tokens (Admin Dark Theme) ─────────────────────────────────────────
const TEXT_LIGHT   = 'rgba(240,246,252,0.95)';
const TEXT_MUTED   = 'rgba(240,246,252,0.50)';
const TEXT_LABEL   = 'rgba(240,246,252,0.60)';
const GREEN_ACCENT = '#1A8F68';   // Exact green theme color (#1a8f68)
const INPUT_BG     = '#121723';   // Crisp dark input background

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

// ── Reusable Field Label ──────────────────────────────────────────────────────
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    component="label"
    sx={{
      display: 'block',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: TEXT_LABEL,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      mb: 0.8,
    }}
  >
    {children}
  </Typography>
);

// ── Dark Input SX Style ───────────────────────────────────────────────────────
const darkInputSx = {
  bgcolor: INPUT_BG,
  borderRadius: '14px',
  fontSize: '0.9rem',
  color: TEXT_LIGHT,
  fontWeight: 500,
  '& input': {
    backgroundColor: 'transparent !important',
    border: '0 !important',
    boxShadow: 'none !important',
    color: TEXT_LIGHT,
    caretColor: TEXT_LIGHT,
    outline: '0 !important',
    py: '13px',
    '&::placeholder': { color: 'rgba(240,246,252,0.35)', opacity: 1 },
    '&:focus': {
      backgroundColor: 'transparent !important',
      boxShadow: 'none !important',
      outline: '0 !important',
    },
    '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus': {
      WebkitBoxShadow: `0 0 0 1000px ${INPUT_BG} inset`,
      WebkitTextFillColor: TEXT_LIGHT,
      caretColor: TEXT_LIGHT,
      transition: 'background-color 9999s ease-in-out 0s',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255,255,255,0.10)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(26,143,104,0.40)',
  },
  '&.Mui-focused': {
    bgcolor: INPUT_BG,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: GREEN_ACCENT,
      borderWidth: '1.5px',
    },
  },
  '&.Mui-error .MuiOutlinedInput-notchedOutline': {
    borderColor: '#EF4444',
  },
};

const Signin = () => {
  const { token, user } = useAuth();
  const { mutate, isLoading } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      mutate({ email: values.email.trim(), password: values.password.trim() });
    },
  });

  if (token) {
    if (user?.role === 'client') {
      return <Navigate to={getClientHomePath(user.clientKey)} replace />;
    }
    return <Navigate to="/" replace />;
  }

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
    <Stack direction="column" spacing={0}>
      {/* ── Heading ──────────────────────────────────────────────────────── */}
      <Box mb={4} sx={{ pt: { xs: 1, md: 2.5 } }}>
        <Typography
          sx={{
            fontSize: '2rem',
            fontWeight: 800,
            color: TEXT_LIGHT,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            mb: 1,
          }}
        >
          Welcome back
        </Typography>
        <Typography
          sx={{
            fontSize: '0.9rem',
            color: TEXT_MUTED,
            lineHeight: 1.5,
          }}
        >
          Enter your credentials to access the dashboard.
        </Typography>
      </Box>

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Stack direction="column" spacing={2.5}>

          {/* Email Address */}
          <Box>
            <FieldLabel>EMAIL ADDRESS</FieldLabel>
            <OutlinedInput
              id="email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={handleTrimmedChange}
              onBlur={handleTrimBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              placeholder="admin@invictus.com"
              autoComplete="email"
              autoFocus
              fullWidth
              size="small"
              sx={darkInputSx}
              startAdornment={
                <InputAdornment position="start">
                  <Icon
                    icon="hugeicons:mail-02"
                    width={18}
                    height={18}
                    color="rgba(240,246,252,0.40)"
                  />
                </InputAdornment>
              }
            />
            {formik.touched.email && formik.errors.email && (
              <FormHelperText error sx={{ mt: 0.5, fontSize: '0.73rem' }}>
                {formik.errors.email}
              </FormHelperText>
            )}
          </Box>

          {/* Password */}
          <Box>
            <FieldLabel>PASSWORD</FieldLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={handleTrimmedChange}
              onBlur={handleTrimBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              placeholder="••••••••"
              autoComplete="current-password"
              fullWidth
              size="small"
              sx={darkInputSx}
              startAdornment={
                <InputAdornment position="start">
                  <Icon
                    icon="hugeicons:security-lock"
                    width={18}
                    height={18}
                    color="rgba(240,246,252,0.40)"
                  />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    sx={{ color: 'rgba(240,246,252,0.40)', mr: 0.25 }}
                  >
                    <Icon
                      icon={showPassword ? 'hugeicons:view' : 'hugeicons:view-off'}
                      width={18}
                      height={18}
                    />
                  </IconButton>
                </InputAdornment>
              }
            />
            {formik.touched.password && formik.errors.password && (
              <FormHelperText error sx={{ mt: 0.5, fontSize: '0.73rem' }}>
                {formik.errors.password}
              </FormHelperText>
            )}
          </Box>

          {/* Remember me & Forgot Password */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" pt={0.2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                  sx={{
                    color: 'rgba(240,246,252,0.30)',
                    '&.Mui-checked': {
                      color: GREEN_ACCENT,
                    },
                    py: 0,
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: '0.8rem', color: TEXT_MUTED, fontWeight: 500 }}>
                  Remember me
                </Typography>
              }
            />

            <Link
              href="#!"
              underline="hover"
              sx={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: GREEN_ACCENT,
                '&:hover': { opacity: 0.85 },
                transition: 'opacity 0.15s',
              }}
            >
              Forgot password?
            </Link>
          </Stack>

          {/* Sign in button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isLoading}
            sx={{
              mt: 1,
              height: 50,
              fontSize: '0.95rem',
              fontWeight: 700,
              borderRadius: '14px',
              bgcolor: GREEN_ACCENT,
              color: '#FFFFFF',
              textTransform: 'none',
              letterSpacing: '0.01em',
              boxShadow: '0 4px 14px rgba(26, 143, 104, 0.35)',
              '&:hover': {
                bgcolor: '#147353',
                boxShadow: '0 6px 18px rgba(26, 143, 104, 0.45)',
              },
              '&:active': {
                bgcolor: '#105B42',
                transform: 'scale(0.99)',
              },
              '&.Mui-disabled': {
                bgcolor: '#0D4834',
                color: 'rgba(255,255,255,0.4)',
              },
            }}
          >
            {isLoading ? <CircularProgress size={22} sx={{ color: '#FFFFFF' }} /> : 'Sign In'}
          </Button>

        </Stack>
      </Box>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <Box mt={6} pt={3} sx={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography
          align="center"
          sx={{
            fontSize: '0.72rem',
            color: TEXT_MUTED,
            lineHeight: 1.6,
          }}
        >
          By signing in you agree to the{' '}
          <Link href="#!" underline="hover" sx={{ color: GREEN_ACCENT, fontWeight: 600, '&:hover': { opacity: 0.85 } }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#!" underline="hover" sx={{ color: GREEN_ACCENT, fontWeight: 600, '&:hover': { opacity: 0.85 } }}>
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </Stack>
  );
};

export default Signin;


