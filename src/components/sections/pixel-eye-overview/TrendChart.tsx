import { Box, Paper, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';
import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { TrendPoint } from './types';
import IconifyIcon from 'components/base/IconifyIcon';
import useColorMode from 'hooks/useColorMode';
import { PixelEyeCard } from 'components/sections/pixel-eye/pixelEyeUi';

echarts.use([
  BarChart,
  LineChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

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
  const conversionRate =
    totalContacted > 0 ? Math.round((totalConverted / totalContacted) * 100) : 0;
  const isEmpty = points.length === 0;

  const contactedOpacity = highlightSeries && highlightSeries !== 'contacted' ? 0.35 : 1;
  const convertedOpacity = highlightSeries && highlightSeries !== 'converted' ? 0.35 : 1;

  const rangeLabel =
    points.length >= 2
      ? `${formatDateLabel(points[0].day)} - ${formatDateLabel(points[points.length - 1].day)}`
      : points.length === 1
        ? formatDateLabel(points[0].day)
        : null;

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: mode === 'dark' ? '#111F19' : '#1E293B',
        borderColor: mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
        textStyle: { color: '#F8FAFC', fontSize: 12 },
        formatter: (
          params: Array<{ seriesName: string; value: number; marker: string; axisValue: string }>,
        ) => {
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
          color: mode === 'dark' ? '#94A3B8' : theme.palette.text.secondary,
          fontSize: 11,
          formatter: (v: string) => formatDateLabel(v),
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: {
          lineStyle: {
            color: mode === 'dark' ? 'rgba(76, 119, 96, 0.12)' : '#E2E8F0',
            type: 'dashed',
          },
        },
        axisLabel: {
          color: mode === 'dark' ? '#94A3B8' : theme.palette.text.secondary,
          fontSize: 11,
        },
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
          itemStyle: {
            color: CONVERTED_COLOR,
            borderWidth: 2,
            borderColor: '#fff',
            opacity: convertedOpacity,
          },
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
    [contactedOpacity, convertedOpacity, points, theme, mode],
  );

  return (
    <PixelEyeCard sx={{ p: 4, h: '100%' }}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        mb={3}
        sx={{
          borderBottom: mode === 'dark' ? '1px solid rgba(76, 119, 96, 0.15)' : '1px solid #F1F5F9',
          pb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: mode === 'dark' ? '#86EFAC' : '#156A45',
              mb: 0.5,
            }}
          >
            Progression Trend
          </Typography>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ color: mode === 'dark' ? '#FFFFFF' : '#0F172A', letterSpacing: '-0.02em' }}
          >
            Contacted vs Converted
          </Typography>
          {rangeLabel && (
            <Typography
              variant="caption"
              sx={{ color: mode === 'dark' ? '#94A3B8' : '#64748B', mt: 0.5, display: 'block' }}
            >
              {rangeLabel}
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Summary mini-cards */}
      {!loading && (
        <Stack direction="row" spacing={2} mb={3.5} flexWrap="wrap">
          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1.25,
              borderRadius: '12px',
              border: mode === 'dark' ? '1px solid rgba(37, 99, 235, 0.24)' : '1px solid #BFDBFE',
              bgcolor: mode === 'dark' ? 'rgba(37, 99, 235, 0.08)' : '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <IconifyIcon icon="mdi:phone-outline" sx={{ fontSize: 18, color: CONTACTED_COLOR }} />
            <Box>
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{ color: CONTACTED_COLOR, display: 'block', lineHeight: 1 }}
              >
                {totalContacted}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ color: mode === 'dark' ? '#94A3B8' : '#64748B', fontSize: '10px' }}
              >
                Contacted
              </Typography>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1.25,
              borderRadius: '12px',
              border: mode === 'dark' ? '1px solid rgba(22, 163, 74, 0.24)' : '1px solid #BBF7D0',
              bgcolor: mode === 'dark' ? 'rgba(22, 163, 74, 0.08)' : '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <IconifyIcon
              icon="mdi:check-circle-outline"
              sx={{ fontSize: 18, color: CONVERTED_COLOR }}
            />
            <Box>
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{ color: CONVERTED_COLOR, display: 'block', lineHeight: 1 }}
              >
                {totalConverted}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ color: mode === 'dark' ? '#94A3B8' : '#64748B', fontSize: '10px' }}
              >
                Converted
              </Typography>
            </Box>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1.25,
              borderRadius: '12px',
              border: mode === 'dark' ? '1px solid rgba(217, 119, 6, 0.24)' : '1px solid #FDE68A',
              bgcolor: mode === 'dark' ? 'rgba(217, 119, 6, 0.08)' : '#FFFBEB',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <IconifyIcon icon="mdi:trending-up" sx={{ fontSize: 18, color: AMBER }} />
            <Box>
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{ color: AMBER, display: 'block', lineHeight: 1 }}
              >
                {conversionRate}%
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ color: mode === 'dark' ? '#94A3B8' : '#64748B', fontSize: '10px' }}
              >
                Conv. Rate
              </Typography>
            </Box>
          </Paper>
        </Stack>
      )}

      {loading ? (
        <Skeleton
          variant="rounded"
          sx={{
            flex: 1,
            minHeight: 200,
            borderRadius: '16px',
            bgcolor: mode === 'dark' ? '#0B1410' : '#F3F4F6',
          }}
        />
      ) : isEmpty ? (
        <Stack
          flex={1}
          alignItems="center"
          justifyContent="center"
          minHeight={260}
          spacing={2}
          sx={{ bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'transparent', borderRadius: 3 }}
        >
          <IconifyIcon
            icon="mdi:chart-bar"
            sx={{ fontSize: 48, color: mode === 'dark' ? '#1F3A2D' : '#CBD5E1' }}
          />
          <Typography
            variant="body2"
            sx={{ color: mode === 'dark' ? '#4B6356' : '#94A3B8', fontWeight: 600 }}
          >
            No progression data for the selected period.
          </Typography>
        </Stack>
      ) : (
        <Box sx={{ flex: 1, minHeight: 260 }}>
          <ReactEchart echarts={echarts} option={option} sx={{ height: '100%', width: '100%' }} />
        </Box>
      )}
    </PixelEyeCard>
  );
};

export default TrendChart;
