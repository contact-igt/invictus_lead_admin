import { useId } from 'react';

export interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  /** Emphasises the final point — "where it ended up" is the readable part. */
  showEndpoint?: boolean;
  /** Card fill, used to ring the endpoint so it reads against the line. */
  ringColor?: string;
}

/**
 * Micro trend line for KPI cards. Area fill + emphasised endpoint so the shape
 * reads at 80x28 without axes.
 */
export const Sparkline = ({
  data,
  color,
  width = 80,
  height = 28,
  showEndpoint = true,
  ringColor = '#FFFFFF',
}: SparklineProps) => {
  const gradientId = useId();

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 3;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - pad - ((value - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} ${width},${height} 0,${height}`;
  const [endX, endY] = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEndpoint && (
        <circle cx={endX} cy={endY} r="2.75" fill={color} stroke={ringColor} strokeWidth="1.5" />
      )}
    </svg>
  );
};

export default Sparkline;
