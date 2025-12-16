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
import { GlobalSpotifyAudioHost } from "@/components/audio/GlobalSpotifyAudioHost";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { RoomList } from "@/components/rooms/RoomList";
import { RoomChat } from "@/components/rooms/RoomChat";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import Tools from "./pages/Tools";
import ToolsMarketplace from "./pages/ToolsMarketplace";
import { SharedConversation } from "./pages/SharedConversation";
import Launch from "./pages/Launch";
import Studios from "./pages/Studios";
import StudiosAudio from "./pages/StudiosAudio";
import StudiosDev from "./pages/StudiosDev";
import StudiosAI from "./pages/StudiosAI";
import CreatorStudio from "./pages/CreatorStudio";
import NotFound from "./pages/NotFound";
import CreditRepairGuide from "./pages/guides/CreditRepairGuide";
import SBALoanGuide from "./pages/guides/SBALoanGuide";
import WomenFundingGuide from "./pages/guides/WomenFundingGuide";
import Metro2Explained from "./pages/blog/Metro2Explained";
import DisputeLetters from "./pages/blog/DisputeLetters";
import SBA7aVs504 from "./pages/blog/SBA7aVs504";
import SBABadCredit from "./pages/blog/SBABadCredit";
import WOSBCertification from "./pages/blog/WOSBCertification";
import BlackWomenGrants from "./pages/blog/BlackWomenGrants";
import Net30Vendors from "./pages/blog/Net30Vendors";
import Build90DayCredit from "./pages/blog/Build90DayCredit";
import BestAIToolsSmallBusiness from "./pages/blog/BestAIToolsSmallBusiness";
import AuthorPage from "./pages/about/AuthorPage";
import EditorialStandards from "./pages/EditorialStandards";
import Contact from "./pages/Contact";
import Press from "./pages/Press";
import Testimonials from "./pages/Testimonials";
import CreditRepairProblem from "./pages/programmatic/CreditRepairProblem";
import CreditRepairPersona from "./pages/programmatic/CreditRepairPersona";
import CreditRepairLocation from "./pages/programmatic/CreditRepairLocation";
import SBAFundingScenario from "./pages/programmatic/SBAFundingScenario";
import ComparisonPage from "./pages/programmatic/ComparisonPage";
import ListeningMode from "./pages/ListeningMode";

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
        <TooltipProvider>
          <Toaster />
          <Sonner />

          {showIntro && <IntroScreen onComplete={handleIntroComplete} />}

          <IOSAudioUnlockProvider />
          <GlobalSpotifyAudioHost />

          <InstallPrompt />
          <OfflineBanner />

          <div className={`w-full min-h-screen h-auto overflow-x-hidden ${hasShownIntro ? "animate-fade-in" : ""}`}>
            <BrowserRouter>
              <AnalyticsTracker />

            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/about/terrence-milliner" element={<AuthorPage />} />
              <Route path="/editorial-standards" element={<EditorialStandards />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/press" element={<Press />} />
              <Route path="/testimonials" element={<Testimonials />} />
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
              
              {/* SEO Cluster Articles */}
              <Route path="/blog/metro-2-credit-reporting-explained" element={<Metro2Explained />} />
              <Route path="/blog/dispute-letters-that-work" element={<DisputeLetters />} />
              <Route path="/blog/sba-7a-vs-504-loans" element={<SBA7aVs504 />} />
              <Route path="/blog/sba-loan-with-bad-credit" element={<SBABadCredit />} />
              <Route path="/blog/wosb-certification-guide" element={<WOSBCertification />} />
              <Route path="/blog/black-women-entrepreneur-grants" element={<BlackWomenGrants />} />
              <Route path="/blog/net-30-vendors-for-new-business" element={<Net30Vendors />} />
              <Route path="/blog/build-business-credit-90-days" element={<Build90DayCredit />} />
              <Route path="/blog/best-ai-tools-small-business-2025" element={<BestAIToolsSmallBusiness />} />
              
              {/* Programmatic SEO Pages */}
              <Route path="/credit-repair/how-to-fix-:problem" element={<CreditRepairProblem />} />
              <Route path="/credit-repair/for-:persona" element={<CreditRepairPersona />} />
              <Route path="/credit-repair/in-:state" element={<CreditRepairLocation />} />
              <Route path="/sba-funding/:scenario" element={<SBAFundingScenario />} />
              <Route path="/compare/:comparison" element={<ComparisonPage />} />
              
              <Route path="/auth" element={<Auth />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/studios" element={<Studios />} />
              <Route path="/studios/ai" element={<StudiosAI />} />
              <Route path="/studios/audio" element={<StudiosAudio />} />
              <Route path="/studios/dev" element={<StudiosDev />} />
              <Route path="/listening-mode" element={<ListeningMode />} />
              <Route path="/shared/:token" element={<SharedConversation />} />
              <Route path="/rooms" element={<RoomList />} />
              <Route path="/room/:roomId" element={<RoomChat />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </GlobalSpotifyProvider>
    </QueryClientProvider>
  );
};

export default App;
