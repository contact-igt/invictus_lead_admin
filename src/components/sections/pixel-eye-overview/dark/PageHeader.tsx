import React, { ReactNode } from 'react';
import { PixelEyePageHeader } from 'components/sections/pixel-eye/pixelEyeUi';

const PageHeader: React.FC<{ subtitle?: string; actions?: ReactNode }> = ({
  subtitle,
  actions,
}) => {
  return (
    <PixelEyePageHeader
      eyebrow="PIXELEYE OVERVIEW"
      title="Overview"
      subtitle={subtitle}
      actions={actions}
    />
  );
};

export default PageHeader;
