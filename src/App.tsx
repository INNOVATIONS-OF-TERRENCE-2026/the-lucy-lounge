import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* ===============================
   CORE LUCY MODULES
================================ */

// Chat (Lucy Core)
import ChatInterface from "./components/chat/ChatInterface";

// Cinematic Studio
import CinematicStudio from "./cinematic/pages/CinematicStudio";

// Optional Landing / Welcome
import LandingPage from "./pages/LandingPage";

/* ===============================
   FALLBACKS
================================ */

function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center text-muted-foreground">
      Lucy couldn’t find this page.
    </div>
  );
}

/* ===============================
   MASTER APP
================================ */

export default function App() {
  return (
    <div className="h-screen w-full bg-background text-foreground">
      <Routes>
        {/* Root */}
        <Route path="/" element={<Navigate to="/lounge" replace />} />

        {/* Lucy Lounge Chat */}
        <Route path="/lounge" element={<ChatInterface />} />

        {/* Cinematic Studio */}
        <Route path="/cinematic" element={<CinematicStudio />} />

        {/* Optional Welcome */}
        <Route path="/welcome" element={<LandingPage />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
