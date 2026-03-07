import { useCallback, useRef } from "react";

type ClickEvent = (event: React.SyntheticEvent) => void;

type UseDoubleClickOptions = {
  timeout?: number;
};

export const useDoubleClick = (
  doubleClick: ClickEvent,
  click?: ClickEvent,
  options: UseDoubleClickOptions = {}
) => {
  const { timeout = 200 } = options;

  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClickTimeout = () => {
    if (clickTimeout.current !== null) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
  };

  return useCallback(
    (event: React.SyntheticEvent) => {
      clearClickTimeout();
      if (click && (event as React.UIEvent).detail === 1) {
        clickTimeout.current = setTimeout(() => {
          click(event);
        }, timeout);
      }
      if ((event as React.UIEvent).detail % 2 === 0) {
        doubleClick(event);
      }
    },
    [click, doubleClick, timeout]
  );
};