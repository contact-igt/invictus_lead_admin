import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useAuth } from 'redux/selectors/auth/authSelector';

const firstLetter = (name?: string | null): string =>
  (name || '?').trim().charAt(0).toUpperCase();

const roleColor = (role?: string) => {
  if (role === 'super-admin') return 'error';
  if (role === 'admin') return 'warning';
  return 'primary';
};

const Settings = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordMismatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <Stack direction="column" spacing={3} sx={{ p: { xs: 2, md: 3 }, maxWidth: 820, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <IconifyIcon icon="hugeicons:account-setting-02" sx={{ fontSize: 26, color: 'primary.main' }} />
        <Typography variant="h5" fontWeight={800}>
          Account Settings
        </Typography>
      </Stack>

      {/* Profile card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 24px rgba(15,23,42,0.07)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Profile Information
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={3} mb={3}>
            <Avatar
              sx={{
                height: 72,
                width: 72,
                bgcolor: 'primary.main',
                fontWeight: 800,
                fontSize: 30,
                flexShrink: 0,
              }}
            >
              {firstLetter(user?.username)}
            </Avatar>

            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>
                {user?.username || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || '—'}
              </Typography>
              <Chip
                size="small"
                label={user?.role || 'unknown'}
                color={roleColor(user?.role)}
                sx={{ alignSelf: 'flex-start', fontWeight: 700, mt: 0.5, textTransform: 'capitalize' }}
              />
            </Stack>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                value={user?.username || ''}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                value={user?.email || ''}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Role"
                value={user?.role || ''}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC', textTransform: 'capitalize' } }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Change password card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 24px rgba(15,23,42,0.07)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Change Password
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Current Password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <Box
                      component="span"
                      onClick={() => setShowCurrent(!showCurrent)}
                      sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'text.secondary' }}
                    >
                      <IconifyIcon icon={showCurrent ? 'fluent-mdl2:view' : 'fluent-mdl2:hide-3'} />
                    </Box>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="New Password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <Box
                      component="span"
                      onClick={() => setShowNew(!showNew)}
                      sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'text.secondary' }}
                    >
                      <IconifyIcon icon={showNew ? 'fluent-mdl2:view' : 'fluent-mdl2:hide-3'} />
                    </Box>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                size="small"
                error={passwordMismatch}
                helperText={passwordMismatch ? 'Passwords do not match' : ''}
                InputProps={{
                  endAdornment: (
                    <Box
                      component="span"
                      onClick={() => setShowConfirm(!showConfirm)}
                      sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'text.secondary' }}
                    >
                      <IconifyIcon icon={showConfirm ? 'fluent-mdl2:view' : 'fluent-mdl2:hide-3'} />
                    </Box>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" mt={2.5}>
            <Button
              variant="contained"
              disabled={!currentPassword || !newPassword || !confirmPassword || passwordMismatch}
              startIcon={<IconifyIcon icon="hugeicons:checkmark-circle-01" />}
              sx={{ borderRadius: 2 }}
            >
              Update Password
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default Settings;
