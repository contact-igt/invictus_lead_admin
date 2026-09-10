import { Box, Stack, Typography } from '@mui/material';

// Render the supplied labels verbatim: questionnaire keys vary between flows.
export default function DynamicDetails({ value }: { value: unknown }) {
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value);
    if (!entries.length) return <Typography color="text.secondary">No details provided</Typography>;
    return (
      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        {entries.map(([key, item]) => (
          <Box key={key} sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'var(--bw-text-muted)', overflowWrap: 'anywhere' }}>
              {Array.isArray(value) ? `Item ${Number(key) + 1}` : key}
            </Typography>
            <Box sx={item !== null && typeof item === 'object' ? { pl: 2, borderLeft: '1px solid var(--bw-border)', mt: 0.5 } : undefined}>
              <DynamicDetails value={item} />
            </Box>
          </Box>
        ))}
      </Stack>
    );
  }
  return (
    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--bw-text)', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
      {value === null || value === undefined || value === '' ? 'Not provided' : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
    </Typography>
  );
}
