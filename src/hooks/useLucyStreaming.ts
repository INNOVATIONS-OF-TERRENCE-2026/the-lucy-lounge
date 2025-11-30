/**
 * Lucy Streaming Hook
 * Provides fake streaming effect for non-streaming APIs
 */

import { useState, useRef, useCallback, useEffect } from "react";

export function useLucyStreaming() {
  const [displayText, setDisplayText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const fullTextRef = useRef("");
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopStreaming = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const startStreaming = useCallback((fullText: string, speedMs = 20) => {
    stopStreaming();
    fullTextRef.current = fullText;
    indexRef.current = 0;
    setDisplayText("");
    setIsStreaming(true);

    timerRef.current = setInterval(() => {
      const nextIndex = indexRef.current + 3; // 3 chars at a time
      const slice = fullTextRef.current.slice(0, nextIndex);
      setDisplayText(slice);
      indexRef.current = nextIndex;

      if (nextIndex >= fullTextRef.current.length) {
        stopStreaming();
      }
    }, speedMs);
  }, [stopStreaming]);

  const skipToEnd = useCallback(() => {
    if (isStreaming && fullTextRef.current) {
      stopStreaming();
      setDisplayText(fullTextRef.current);
    }
  }, [isStreaming, stopStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    displayText,
    isStreaming,
    startStreaming,
    stopStreaming,
    skipToEnd,
  };
}
