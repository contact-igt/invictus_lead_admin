import { useMemo } from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { LEAD_SOURCE_LABELS } from '../constants';
import { cardSx, sectionTitleSx, TEXT_DARK, TEXT_MUTED } from './ui';

echarts.use([PieChart, TooltipComponent, CanvasRenderer]);

const PALETTE = ['#29AF81', '#2563EB', '#F59E0B', '#7C3AED', '#EC4899', '#06B6D4', '#94A3B8'];

interface LeadSourcesDonutProps {
  sources: Array<{ source: string; count: number; percentage: number }>;
  totalLeads: number;
  loading?: boolean;
  onSourceClick?: (source: string) => void;
}

const LeadSourcesDonut = ({ sources, totalLeads, loading, onSourceClick }: LeadSourcesDonutProps) => {
  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => `${LEAD_SOURCE_LABELS[p.name] || p.name}: ${p.value} (${p.percent}%)`,
      },
      series: [
        {
          type: 'pie',
          radius: ['62%', '85%'],
          avoidLabelOverlap: false,
          label: { show: false },
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
          data: sources.map((s, i) => ({
            name: s.source,
            value: s.count,
            itemStyle: { color: PALETTE[i % PALETTE.length] },
          })),
        },
      ],
    }),
    [sources],
  );

  return (
    <Box sx={{ ...cardSx, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ ...sectionTitleSx, mb: 2 }}>Lead Sources</Typography>
      {loading ? (
        <Skeleton variant="rounded" height={220} sx={{ borderRadius: '10px' }} />
      ) : sources.length === 0 ? (
        <Stack direction="column" flex={1} minHeight={220} alignItems="center" justifyContent="center">
          <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
            No source data yet.
          </Typography>
        </Stack>
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flex={1}>
          <Box sx={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
            <ReactEchart echarts={echarts} option={option} sx={{ height: '100%', width: '100%' }} />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: TEXT_DARK, lineHeight: 1 }}>
                {totalLeads}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: TEXT_MUTED, mt: 0.5 }}>Total Leads</Typography>
            </Box>
          </Box>

          <Stack direction="column" spacing={0.75} sx={{ width: '100%', flex: 1 }}>
            {sources.map((s, i) => (
              <Stack
                key={s.source}
                direction="row"
                alignItems="center"
                spacing={1}
                onClick={() => onSourceClick?.(s.source)}
                role={onSourceClick ? 'button' : undefined}
                tabIndex={onSourceClick ? 0 : undefined}
                aria-label={onSourceClick ? `View leads from ${s.source}` : undefined}
                onKeyDown={(e) => {
                  if (onSourceClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSourceClick(s.source);
                  }
                }}
                sx={{
                  cursor: onSourceClick ? 'pointer' : 'default',
                  borderRadius: '6px',
                  px: 0.5,
                  mx: -0.5,
                  '&:hover': onSourceClick ? { bgcolor: 'rgba(15,23,42,0.04)' } : undefined,
                  '&:focus-visible': onSourceClick ? { outline: '2px solid #29AF81', outlineOffset: 1 } : undefined,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: PALETTE[i % PALETTE.length],
                    flexShrink: 0,
                  }}
                />
                <Typography noWrap sx={{ fontSize: '0.8rem', color: TEXT_DARK, flexGrow: 1 }}>
                  {LEAD_SOURCE_LABELS[s.source] || s.source}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: TEXT_DARK }}>
                  {s.count}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: TEXT_MUTED, width: 36, textAlign: 'right' }}>
                  {s.percentage}%
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default LeadSourcesDonut;
