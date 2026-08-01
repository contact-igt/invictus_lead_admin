import React from 'react';
import { Box } from '@mui/material';

export interface ShimmerSkeletonProps {
  height?: number | string;
  width?: number | string;
  borderRadius?: number | string;
  count?: number;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  height = 120,
  width = '100%',
  borderRadius = '18px',
  count = 1,
}) => {
  return (
    <>
      <style>{`
        @keyframes enterpriseShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {Array.from({ length: count }).map((_, idx) => (
          <Box
            key={idx}
            sx={{
              height,
              width,
              borderRadius,
              background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
              backgroundSize: '200% 100%',
              animation: 'enterpriseShimmer 1.5s linear infinite',
              border: '1px solid #E5E7EB',
            }}
          />
        ))}
      </Box>
    </>
  );
};

export default ShimmerSkeleton;
