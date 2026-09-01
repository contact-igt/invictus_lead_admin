import { forwardRef, useEffect, useRef } from 'react';
import { Box, BoxProps } from '@mui/material';
import { EChartsReactProps } from 'echarts-for-react';
import EChartsReactCore from 'echarts-for-react/lib/core';
import ReactEChartsCore from 'echarts-for-react/lib/core';

export interface ReactEchartProps extends BoxProps {
  echarts: EChartsReactProps['echarts'];
  option: EChartsReactProps['option'];
}

// The `/lib/core` build of echarts-for-react does not auto-resize when its
// container changes size via CSS (e.g. a grid column collapsing at a
// breakpoint) — only on a real window `resize` event, and not reliably even
// then. A ResizeObserver on the container is what actually keeps the canvas
// in sync, so charts never overflow their card at any viewport width.
const ReactEchart = forwardRef<null | EChartsReactCore, ReactEchartProps>(
  ({ option, sx, echarts, ...rest }, forwardedRef) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<EChartsReactCore | null>(null);

    useEffect(() => {
      const container = containerRef.current;
      if (!container || typeof ResizeObserver === 'undefined') return undefined;

      const observer = new ResizeObserver(() => {
        chartRef.current?.getEchartsInstance?.().resize();
      });
      observer.observe(container);
      return () => observer.disconnect();
    }, []);

    return (
      <Box ref={containerRef} sx={{ minWidth: 0, ...sx }} {...rest}>
        <ReactEChartsCore
          ref={(instance: EChartsReactCore | null) => {
            chartRef.current = instance;
            if (typeof forwardedRef === 'function') forwardedRef(instance);
            else if (forwardedRef) forwardedRef.current = instance;
          }}
          echarts={echarts}
          option={{
            ...option,
            tooltip: {
              ...option.tooltip,
              confine: true,
            },
          }}
          style={{ height: '100%', width: '100%' }}
        />
      </Box>
    );
  },
);

export default ReactEchart;
