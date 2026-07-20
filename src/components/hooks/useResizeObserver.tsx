import { useState, useEffect, RefObject } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

const useResizeObserver = (ref: RefObject<HTMLElement>) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setWidth(entry.contentRect.width);
        }
      }
    };

    const observer = new ResizeObserver(handleResize);
    const observedElement = ref.current;
    if (observedElement) {
      observer.observe(observedElement);
    }

    return () => {
      if (observedElement) {
        observer.unobserve(observedElement);
      }
      observer.disconnect();
    };
  }, [ref]);

  return width;
};

export default useResizeObserver;
