import { useMemo } from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import useColorMode from 'hooks/useColorMode';
import { cardSx, sectionTitleSx, GREEN, TEXT_MUTED } from './ui';

echarts.use([LineChart, TooltipComponent, GridComponent, CanvasRenderer]);

interface LeadsOverTimeChartProps {
  points: Array<{ date: string; count: number }>;
  loading?: boolean;
}

const formatLabel = (iso: string) => {
  const parts = iso.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : iso;
};

const LeadsOverTimeChart = ({ points, loading }: LeadsOverTimeChartProps) => {
  const { mode } = useColorMode();
  const dark = mode === 'dark';
  const axisLabelColor = dark ? '#94A3B8' : '#64748B';
  const axisLineColor = dark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';
  const splitLineColor = dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9';

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: dark ? '#132019' : '#0F172A',
        borderColor: dark ? 'rgba(255,255,255,0.1)' : 'transparent',
        textStyle: { color: dark ? '#EAF7EE' : '#F8FAFC', fontSize: 12 },
        formatter: (params: Array<{ value: number; axisValue: string }>) =>
          `<strong>${formatLabel(params[0]?.axisValue ?? '')}</strong><br/>${params[0]?.value ?? 0} leads`,
      },
      grid: { left: '2%', right: '3%', bottom: '4%', top: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        data: points.map((p) => p.date),
        axisLine: { lineStyle: { color: axisLineColor } },
        axisTick: { show: false },
        axisLabel: { color: axisLabelColor, fontSize: 11, formatter: formatLabel },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
        axisLabel: { color: axisLabelColor, fontSize: 11 },
      },
      series: [
        {
          type: 'line',
          data: points.map((p) => p.count),
          smooth: true,
          symbolSize: 6,
          lineStyle: { width: 2.5, color: GREEN },
          itemStyle: { color: GREEN, borderWidth: 2, borderColor: dark ? '#0D1410' : '#fff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${GREEN}33` },
              { offset: 1, color: `${GREEN}00` },
            ]),
          },
        },
      ],
    }),
    [points, dark, axisLabelColor, axisLineColor, splitLineColor],
  );

  return (
    <Box sx={{ ...cardSx, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography sx={sectionTitleSx}>Leads Over Time</Typography>
      </Stack>
      {loading ? (
        <Skeleton variant="rounded" height={220} sx={{ borderRadius: '10px' }} />
      ) : points.length === 0 ? (
        <Stack direction="column" flex={1} minHeight={220} alignItems="center" justifyContent="center">
          <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
            No leads in the selected range.
          </Typography>
        </Stack>
      ) : (
        <Box sx={{ flex: 1, minHeight: 220 }}>
          <ReactEchart echarts={echarts} option={option} sx={{ height: '100%', width: '100%' }} />
        </Box>
      )}
    </Box>
  );
};

export default LeadsOverTimeChart;
