import { useState, type ReactNode } from 'react';
import { Box, Collapse, Stack, TextField, InputAdornment } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import useTokens from 'hooks/useTokens';
import { font, motion, radius } from 'theme/tokens';
import Surface from './Surface';
import Button from './Button';
import Text from './Text';

/** Shared field styling so every input in the app matches. */
export const useFieldSx = () => {
  const t = useTokens();
  return {
    minWidth: 0,
    '& .MuiOutlinedInput-root': {
      height: 38,
      borderRadius: `${radius.control}px`,
      backgroundColor: t.surface,
      color: t.ink,
      fontFamily: font.sans,
      fontSize: '0.875rem',
      transition: `border-color ${motion.hover}`,
      '& fieldset': { borderColor: t.border },
      '&:hover fieldset': { borderColor: t.borderStrong },
      '&.Mui-focused fieldset': { borderColor: t.borderFocus, borderWidth: '1px' },
      '& input::placeholder': { color: t.inkMuted, opacity: 1 },
    },
    '& .MuiInputLabel-root': {
      fontFamily: font.sans,
      fontSize: '0.875rem',
      color: t.inkSecondary,
      '&.Mui-focused': { color: t.accentText },
    },
    '& .MuiSvgIcon-root': { color: t.inkMuted },
  };
};

export interface ToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Filter controls, revealed by the Filters toggle. */
  filters?: ReactNode;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  /** Rendered right of the search field — export, add, etc. */
  actions?: ReactNode;
  /** Bulk action bar, shown in place of the toolbar when rows are selected. */
  selectedCount?: number;
  bulkActions?: ReactNode;
  onClearSelection?: () => void;
}

/**
 * Workspace toolbar.
 *
 * Search is the primary control and always visible; secondary filters collapse
 * behind a toggle so the default state is one calm row instead of a wall of
 * six equal-weight inputs.
 */
export const Toolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  filters,
  activeFilterCount = 0,
  onClearFilters,
  actions,
  selectedCount = 0,
  bulkActions,
  onClearSelection,
}: ToolbarProps) => {
  const t = useTokens();
  const fieldSx = useFieldSx();
  const [open, setOpen] = useState(activeFilterCount > 0);

  if (selectedCount > 0 && bulkActions) {
    return (
      <Surface
        sx={{
          p: '12px 16px',
          borderColor: t.accentSoftBorder,
          backgroundColor: t.accentSoft,
        }}
      >
        <Stack direction="row" alignItems="center" gap="12px" flexWrap="wrap">
          <Text variant="label" sx={{ color: t.accentText, fontWeight: 600 }}>
            {selectedCount} selected
          </Text>
          <Box sx={{ flex: 1, minWidth: 8 }} />
          {bulkActions}
          {onClearSelection && (
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear
            </Button>
          )}
        </Stack>
      </Surface>
    );
  }

  return (
    <Surface sx={{ p: '12px 16px' }}>
      <Stack direction="row" alignItems="center" gap="8px" flexWrap="wrap" sx={{ minWidth: 0 }}>
        <TextField
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          size="small"
          sx={{ ...fieldSx, flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="solar:magnifer-linear" width={17} style={{ color: t.inkMuted }} />
              </InputAdornment>
            ),
            endAdornment: searchValue ? (
              <InputAdornment position="end">
                <Box
                  component="button"
                  type="button"
                  aria-label="Clear search"
                  onClick={() => onSearchChange('')}
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: t.inkMuted,
                    p: 0,
                    '&:hover': { color: t.ink },
                  }}
                >
                  <IconifyIcon icon="solar:close-circle-bold" width={16} />
                </Box>
              </InputAdornment>
            ) : null,
          }}
        />

        {filters && (
          <Button
            variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            startIcon={<IconifyIcon icon="solar:tuning-2-linear" width={16} />}
          >
            Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
          </Button>
        )}

        {actions}
      </Stack>

      {filters && (
        <Collapse in={open} timeout={200} unmountOnExit>
          <Box sx={{ mt: '12px', pt: '12px', borderTop: `1px solid ${t.border}` }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                gap: '12px',
                alignItems: 'center',
              }}
            >
              {filters}
            </Box>
            {onClearFilters && activeFilterCount > 0 && (
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: '12px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  startIcon={<IconifyIcon icon="solar:restart-linear" width={15} />}
                >
                  Reset filters
                </Button>
              </Stack>
            )}
          </Box>
        </Collapse>
      )}
    </Surface>
  );
};

export default Toolbar;
