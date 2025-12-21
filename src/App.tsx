import { useState, useEffect } from "react";
import { loadStoredTheme, loadThemeFromRemote } from "@/theme/useTheme";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDarkMode } from "@/hooks/useDarkMode";
import { IntroScreen } from "@/components/branding/IntroScreen";
import { IOSAudioUnlockProvider } from "@/components/audio/IOSAudioUnlockProvider";
import { GlobalSpotifyProvider } from "@/contexts/GlobalSpotifyContext";
import { LucyDJProvider } from "@/contexts/LucyDJContext";
import { GlobalSpotifyAudioHost } from "@/components/audio/GlobalSpotifyAudioHost";
import { GlobalMiniPlayer } from "@/components/audio/GlobalMiniPlayer";
import { LucySuggestionDrawer } from "@/components/chat/LucySuggestionDrawer";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingCalculator } from "@/components/tools/FloatingCalculator";
import { AdminRoute } from "@/components/auth/AdminRoute";

import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Analytics from "./pages/Analytics";
import Tools from "./pages/Tools";
import CreatorStudio from "./pages/CreatorStudio";
import NotFound from "./pages/NotFound";
import Media from "./pages/Media";

const queryClient = new QueryClient();

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [hasShownIntro, setHasShownIntro] = useState(false);

  useDarkMode();

  useEffect(() => {
    loadStoredTheme();
    loadThemeFromRemote();
  }, []);

  useEffect(() => {
    const introShown = sessionStorage.getItem("lucy-intro-shown");
    if (introShown) {
      setShowIntro(false);
      setHasShownIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem("lucy-intro-shown", "true");
    setShowIntro(false);
    setHasShownIntro(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSpotifyProvider>
        <LucyDJProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />

            {showIntro && <IntroScreen onComplete={handleIntroComplete} />}

            <IOSAudioUnlockProvider />
            <GlobalSpotifyAudioHost />
            <GlobalMiniPlayer />
            <LucySuggestionDrawer />
            <FloatingCalculator />

            <InstallPrompt />
            <OfflineBanner />

            <div className={`w-full min-h-screen overflow-x-hidden ${hasShownIntro ? "animate-fade-in" : ""}`}>
              <BrowserRouter>
                <ScrollToTop />
                <AnalyticsTracker />

                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="/creator-studio" element={<CreatorStudio />} />
                  <Route path="/media" element={<Media />} />

                  <Route
                    path="/analytics"
                    element={
                      <AdminRoute>
                        <Analytics />
                      </AdminRoute>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </LucyDJProvider>
      </GlobalSpotifyProvider>
    </QueryClientProvider>
  );
}
