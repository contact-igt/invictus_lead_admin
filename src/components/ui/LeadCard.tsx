import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusChip, { EnterpriseStatus } from './StatusChip';
import Button from './Button';

export interface LeadCardProps {
  name: string;
  phone: string;
  source: string;
  agentName: string;
  leadScore: number;
  status: EnterpriseStatus;
  aiSummary?: string;
  onCall?: () => void;
  onWhatsApp?: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  name,
  phone,
  source,
  agentName,
  leadScore,
  status,
  aiSummary,
  onCall,
  onWhatsApp,
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
      {/* Header Row: Lead Avatar + Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, backgroundColor: '#2563EB', fontSize: '0.875rem', fontWeight: 700 }}>
            {name.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0F172A', fontFamily: '"Geist", sans-serif' }}>
              {name}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontFamily: '"Geist Mono", monospace' }}>
              {phone}
            </Typography>
          </Box>
        </Box>
        <StatusChip status={status} size="sm" />
      </Box>

      {/* Details Row: Lead Score & Source */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, backgroundColor: '#F8FAFC', p: 1.5, borderRadius: '12px' }}>
        <Box>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            LEAD SCORE
          </Typography>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#16A34A', fontFamily: '"Geist Mono", monospace' }}>
            {leadScore}/100
          </Typography>
        </Box>
        <Box sx={{ width: '1px', height: 24, backgroundColor: '#CBD5E1' }} />
        <Box>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            SOURCE
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', fontFamily: '"Geist", sans-serif' }}>
            {source}
          </Typography>
        </Box>
        <Box sx={{ width: '1px', height: 24, backgroundColor: '#CBD5E1' }} />
        <Box>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            OWNER
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', fontFamily: '"Geist", sans-serif' }}>
            {agentName}
          </Typography>
        </Box>
      </Box>

      {/* AI Intelligence Summary */}
      {aiSummary && (
        <Box sx={{ fontSize: '0.8125rem', color: '#475569', fontFamily: '"Geist", sans-serif', lineHeight: 1.5 }}>
          <strong>AI Insights:</strong> {aiSummary}
        </Box>
      )}

      {/* Quick Action Triggers */}
      <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: '1px solid #F1F5F9' }}>
        {onCall && (
          <Button variant="primary" onClick={onCall} sx={{ flex: 1, height: 40, fontSize: '0.8125rem' }}>
            <IconifyIcon icon="solar:phone-calling-linear" width={16} height={16} sx={{ mr: 1 }} />
            Quick Call
          </Button>
        )}
        {onWhatsApp && (
          <Button variant="secondary" onClick={onWhatsApp} sx={{ flex: 1, height: 40, fontSize: '0.8125rem' }}>
            <IconifyIcon icon="solar:chat-round-line-linear" width={16} height={16} sx={{ mr: 1 }} />
            WhatsApp
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default LeadCard;
