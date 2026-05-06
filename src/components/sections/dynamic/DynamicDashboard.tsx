import { Fragment, useMemo } from 'react';
import { Box, Divider, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { useQueries } from 'react-query';
import IconifyIcon from 'components/base/IconifyIcon';
import { ClientConfig, DashboardMetricConfig } from 'config/clients';
import { _axios } from 'helper/axios';

interface DynamicDashboardProps {
  config: ClientConfig;
}

const MetricCard = ({ metric, data, isLoading }: { metric: DashboardMetricConfig; data: any[]; isLoading: boolean }) => {
  const value = useMemo(() => {
    if (isLoading || !data) return 0;
    switch (metric.type) {
      case 'count':
        return data.length;

      case 'filter_count':
        return data.filter(item => item[metric.filterField!] === metric.filterValue).length;

      case 'today_count': {
        const today = new Date().toISOString().split('T')[0];
        return data.filter(item => {
          const val = item[metric.filterField!];
          return val && String(val).startsWith(today);
        }).length;
      }

      case 'this_month_count': {
        const now = new Date();
        const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return data.filter(item => {
          const val = item[metric.filterField!];
          return val && String(val).startsWith(prefix);
        }).length;
      }

      case 'date_gte_today': {
        const today = new Date().toISOString().split('T')[0];
        return data.filter(item => {
          const val = item[metric.filterField!];
          return val && String(val).split('T')[0] >= today;
        }).length;
      }

      default:
        return 0;
    }
  }, [metric, data, isLoading]);

  const colorString = metric.color || 'primary';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.04)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${colorString}.main`,
          color: `${colorString}.contrastText`,
          opacity: 0.9,
          boxShadow: '0 4px 14px 0 rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}
      >
        <IconifyIcon icon={metric.icon || 'mingcute:chart-bar-line'} width={32} height={32} />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
          {metric.label}
        </Typography>
        <Typography variant="h3" fontWeight={700} color="text.primary" mt={0.5}>
          {isLoading ? <CircularProgress size={24} sx={{ mt: 1 }} /> : value}
        </Typography>
      </Box>
    </Paper>
  );
};

const DynamicDashboard = ({ config }: DynamicDashboardProps) => {
  const queryResults = useQueries(
    config.tables.map(table => ({
      queryKey: ['dashboard_data', table.id],
      queryFn: () => _axios('get', table.endpoint),
      staleTime: 5 * 60 * 1000,
    }))
  );

  const showSectionHeaders = config.tables.length > 1;

  return (
    <Box sx={{ width: '100%', p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="text.primary">
        {config.appName} Overview
      </Typography>

      <Grid container spacing={3}>
        {config.tables.map((table, index) => {
          const { data, isLoading } = queryResults[index];
          const rowData: any[] = data?.data || [];

          const metrics: DashboardMetricConfig[] = table.metrics && table.metrics.length > 0
            ? table.metrics
            : buildAutoMetrics(table);

          return (
            <Fragment key={table.id}>
              {showSectionHeaders && (
                <Grid item xs={12}>
                  {index > 0 && <Box mb={1} />}
                  <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={1.2}>
                    {table.title}
                  </Typography>
                  <Divider sx={{ mt: 0.5 }} />
                </Grid>
              )}
              {metrics.map(metric => (
                <Grid item xs={12} sm={6} md={4} xl={3} key={metric.key}>
                  <MetricCard metric={metric} data={rowData} isLoading={isLoading} />
                </Grid>
              ))}
            </Fragment>
          );
        })}
      </Grid>
    </Box>
  );
};

function buildAutoMetrics(table: any): DashboardMetricConfig[] {
  const auto: DashboardMetricConfig[] = [
    {
      key: `total_${table.id}`,
      label: `Total ${table.title}`,
      type: 'count',
      color: 'primary',
      icon: 'mingcute:folder-open-line',
    },
  ];

  table.columns.forEach((col: any) => {
    if (col.type === 'status_chip' && col.options) {
      const colors: Array<DashboardMetricConfig['color']> = ['success', 'warning', 'error', 'info', 'secondary'];
      col.options.forEach((opt: string, i: number) => {
        auto.push({
          key: `${table.id}_${col.field}_${opt}`,
          label: `${opt} ${col.header}`,
          type: 'filter_count',
          filterField: col.field,
          filterValue: opt,
          color: colors[i % colors.length],
          icon: 'mingcute:flash-line',
        });
      });
    }
  });

  return auto;
}

export default DynamicDashboard;
