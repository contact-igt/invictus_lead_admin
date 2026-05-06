import { Box, Card, CardContent, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useMemo } from 'react';
import { StatusCategoryItem } from './types';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

interface StatusBreakdownProps {
  categories: StatusCategoryItem[];
  loading?: boolean;
}

const StatusBreakdown = ({ categories, loading = false }: StatusBreakdownProps) => {
  const visibleCategories = categories.filter((category) => category.count > 0);
  const chartData = visibleCategories.length > 0 ? visibleCategories : categories;
  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        show: false,
      },
      series: [
        {
          type: 'pie',
          radius: ['48%', '76%'],
          center: ['43%', '52%'],
          avoidLabelOverlap: true,
          label: {
            show: false,
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
          },
          data: chartData.map((category) => ({
            value: category.count,
            name: category.label,
            itemStyle: { color: category.color },
          })),
        },
      ],
    }),
    [chartData],
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFCFF 100%)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2.5, height: '100%' }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Status Distribution
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Total {total.toLocaleString()}
          </Typography>
        </Stack>

        {loading ? (
          <Skeleton variant="rounded" height={280} />
        ) : (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <ReactEchart echarts={echarts} option={option} sx={{ height: 280 }} />
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack direction="column" spacing={1.2}>
                {chartData.map((category) => (
                  <Stack
                    key={category.label}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      px: 1.2,
                      py: 0.8,
                    }}
                  >
                    <Chip
                      size="small"
                      label={category.label}
                      sx={{
                        bgcolor: `${category.color}16`,
                        color: category.color,
                        fontWeight: 700,
                      }}
                    />

                    <Stack direction="row" alignItems="center" spacing={1.2}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: category.color }} />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {category.count.toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusBreakdown;
