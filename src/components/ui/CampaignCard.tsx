import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import StatusChip, { EnterpriseStatus } from './StatusChip';
import Button from './Button';

export interface CampaignCardProps {
  title: string;
  channel: 'WhatsApp' | 'SMS' | 'Email';
  audienceCount: number;
  deliveryRate: number; // percentage
  readRate: number; // percentage
  clickRate: number; // percentage
  status: EnterpriseStatus;
  onPause?: () => void;
  onResume?: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  title,
  channel,
  audienceCount,
  deliveryRate,
  readRate,
  clickRate,
  status,
  onPause,
  onResume,
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0F172A', fontFamily: '"Geist", sans-serif' }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontFamily: '"Geist", sans-serif' }}>
            {channel} · Audience: {audienceCount.toLocaleString()} leads
          </Typography>
        </Box>
        <StatusChip status={status} size="sm" />
      </Box>

      {/* Progress Telemetry Bars */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', fontFamily: '"Geist Mono", monospace' }}>
          <span>Delivery Rate</span>
          <span>{deliveryRate}%</span>
        </Box>
        <LinearProgress variant="determinate" value={deliveryRate} sx={{ height: 6, borderRadius: 99, backgroundColor: '#F1F5F9', '& .MuiLinearProgress-bar': { backgroundColor: '#16A34A' } }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', fontFamily: '"Geist Mono", monospace', mt: 0.5 }}>
          <span>Read Rate</span>
          <span>{readRate}%</span>
        </Box>
        <LinearProgress variant="determinate" value={readRate} sx={{ height: 6, borderRadius: 99, backgroundColor: '#F1F5F9', '& .MuiLinearProgress-bar': { backgroundColor: '#2563EB' } }} />
      </Box>

      {/* Footer Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #F1F5F9' }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontFamily: '"Geist Mono", monospace' }}>
          CTR: <strong>{clickRate}%</strong>
        </Typography>
        {status === 'Running' && onPause && (
          <Button variant="secondary" onClick={onPause} sx={{ height: 34, px: 2, fontSize: '0.75rem' }}>
            Pause
          </Button>
        )}
        {status === 'Pending' && onResume && (
          <Button variant="primary" onClick={onResume} sx={{ height: 34, px: 2, fontSize: '0.75rem' }}>
            Resume
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CampaignCard;
