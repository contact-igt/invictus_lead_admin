import { Box, Stack, TextField } from '@mui/material';
import { DateRangePreset, PRESET_LABELS } from './dateRangePresets';

const GREEN = '#29AF81';
const BORDER = 'var(--bw-border)';
const TEXT_MUTED = 'var(--bw-text-muted)';

const PRESET_ORDER: DateRangePreset[] = ['today', 'yesterday', '7d', '30d', '90d', 'custom'];

interface DateRangeControlProps {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
}

const DateRangeControl = ({
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: DateRangeControlProps) => (
  <Stack direction="column" spacing={1} sx={{ minWidth: 0 }}>
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        p: 0.5,
        bgcolor: 'var(--bw-surface-2)',
        borderRadius: '10px',
        overflowX: 'auto',
        maxWidth: '100%',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {PRESET_ORDER.map((key) => {
        const active = preset === key;
        return (
          <Box
            key={key}
            component="button"
            type="button"
            onClick={() => onPresetChange(key)}
            aria-pressed={active}
            sx={{
              border: 0,
              cursor: 'pointer',
              flexShrink: 0,
              px: 1.5,
              py: 0.75,
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              color: active ? 'var(--bw-surface)' : TEXT_MUTED,
              bgcolor: active ? GREEN : 'transparent',
              transition: 'background-color 120ms ease, color 120ms ease',
              '&:hover': { bgcolor: active ? GREEN : 'var(--bw-hover)' },
              '&:focus-visible': { outline: `2px solid ${GREEN}`, outlineOffset: 2 },
            }}
          >
            {PRESET_LABELS[key]}
          </Box>
        );
      })}
    </Box>

    {preset === 'custom' && (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          type="date"
          size="small"
          label="From"
          InputLabelProps={{ shrink: true }}
          value={customFrom}
          onChange={(e) => onCustomFromChange(e.target.value)}
          sx={{ minWidth: 0, flex: 1, '& .MuiInputBase-root': { height: 38 } }}
        />
        <TextField
          type="date"
          size="small"
          label="To"
          InputLabelProps={{ shrink: true }}
          value={customTo}
          onChange={(e) => onCustomToChange(e.target.value)}
          sx={{ minWidth: 0, flex: 1, '& .MuiInputBase-root': { height: 38 }, borderColor: BORDER }}
        />
      </Stack>
    )}
  </Stack>
);

export default DateRangeControl;
