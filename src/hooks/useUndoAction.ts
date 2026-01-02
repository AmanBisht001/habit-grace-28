import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UndoAction<T> {
  type: string;
  data: T;
  timestamp: number;
}

export function useUndoAction<T>(
  onUndo: (data: T) => void,
  timeout = 5000
) {
  const [lastAction, setLastAction] = useState<UndoAction<T> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const recordAction = useCallback((type: string, data: T, message: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const action: UndoAction<T> = {
      type,
      data,
      timestamp: Date.now(),
    };

    setLastAction(action);

    // Show toast with undo button
    toast(message, {
      duration: timeout,
      action: {
        label: 'Undo',
        onClick: () => {
          onUndo(data);
          setLastAction(null);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        },
      },
    });

    // Auto-clear after timeout
    timeoutRef.current = setTimeout(() => {
      setLastAction(null);
    }, timeout);
  }, [onUndo, timeout]);

  const clearAction = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLastAction(null);
  }, []);

  return {
    lastAction,
    recordAction,
    clearAction,
  };
}
