// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "@/contexts/AuthContext";
import "./index.css";

const queryClient = new QueryClient();

/* -------------------------------------------------------
   GLOBAL RUNTIME ERROR CAPTURE (SAFE)
------------------------------------------------------- */
try {
  const debugChatEnabled =
    import.meta.env.DEV ||
    (typeof window !== "undefined" &&
      (window.localStorage?.getItem("DEBUG_CHAT") === "1" ||
        new URLSearchParams(window.location.search).get("debug_chat") === "1"));

  if (debugChatEnabled && typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      console.error("[RUNTIME_ERROR]", {
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
      console.error("[RUNTIME_ERROR]", {
        route: window.location.pathname + window.location.search,
        message: reason?.message ?? String(reason),
        stack: reason?.stack,
        reason,
      });
    });
  }
} catch (e) {
  console.warn("[RUNTIME_ERROR] Debug handler failed", e);
}

/* -------------------------------------------------------
   APP BOOTSTRAP
------------------------------------------------------- */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
