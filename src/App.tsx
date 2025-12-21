import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { loadStoredTheme, loadThemeFromRemote } from "@/theme/useTheme";
import { useDarkMode } from "@/hooks/useDarkMode";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

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

/* ===== PAGES ===== */
import Landing from "@/pages/Landing";
import Chat from "@/pages/Chat";
import Auth from "@/pages/Auth";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Tools from "@/pages/Tools";
import ToolsMarketplace from "@/pages/ToolsMarketplace";
import CreatorStudio from "@/pages/CreatorStudio";
import Launch from "@/pages/Launch";
import Studios from "@/pages/Studios";
import StudiosAI from "@/pages/StudiosAI";
import StudiosAudio from "@/pages/StudiosAudio";
import StudiosDev from "@/pages/StudiosDev";
import Media from "@/pages/Media";
import ListeningMode from "@/pages/ListeningMode";
import NotFound from "@/pages/NotFound";

/* ===== GUIDES ===== */
import CreditRepairGuide from "@/pages/guides/CreditRepairGuide";
import SBALoanGuide from "@/pages/guides/SBALoanGuide";
import WomenFundingGuide from "@/pages/guides/WomenFundingGuide";

/* ===== COMPANY ===== */
import Testimonials from "@/pages/Testimonials";
import Press from "@/pages/Press";
import EditorialStandards from "@/pages/EditorialStandards";
import Contact from "@/pages/Contact";
import AuthorPage from "@/pages/about/AuthorPage";

/* ===== ADMIN ===== */
import Analytics from "@/pages/Analytics";
import Admin from "@/pages/Admin";

/* ===== ROOMS ===== */
import { RoomList } from "@/components/rooms/RoomList";
import { RoomChat } from "@/components/rooms/RoomChat";
import { SharedConversation } from "@/pages/SharedConversation";

const queryClient = new QueryClient();

const App = () => {
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
                  {/* PUBLIC */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/media" element={<Media />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="/tools/marketplace" element={<ToolsMarketplace />} />
                  <Route path="/creator-studio" element={<CreatorStudio />} />
                  <Route path="/launch" element={<Launch />} />
                  <Route path="/listening-mode" element={<ListeningMode />} />

                  {/* STUDIOS — FIXED */}
                  <Route path="/studios" element={<Studios />} />
                  <Route path="/studios/ai" element={<StudiosAI />} />
                  <Route path="/studios/audio" element={<StudiosAudio />} />
                  <Route path="/studios/dev" element={<StudiosDev />} />

                  {/* GUIDES — FIXED */}
                  <Route path="/guides/business-credit-repair" element={<CreditRepairGuide />} />
                  <Route path="/guides/sba-loan-complete-guide" element={<SBALoanGuide />} />
                  <Route path="/guides/funding-for-women-entrepreneurs" element={<WomenFundingGuide />} />

                  {/* COMPANY */}
                  <Route path="/about" element={<About />} />
                  <Route path="/about/terrence-milliner" element={<AuthorPage />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/testimonials" element={<Testimonials />} />
                  <Route path="/press" element={<Press />} />
                  <Route path="/editorial-standards" element={<EditorialStandards />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* ROOMS */}
                  <Route path="/rooms" element={<RoomList />} />
                  <Route path="/room/:roomId" element={<RoomChat />} />
                  <Route path="/shared/:token" element={<SharedConversation />} />

                  {/* ADMIN */}
                  <Route path="/admin" element={<Admin />} />
                  <Route
                    path="/analytics"
                    element={
                      <AdminRoute>
                        <Analytics />
                      </AdminRoute>
                    }
                  />

                  {/* FALLBACK */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </LucyDJProvider>
      </GlobalSpotifyProvider>
    </QueryClientProvider>
  );
};

export default App;
