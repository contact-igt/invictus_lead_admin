import React from 'react';
import { Box, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusChip from './StatusChip';

export interface AICardProps {
  prompt: string;
  response: string;
  confidenceScore: number; // 0 - 100
  latencyMs: number;
  tokensUsed: number;
  hasHallucinationWarning?: boolean;
}

export const AICard: React.FC<AICardProps> = ({
  prompt,
  response,
  confidenceScore,
  latencyMs,
  tokensUsed,
  hasHallucinationWarning = false,
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
      {/* Header Row: AI Badge & Confidence */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconifyIcon icon="solar:stars-minimalistic-linear" width={16} height={16} sx={{ color: '#2563EB' }} />
          </Box>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', fontFamily: '"Geist", sans-serif' }}>
            AI Assistant Summary
          </Typography>
        </Box>
        <StatusChip status={confidenceScore > 85 ? 'Healthy' : 'Needs Review'} size="sm" />
      </Box>

      {/* Prompt Context */}
      <Box sx={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '10px', p: 1.5 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', fontFamily: '"Geist", sans-serif', mb: 0.5 }}>
          USER PROMPT
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#0F172A', fontFamily: '"Geist", sans-serif' }}>
          "{prompt}"
        </Typography>
      </Box>

      {/* AI Response Output */}
      <Box>
        <Typography sx={{ fontSize: '0.875rem', color: '#334155', fontFamily: '"Geist", sans-serif', lineHeight: 1.6 }}>
          {response}
        </Typography>
      </Box>

      {/* Hallucination Warning Banner (if applicable) */}
      {hasHallucinationWarning && (
        <Box
          sx={{
            backgroundColor: '#FFF7ED',
            border: '1px solid #FED7AA',
            borderRadius: '10px',
            px: 1.5,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <IconifyIcon icon="solar:danger-triangle-linear" width={16} height={16} sx={{ color: '#C2410C' }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#C2410C', fontWeight: 500, fontFamily: '"Geist", sans-serif' }}>
            Hallucination Warning: Low verification confidence. Verify patient history before proceeding.
          </Typography>
        </Box>
      )}

      {/* Footer Metadata: Token Usage & Latency */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1.5,
          borderTop: '1px solid #F1F5F9',
          fontSize: '0.75rem',
          color: '#64748B',
          fontFamily: '"Geist Mono", monospace',
        }}
      >
        <span>Confidence: {confidenceScore}%</span>
        <span>Latency: {latencyMs}ms</span>
        <span>Tokens: {tokensUsed}</span>
      </Box>
    </Box>
  );
};

export default AICard;
