import { Box, Card, CardContent, Paper, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';
import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { TrendPoint } from './types';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';

echarts.use([BarChart, LineChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

interface TrendChartProps {
  points: TrendPoint[];
  loading?: boolean;
  highlightSeries?: 'contacted' | 'converted' | null;
  dark?: boolean;
}

const CONTACTED_COLOR = '#2563EB';
const CONVERTED_COLOR = '#16A34A';
const AMBER = '#D97706';

const formatDateLabel = (iso: string): string => {
  const parts = iso.split('-');
  if (parts.length === 3 && parts[0].length === 4) return `${parts[2]}/${parts[1]}`;
  return iso;
};

const TrendChart = ({ points, loading = false, highlightSeries }: TrendChartProps) => {
  const { mode } = useColorMode();
  const theme = useTheme();

  const totalContacted = points.reduce((sum, p) => sum + p.contacted, 0);
  const totalConverted = points.reduce((sum, p) => sum + p.converted, 0);
  const conversionRate = totalContacted > 0 ? Math.round((totalConverted / totalContacted) * 100) : 0;
  const isEmpty = points.length === 0;

  const contactedOpacity = highlightSeries && highlightSeries !== 'contacted' ? 0.35 : 1;
  const convertedOpacity = highlightSeries && highlightSeries !== 'converted' ? 0.35 : 1;

  const rangeLabel =
    points.length >= 2
      ? `${formatDateLabel(points[0].day)} – ${formatDateLabel(points[points.length - 1].day)}`
      : points.length === 1
        ? formatDateLabel(points[0].day)
        : null;

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1E293B',
        borderColor: 'transparent',
        textStyle: { color: '#F8FAFC', fontSize: 12 },
        formatter: (params: Array<{ seriesName: string; value: number; marker: string; axisValue: string }>) => {
          const label = formatDateLabel(params[0]?.axisValue ?? '');
          const rows = params
            .map(
              (p) =>
                `<div style="display:flex;justify-content:space-between;gap:16px;margin-top:3px">${p.marker}<span style="color:#94A3B8">${p.seriesName}</span><strong>${p.value}</strong></div>`,
            )
            .join('');
          return `<div style="padding:4px 2px"><div style="font-weight:700;margin-bottom:4px;color:#E2E8F0">${label}</div>${rows}</div>`;
        },
      },
      legend: { show: false },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '4%', containLabel: true },
      xAxis: {
        type: 'category',
        data: points.map((p) => p.day),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: theme.palette.text.secondary,
          fontSize: 11,
          formatter: (v: string) => formatDateLabel(v),
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: '#E2E8F0', type: 'dashed' } },
        axisLabel: { color: theme.palette.text.secondary, fontSize: 11 },
      },
      series: [
        {
          name: 'Contacted',
          type: 'bar',
          data: points.map((p) => p.contacted),
          barMaxWidth: 32,
          barGap: '30%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: CONTACTED_COLOR },
              { offset: 1, color: `${CONTACTED_COLOR}66` },
            ]),
            borderRadius: [4, 4, 0, 0],
            opacity: contactedOpacity,
          },
        },
        {
          name: 'Converted',
          type: 'line',
          smooth: true,
          data: points.map((p) => p.converted),
          symbolSize: 7,
          symbol: 'circle',
          lineStyle: { width: 2.5, color: CONVERTED_COLOR, opacity: convertedOpacity },
          itemStyle: { color: CONVERTED_COLOR, borderWidth: 2, borderColor: '#fff', opacity: convertedOpacity },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${CONVERTED_COLOR}26` },
              { offset: 1, color: `${CONVERTED_COLOR}00` },
            ]),
            opacity: convertedOpacity,
          },
        },
      ],
    }),
    [points, theme, highlightSeries],
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box>
            <Typography
              sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', mb: 0.3 }}
            >
              Progression Trend
            </Typography>
            <Typography variant="h6" fontWeight={700} color={mode === 'dark' ? '#FFFFFF' : '#0F172A'}>
              Contacted vs Converted
            </Typography>
            {rangeLabel && (
              <Typography variant="caption" color="#64748B">{rangeLabel}</Typography>
            )}
          </Box>
        </Stack>

        {/* Summary mini-cards */}
        {!loading && (
          <Stack direction="row" spacing={1.5} mb={2.5} flexWrap="wrap" useFlexGap>
            <Paper
              elevation={0}
              sx={{
                px: 1.5, py: 1, borderRadius: '10px',
                border: '1px solid #BFDBFE', bgcolor: '#EFF6FF',
                display: 'flex', alignItems: 'center', gap: 1,
              }}
            >
              <IconifyIcon icon="mdi:phone-outline" sx={{ fontSize: 16, color: CONTACTED_COLOR }} />
              <Typography variant="caption" fontWeight={800} color={CONTACTED_COLOR}>{totalContacted}</Typography>
              <Typography variant="caption" fontWeight={500} color="#64748B">Contacted</Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                px: 1.5, py: 1, borderRadius: '10px',
                border: '1px solid #BBF7D0', bgcolor: '#F0FDF4',
                display: 'flex', alignItems: 'center', gap: 1,
              }}
            >
              <IconifyIcon icon="mdi:check-circle-outline" sx={{ fontSize: 16, color: CONVERTED_COLOR }} />
              <Typography variant="caption" fontWeight={800} color={CONVERTED_COLOR}>{totalConverted}</Typography>
              <Typography variant="caption" fontWeight={500} color="#64748B">Converted</Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                px: 1.5, py: 1, borderRadius: '10px',
                border: '1px solid #FDE68A', bgcolor: '#FFFBEB',
                display: 'flex', alignItems: 'center', gap: 1,
              }}
            >
              <IconifyIcon icon="mdi:trending-up" sx={{ fontSize: 16, color: AMBER }} />
              <Typography variant="caption" fontWeight={800} color={AMBER}>{conversionRate}%</Typography>
              <Typography variant="caption" fontWeight={500} color="#64748B">Conv. Rate</Typography>
            </Paper>
          </Stack>
        )}

        {loading ? (
          <Skeleton variant="rounded" sx={{ flex: 1, minHeight: 200, borderRadius: '12px' }} />
        ) : isEmpty ? (
          <Stack flex={1} alignItems="center" justifyContent="center" minHeight={200} spacing={1}>
            <IconifyIcon icon="mdi:chart-bar" sx={{ fontSize: 40, color: '#CBD5E1' }} />
            <Typography variant="body2" color="#94A3B8" fontWeight={500}>
              No progression data for the selected period.
            </Typography>
          </Stack>
        ) : (
          <ReactEchart echarts={echarts} option={option} sx={{ height: 260, mt: 0.5 }} />
        )}
      </CardContent>
    </Card>
  );
};

export default TrendChart;
