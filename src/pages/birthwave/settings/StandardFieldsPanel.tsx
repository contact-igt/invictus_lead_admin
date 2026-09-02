import { Box, Stack, Typography } from '@mui/material';

const CARD_BORDER = 'var(--bw-border)';
const TEXT_DARK = 'var(--bw-text)';
const TEXT_MUTED = 'var(--bw-text-muted)';

const STANDARD_FIELDS = [
  { label: 'Name', type: 'Text', required: true },
  { label: 'Mobile', type: 'Phone', required: true },
  { label: 'Email', type: 'Email', required: false },
  { label: 'Service', type: 'Text', required: false },
  { label: 'Source', type: 'Single select', required: false },
  { label: 'Status', type: 'Single select', required: true },
  { label: 'Assigned Doctor', type: 'Reference', required: false },
  { label: 'Next Follow-up', type: 'Date', required: false },
  { label: 'Notes', type: 'Long text', required: false },
];

// Built into the lead schema itself — always present, not editable here.
// Custom Fields is where the tenant extends beyond this set.
const StandardFieldsPanel = () => (
  <Box>
    <Typography sx={{ fontSize: '0.85rem', color: TEXT_MUTED, mb: 2 }}>
      These fields are built into every Birthwave lead and can&apos;t be removed or renamed. Add tenant-specific fields under Custom Fields.
    </Typography>
    <Stack direction="column" spacing={1}>
      {STANDARD_FIELDS.map((field) => (
        <Stack
          key={field.label}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 1.5, border: '1px solid', borderColor: CARD_BORDER, borderRadius: '10px' }}
        >
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT_DARK }}>
            {field.label}{field.required && <Typography component="span" sx={{ color: '#EF4444' }}> *</Typography>}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: TEXT_MUTED }}>{field.type}</Typography>
        </Stack>
      ))}
    </Stack>
  </Box>
);

export default StandardFieldsPanel;
