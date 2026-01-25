// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 🔥 This line is REQUIRED so all your Tailwind + CSS variables + theme styles load
import "./index.css";

// DEV-ONLY (or debug-flag) global runtime error capture for /chat crash diagnosis
// Enable by default in dev builds, or in prod by setting: localStorage.DEBUG_CHAT = "1"
try {
  const debugChatEnabled =
    import.meta.env.DEV ||
    (typeof window !== "undefined" &&
      (window.localStorage?.getItem("DEBUG_CHAT") === "1" ||
        new URLSearchParams(window.location.search).get("debug_chat") === "1"));

  if (debugChatEnabled && typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      // eslint-disable-next-line no-console
      console.error("[CHAT_RUNTIME_ERROR]", {
        route: window.location.pathname + window.location.search,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: (event.error as any)?.stack,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      const reason: any = (event as PromiseRejectionEvent).reason;
      // eslint-disable-next-line no-console
      console.error("[CHAT_RUNTIME_ERROR]", {
        route: window.location.pathname + window.location.search,
        message: reason?.message ?? String(reason),
        stack: reason?.stack,
        reason,
      });
    });
  }
} catch (e) {
  // Never allow debug tooling to crash the app
  // eslint-disable-next-line no-console
  console.warn("[CHAT_RUNTIME_ERROR] Failed to attach global handlers", e);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

