import { Card, CardContent, Skeleton, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';
import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { TrendPoint } from './types';

echarts.use([BarChart, LineChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

interface TrendChartProps {
  points: TrendPoint[];
  loading?: boolean;
}

const TrendChart = ({ points, loading = false }: TrendChartProps) => {
  const theme = useTheme();

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        top: 0,
        textStyle: {
          color: theme.palette.text.secondary,
        },
      },
      grid: {
        left: 16,
        right: 14,
        bottom: 12,
        top: 42,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: points.map((point) => point.day),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: theme.palette.text.secondary,
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            color: '#E7EDF3',
          },
        },
        axisLabel: {
          color: theme.palette.text.secondary,
          fontSize: 12,
        },
      },
      series: [
        {
          name: 'Contacted',
          type: 'bar',
          data: points.map((point) => point.contacted),
          barWidth: 24,
          itemStyle: {
            color: '#ED6C02',
            borderRadius: [8, 8, 0, 0],
          },
        },
        {
          name: 'Converted',
          type: 'line',
          smooth: true,
          data: points.map((point) => point.converted),
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: '#2E7D32',
          },
          itemStyle: {
            color: '#2E7D32',
          },
        },
      ],
    }),
    [points, theme],
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFCFF 100%)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          5-Day Progression Trend
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Daily contacted vs converted momentum for follow-up quality tracking.
        </Typography>
        {loading ? (
          <Skeleton variant="rounded" height={300} />
        ) : (
          <ReactEchart echarts={echarts} option={option} sx={{ height: 320 }} />
        )}
      </CardContent>
    </Card>
  );
};

export default TrendChart;
