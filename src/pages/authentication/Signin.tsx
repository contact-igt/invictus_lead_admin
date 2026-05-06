import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import LogoImg from '/assets/brand-logo.png';
import { useLoginMutation } from './hooks/useLogin';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Signin = () => {
  const { mutate, isLoading } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      mutate(values as any);
    },
  });

  return (
    <>
      <Stack
        top={0}
        pt={1}
        pb={2.5}
        justifyContent="center"
        alignItems="center"
        bgcolor="info.lighter"
        zIndex={1000}
      >
        <Image src={LogoImg} alt="logo" height={50} width={200} sx={{ mr: 1.25 }} />
      </Stack>
      <Typography align="center" variant="h4" fontWeight={700}>
        Sign In
      </Typography>
      <Typography mt={1.5} mb={4} align="center" variant="body2" color="text.secondary">
        Welcome back! Please enter your credentials to continue.
      </Typography>

      <Stack component="form" mt={3} onSubmit={formik.handleSubmit} direction="column" gap={2.5}>
        <TextField
          id="email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          variant="outlined"
          placeholder="admin@example.com"
          autoComplete="email"
          label="Email Address"
          fullWidth
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="hugeicons:mail-at-sign-02" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          variant="outlined"
          placeholder="••••••••"
          autoComplete="current-password"
          fullWidth
          label="Password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="hugeicons:lock-key" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  <IconifyIcon
                    icon={showPassword ? 'fluent-mdl2:view' : 'fluent-mdl2:hide-3'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <FormControlLabel
            control={<Checkbox id="checkbox" name="checkbox" size="small" color="primary" />}
            label="Remember me"
          />
          <Link href="#!" variant="body2" sx={{ fontWeight: 600 }}>
            Forgot password?
          </Link>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isLoading}
          sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700 }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
        </Button>
      </Stack>
    </>
  );
};

export default Signin;
