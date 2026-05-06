import { Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { KPIItem } from './types';

interface KPICardsProps {
  items: KPIItem[];
  loading?: boolean;
}

const KPICards = ({ items, loading = false }: KPICardsProps) => {
  return (
    <Grid container spacing={2.5}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} lg={3} key={item.key}>
          <Card
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 10px 26px rgba(15, 23, 42, 0.06)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 18px 34px rgba(15, 23, 42, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5, minHeight: 162 }}>
              <Stack
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: `${item.color}.main`,
                  opacity: 0.9,
                }}
              />

              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                <Stack direction="column" spacing={0.5}>
                  <Typography variant="body2" color="text.secondary" fontWeight={700}>
                    {item.label}
                  </Typography>
                  {loading ? (
                    <Skeleton variant="rounded" width={104} height={38} />
                  ) : (
                    <Typography variant="h3" fontWeight={800} lineHeight={1.2}>
                      {item.value.toLocaleString()}
                    </Typography>
                  )}
                  {item.subtext ? (
                    <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 190 }}>
                      {item.subtext}
                    </Typography>
                  ) : null}
                </Stack>

                <Stack
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${item.color}.main`,
                    color: `${item.color}.contrastText`,
                    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.2)',
                    flexShrink: 0,
                  }}
                >
                  <IconifyIcon icon={item.icon} sx={{ fontSize: 22 }} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default KPICards;
