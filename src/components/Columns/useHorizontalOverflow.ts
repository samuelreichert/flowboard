import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { WheelEvent } from 'react';

type OverflowElement = Pick<HTMLElement, 'clientWidth' | 'scrollWidth'>;
type HorizontallyScrollableElement = Pick<
  HTMLElement,
  'clientWidth' | 'scrollLeft' | 'scrollWidth'
>;

export const hasHorizontalOverflow = (element: OverflowElement) =>
  element.scrollWidth > element.clientWidth;

export const getHorizontalWheelDelta = ({
  deltaX,
  deltaY,
  shiftKey,
}: Pick<WheelEvent<HTMLElement>, 'deltaX' | 'deltaY' | 'shiftKey'>) => {
  if (shiftKey) {
    return deltaX || deltaY;
  }

  return Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : 0;
};

export const scrollByHorizontalInput = (
  element: HorizontallyScrollableElement,
  deltaX: number
) => {
  const maxScrollLeft = element.scrollWidth - element.clientWidth;

  if (!deltaX || maxScrollLeft <= 0) {
    return false;
  }

  const nextScrollLeft = Math.min(
    maxScrollLeft,
    Math.max(0, element.scrollLeft + deltaX)
  );

  if (nextScrollLeft === element.scrollLeft) {
    return false;
  }

  element.scrollLeft = nextScrollLeft;
  return true;
};

export const useHorizontalOverflow = (contentVersion: number) => {
  const columnsListRef = useRef<HTMLDivElement | null>(null);
  const scrollRailRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrollWidth, setScrollWidth] = useState(0);
  const updateOverflow = useCallback(() => {
    const element = columnsListRef.current;
    const nextHasOverflow = element ? hasHorizontalOverflow(element) : false;

    setScrollWidth(element?.scrollWidth ?? 0);

    setHasOverflow((currentHasOverflow) =>
      currentHasOverflow === nextHasOverflow
        ? currentHasOverflow
        : nextHasOverflow
    );
  }, []);

  useLayoutEffect(() => {
    const element = columnsListRef.current;

    if (!element) {
      setHasOverflow(false);
      setScrollWidth(0);
      return;
    }

    updateOverflow();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(element);

    return () => observer.disconnect();
  }, [contentVersion, updateOverflow]);

  const onColumnsScroll = useCallback(() => {
    const columnsList = columnsListRef.current;
    const scrollRail = scrollRailRef.current;

    if (columnsList && scrollRail) {
      scrollRail.scrollLeft = columnsList.scrollLeft;
    }
  }, []);

  const onColumnsWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    const deltaX = getHorizontalWheelDelta(event);

    if (scrollByHorizontalInput(event.currentTarget, deltaX)) {
      event.preventDefault();
    }
  }, []);

  const onScrollRailScroll = useCallback(() => {
    const columnsList = columnsListRef.current;
    const scrollRail = scrollRailRef.current;

    if (columnsList && scrollRail) {
      columnsList.scrollLeft = scrollRail.scrollLeft;
    }
  }, []);

  return {
    columnsListRef,
    hasOverflow,
    onColumnsScroll,
    onColumnsWheel,
    onScrollRailScroll,
    scrollRailRef,
    scrollWidth,
  };
};
