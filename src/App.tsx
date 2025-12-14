import { useState, useEffect } from "react";
import { loadStoredTheme, loadThemeFromRemote } from "@/theme/useTheme";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import Launch from "./pages/Launch";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Tools from "./pages/Tools";
import ToolsMarketplace from "./pages/ToolsMarketplace";
import Analytics from "./pages/Analytics";
import CreatorStudio from "./pages/CreatorStudio";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Studios from "./pages/Studios";
import StudiosAI from "./pages/StudiosAI";
import StudiosAudio from "./pages/StudiosAudio";
import StudiosDev from "./pages/StudiosDev";
import { SharedConversation } from "./pages/SharedConversation";
import { RoomList } from "./components/rooms/RoomList";
import { RoomChat } from "./components/rooms/RoomChat";
import { AnalyticsDashboard } from "./components/analytics/AnalyticsDashboard";
import { IntroScreen } from "./components/branding/IntroScreen";
import { AnalyticsTracker } from "./components/analytics/AnalyticsTracker";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import { OfflineBanner } from "./components/pwa/OfflineBanner";
import { IOSAudioUnlockProvider } from "./components/audio/IOSAudioUnlockProvider";
import { useDarkMode } from "./hooks/useDarkMode";

// Guide pages
import CreditRepairGuide from "./pages/guides/CreditRepairGuide";
import SBALoanGuide from "./pages/guides/SBALoanGuide";
import WomenFundingGuide from "./pages/guides/WomenFundingGuide";

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
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {showIntro && <IntroScreen onComplete={handleIntroComplete} />}

        <IOSAudioUnlockProvider />

        <InstallPrompt />
        <OfflineBanner />

        <div className={`w-full min-h-screen h-auto overflow-x-hidden ${hasShownIntro ? "animate-fade-in" : ""}`}>
          <BrowserRouter>
            <AnalyticsTracker />

            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/features" element={<Features />} />
              <Route path="/launch" element={<Launch />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/tools/marketplace" element={<ToolsMarketplace />} />
              <Route path="/creator-studio" element={<CreatorStudio />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              
              {/* SEO Pillar Guide Pages */}
              <Route path="/guides/business-credit-repair" element={<CreditRepairGuide />} />
              <Route path="/guides/sba-loan-complete-guide" element={<SBALoanGuide />} />
              <Route path="/guides/funding-for-women-entrepreneurs" element={<WomenFundingGuide />} />
              
              <Route path="/auth" element={<Auth />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/studios" element={<Studios />} />
              <Route path="/studios/ai" element={<StudiosAI />} />
              <Route path="/studios/audio" element={<StudiosAudio />} />
              <Route path="/studios/dev" element={<StudiosDev />} />
              <Route path="/shared/:token" element={<SharedConversation />} />
              <Route path="/rooms" element={<RoomList />} />
              <Route path="/room/:roomId" element={<RoomChat />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
