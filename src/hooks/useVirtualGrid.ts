import { useState, useEffect, useCallback, type RefObject } from 'react';
import type { VirtualWindow } from '../types';
import {
  DEFAULT_CELL_WIDTH,
  DEFAULT_CELL_HEIGHT,
  OVERSCAN_ROW_COUNT,
  OVERSCAN_COL_COUNT,
} from '../utils/constants';

export function useVirtualGrid(
  containerRef: RefObject<HTMLDivElement | null>,
  totalRows: number,
  totalCols: number,
): VirtualWindow {
  const [vw, setVw] = useState<VirtualWindow>({
    startRow: 0,
    endRow: 40,
    startCol: 0,
    endCol: 20,
    offsetTop: 0,
    offsetLeft: 0,
  });

  const calculate = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollLeft, clientHeight, clientWidth } = el;

    const visStartRow = Math.floor(scrollTop / DEFAULT_CELL_HEIGHT);
    const visEndRow = Math.ceil((scrollTop + clientHeight) / DEFAULT_CELL_HEIGHT);
    const visStartCol = Math.floor(scrollLeft / DEFAULT_CELL_WIDTH);
    const visEndCol = Math.ceil((scrollLeft + clientWidth) / DEFAULT_CELL_WIDTH);

    const startRow = Math.max(0, visStartRow - OVERSCAN_ROW_COUNT);
    const endRow = Math.min(totalRows - 1, visEndRow + OVERSCAN_ROW_COUNT);
    const startCol = Math.max(0, visStartCol - OVERSCAN_COL_COUNT);
    const endCol = Math.min(totalCols - 1, visEndCol + OVERSCAN_COL_COUNT);

    setVw({
      startRow,
      endRow,
      startCol,
      endCol,
      offsetTop: startRow * DEFAULT_CELL_HEIGHT,
      offsetLeft: startCol * DEFAULT_CELL_WIDTH,
    });
  }, [containerRef, totalRows, totalCols]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    calculate();

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(calculate);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [containerRef, calculate]);

  return vw;
}
