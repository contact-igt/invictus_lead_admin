import type { ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import { radius } from 'theme/tokens';
import Text from './Text';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Client identity marker — a small chip, never a full-bleed page tint. */
  identity?: { label?: string; color: string; icon: string };
  actions?: ReactNode;
}

/**
 * Slim page header — one rhythm across every screen.
 *
 * Deliberately not a tinted hero panel: on data-dense pages that pushed the
 * first row of real content ~120px down. Client colour survives as the icon
 * chip so wayfinding is preserved without polluting the palette.
 */
export const PageHeader = ({ title, subtitle, identity, actions }: PageHeaderProps) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      gap="16px"
      sx={{ width: '100%', minWidth: 0, minHeight: 48 }}
    >
      <Stack direction="row" alignItems="center" gap="10px" sx={{ minWidth: 0, flex: 1 }}>
        {identity && (
          <Box
            aria-hidden="true"
            sx={{
              width: 3,
              alignSelf: 'stretch',
              minHeight: 28,
              borderRadius: `${radius.pill}px`,
              flexShrink: 0,
              backgroundColor: identity.color,
            }}
          />
        )}
        <Box sx={{ minWidth: 0 }}>
          <Text variant="pageTitle" truncate title={title}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" tone="muted" truncate sx={{ mt: '1px' }}>
              {subtitle}
            </Text>
          )}
        </Box>
      </Stack>

      {actions && (
        <Stack
          direction="row"
          gap="8px"
          flexWrap="wrap"
          sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
        >
          {actions}
        </Stack>
      )}
    </Stack>
  );
};

export interface SectionHeaderProps {
  title: string;
  meta?: string;
  actions?: ReactNode;
}

/**
 * Band label.
 *
 * Deliberately quiet: a tracked uppercase eyebrow, no trailing hairline rule.
 * The rule was chrome that encoded nothing and stole vertical space on a page
 * operators keep open all day.
 */
export const SectionHeader = ({ title, meta, actions }: SectionHeaderProps) => (
  <Stack direction="row" alignItems="baseline" gap="8px" sx={{ mb: '10px', minWidth: 0 }}>
    <Text variant="eyebrow" tone="secondary" truncate>
      {title}
    </Text>
    {meta && (
      <Text variant="caption" tone="muted" truncate sx={{ opacity: 0.8, minWidth: 0 }}>
        {meta}
      </Text>
    )}
    {actions && (
      <>
        <Box sx={{ flex: 1, minWidth: 8 }} />
        {actions}
      </>
    )}
  </Stack>
);

export default PageHeader;
