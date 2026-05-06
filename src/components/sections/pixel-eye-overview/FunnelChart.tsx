import { Card, CardContent, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import { FunnelStageItem } from './types';

interface FunnelChartProps {
  stages: FunnelStageItem[];
  loading?: boolean;
}

const stageColors = ['#0288D1', '#0D9488', '#ED6C02', '#7C3AED', '#2E7D32'];

const FunnelChart = ({ stages, loading = false }: FunnelChartProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFCFF 100%)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          Conversion Funnel
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Stage-wise progression from lead creation to visit closure.
        </Typography>

        {loading ? (
          <Stack direction="column" spacing={2}>
            {[1, 2, 3, 4, 5].map((key) => (
              <Skeleton key={key} variant="rounded" height={44} />
            ))}
          </Stack>
        ) : (
          <Stack direction="column" spacing={2}>
            {stages.map((stage, index) => (
              <Stack key={stage.stage} direction="column" spacing={0.6}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" fontWeight={700}>
                    {stage.stage}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {stage.count.toLocaleString()} ({stage.percent}%)
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={stage.percent}
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    bgcolor: '#EEF2F7',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                      bgcolor: stageColors[index],
                    },
                  }}
                />
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default FunnelChart;
