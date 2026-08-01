import React from 'react';
import { Box, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusChip, { EnterpriseStatus } from './StatusChip';
import Button from './Button';

export interface AppointmentCardProps {
  patientName: string;
  doctorName: string;
  department: string;
  timeSlot: string;
  date: string;
  status: EnterpriseStatus;
  onReschedule?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  patientName,
  doctorName,
  department,
  timeSlot,
  date,
  status,
  onReschedule,
  onCancel,
  onComplete,
}) => {
  return (
    <Box
      sx={{
        borderRadius: '18px', // 18px Card Spec
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Header Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconifyIcon icon="solar:calendar-mark-linear" width={20} height={20} sx={{ color: '#2563EB' }} />
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', fontFamily: '"Geist", sans-serif' }}>
            {date} · {timeSlot}
          </Typography>
        </Box>
        <StatusChip status={status} size="sm" />
      </Box>

      {/* Patient & Doctor Details */}
      <Box sx={{ backgroundColor: '#F8FAFC', p: 1.5, borderRadius: '12px' }}>
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', fontFamily: '"Geist", sans-serif' }}>
          {patientName}
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#64748B', fontFamily: '"Geist", sans-serif', mt: 0.25 }}>
          Doctor: <strong>{doctorName}</strong> ({department})
        </Typography>
      </Box>

      {/* Actions Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.5 }}>
        {onComplete && (
          <Button variant="primary" onClick={onComplete} sx={{ height: 38, fontSize: '0.8125rem', px: 2 }}>
            Complete
          </Button>
        )}
        {onReschedule && (
          <Button variant="secondary" onClick={onReschedule} sx={{ height: 38, fontSize: '0.8125rem', px: 2 }}>
            Reschedule
          </Button>
        )}
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} sx={{ height: 38, fontSize: '0.8125rem', px: 1.5, color: '#EF4444' }}>
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AppointmentCard;
