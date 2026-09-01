import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { LEAD_STATUS_LABELS } from '../constants';
import { cardSx, sectionTitleSx } from './ui';

interface LeadPipelineProps {
  pipeline: Array<{ status: string; count: number }>;
  loading?: boolean;
  onStageClick?: (status: string) => void;
}

const STAGE_SHADES = ['#0F172A', '#1E4A3B', '#1F6B4D', '#218D68', '#29AF81'];

const LeadPipeline = ({ pipeline, loading, onStageClick }: LeadPipelineProps) => (
  <Box sx={cardSx}>
    <Typography sx={{ ...sectionTitleSx, mb: 2 }}>Lead Pipeline</Typography>

    {loading ? (
      <Skeleton variant="rounded" height={64} sx={{ borderRadius: '10px' }} />
    ) : (
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 0 }} alignItems="stretch">
        {pipeline.map((stage, index) => (
          <Box
            key={stage.status}
            role={onStageClick ? 'button' : undefined}
            tabIndex={onStageClick ? 0 : undefined}
            onClick={() => onStageClick?.(stage.status)}
            onKeyDown={(e) => {
              if (onStageClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onStageClick(stage.status);
              }
            }}
            sx={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 64,
              px: { xs: 2, md: index === 0 ? 2 : 3.5 },
              ml: { md: index === 0 ? 0 : '-14px' },
              bgcolor: STAGE_SHADES[index],
              color: '#FFFFFF',
              cursor: onStageClick ? 'pointer' : 'default',
              opacity: 1,
              transition: 'opacity 120ms ease',
              '&:hover': onStageClick ? { opacity: 0.88 } : undefined,
              '&:focus-visible': onStageClick ? { outline: '2px solid #FFFFFF', outlineOffset: -3 } : undefined,
              clipPath: {
                xs: 'none',
                md:
                  index === pipeline.length - 1
                    ? 'polygon(0 0, calc(100% - 0px) 0, 100% 100%, 0 100%, 14px 50%)'
                    : 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)',
              },
              borderRadius: { xs: '10px', md: 0 },
              textAlign: 'center',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>{stage.count}</Typography>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.85, whiteSpace: 'nowrap' }}>
                {LEAD_STATUS_LABELS[stage.status] || stage.status}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    )}
  </Box>
);

export default LeadPipeline;
