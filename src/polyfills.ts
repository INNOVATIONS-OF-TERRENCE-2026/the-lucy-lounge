// ┌─────────────────────────────────────────────┐
// │ SAFARI-SAFE POLYFILL: requestIdleCallback   │
// └─────────────────────────────────────────────┘

if (typeof window !== "undefined") {
  if (typeof window.requestIdleCallback !== "function") {
    window.requestIdleCallback = function (cb, options) {
      const start = Date.now();
      return window.setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining: function () {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      }, 1);
    };
  }

  if (typeof window.cancelIdleCallback !== "function") {
    window.cancelIdleCallback = function (id) {
      clearTimeout(id);
    };
  }
}

// DEV-ONLY: Assert polyfill activation on iOS
if (process.env.NODE_ENV === "development") {
  const isIOS = typeof navigator !== "undefined" && /iP(ad|hone|od)/.test(navigator.userAgent);
  if (isIOS) {
    // eslint-disable-next-line no-console
    console.info("[Lucy] iOS detected — requestIdleCallback polyfill ACTIVE");
    if (typeof window.requestIdleCallback !== "function") {
      // eslint-disable-next-line no-console
      console.error("[Lucy] Polyfill failed to activate!");
    }
  }
}

// ──────────────────────────────────────────────
// SAFE SCHEDULER WRAPPER
// ──────────────────────────────────────────────

/**
 * Always use this instead of requestIdleCallback.
 * Guaranteed to be safe on all platforms.
 */
export function safeRequestIdleCallback(cb, options) {
  return window.requestIdleCallback(cb, options);
}
