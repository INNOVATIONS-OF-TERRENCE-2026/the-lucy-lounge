import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { loadStoredTheme, loadThemeFromRemote } from "@/theme/useTheme";
import { useDarkMode } from "@/hooks/useDarkMode";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { PageSkeleton } from "@/components/skeleton/PageSkeleton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SystemGuards } from "@/components/system/SystemGuards";

/* ======================
   LAZY LOADED HEAVY COMPONENTS (Performance Optimization)
   ====================== */
const IntroScreen = lazy(() => import("@/components/branding/IntroScreen").then(m => ({ default: m.IntroScreen })));
const IOSAudioUnlockProvider = lazy(() => import("@/components/audio/IOSAudioUnlockProvider").then(m => ({ default: m.IOSAudioUnlockProvider })));
const GlobalSpotifyProvider = lazy(() => import("@/contexts/GlobalSpotifyContext").then(m => ({ default: m.GlobalSpotifyProvider })));
const LucyDJProvider = lazy(() => import("@/contexts/LucyDJContext").then(m => ({ default: m.LucyDJProvider })));
const LucyWorldsProvider = lazy(() => import("@/contexts/LucyWorldsContext").then(m => ({ default: m.LucyWorldsProvider })));
const GlobalSpotifyAudioHost = lazy(() => import("@/components/audio/GlobalSpotifyAudioHost").then(m => ({ default: m.GlobalSpotifyAudioHost })));
const GlobalMiniPlayer = lazy(() => import("@/components/audio/GlobalMiniPlayer").then(m => ({ default: m.GlobalMiniPlayer })));
const LucySuggestionDrawer = lazy(() => import("@/components/chat/LucySuggestionDrawer").then(m => ({ default: m.LucySuggestionDrawer })));
const LucyWorldsOverlay = lazy(() => import("@/components/worlds/LucyWorldsOverlay").then(m => ({ default: m.LucyWorldsOverlay })));
const InstallPrompt = lazy(() => import("@/components/pwa/InstallPrompt").then(m => ({ default: m.InstallPrompt })));
const OfflineBanner = lazy(() => import("@/components/pwa/OfflineBanner").then(m => ({ default: m.OfflineBanner })));
const AnalyticsTracker = lazy(() => import("@/components/analytics/AnalyticsTracker").then(m => ({ default: m.AnalyticsTracker })));
const FloatingCalculator = lazy(() => import("@/components/tools/FloatingCalculator").then(m => ({ default: m.FloatingCalculator })));
const AdminRoute = lazy(() => import("@/components/auth/AdminRoute").then(m => ({ default: m.AdminRoute })));
const GlobalCinematicLayer = lazy(() => import("@/components/cinematic/GlobalCinematicLayer").then(m => ({ default: m.GlobalCinematicLayer })));

/* ======================
   LAZY PAGES
   ====================== */

const Landing = lazy(() => import("@/pages/Landing"));
const Chat = lazy(() => import("@/pages/Chat"));
const Auth = lazy(() => import("@/pages/Auth"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const Features = lazy(() => import("@/pages/Features"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Tools = lazy(() => import("@/pages/Tools"));
const ToolsMarketplace = lazy(() => import("@/pages/ToolsMarketplace"));
const CreatorStudio = lazy(() => import("@/pages/CreatorStudio"));
const Launch = lazy(() => import("@/pages/Launch"));
const Studios = lazy(() => import("@/pages/Studios"));
const StudiosAI = lazy(() => import("@/pages/StudiosAI"));
const StudiosAudio = lazy(() => import("@/pages/StudiosAudio"));
const StudiosDev = lazy(() => import("@/pages/StudiosDev"));
const Media = lazy(() => import("@/pages/Media"));
const ListeningMode = lazy(() => import("@/pages/ListeningMode"));
const ExploreMode = lazy(() => import("@/pages/listening/ExploreMode"));

/* LOUNGES */
const NeuralMode = lazy(() => import("@/pages/lounges/NeuralMode"));
const DreamMode = lazy(() => import("@/pages/lounges/DreamMode"));
const VisionMode = lazy(() => import("@/pages/lounges/VisionMode"));
const SilentRoom = lazy(() => import("@/pages/lounges/SilentRoom"));
const MemoryTimeline = lazy(() => import("@/pages/lounges/MemoryTimeline"));
const CommandCenter = lazy(() => import("@/pages/lounges/CommandCenter"));
const QuantumMode = lazy(() => import("@/pages/lounges/QuantumMode"));
const PresenceMode = lazy(() => import("@/pages/lounges/PresenceMode"));
const WorldEvents = lazy(() => import("@/pages/lounges/WorldEvents"));

/* ARCADE */
const ArcadeHub = lazy(() => import("@/arcade/pages/ArcadeHub"));
const GamePage = lazy(() => import("@/arcade/pages/GamePage"));

/* GUIDES */
const CreditRepairGuide = lazy(() => import("@/pages/guides/CreditRepairGuide"));
const SBALoanGuide = lazy(() => import("@/pages/guides/SBALoanGuide"));
const WomenFundingGuide = lazy(() => import("@/pages/guides/WomenFundingGuide"));

/* COMPANY */
const Testimonials = lazy(() => import("@/pages/Testimonials"));
const Press = lazy(() => import("@/pages/Press"));
const EditorialStandards = lazy(() => import("@/pages/EditorialStandards"));
const Contact = lazy(() => import("@/pages/Contact"));
const AuthorPage = lazy(() => import("@/pages/about/AuthorPage"));

/* ADMIN */
const Analytics = lazy(() => import("@/pages/Analytics"));
const Admin = lazy(() => import("@/pages/Admin"));

/* ROOMS — NAMED EXPORT ADAPTERS (CRITICAL FIX) */
const RoomList = lazy(() => import("@/components/rooms/RoomList").then((m) => ({ default: m.RoomList })));
const RoomChat = lazy(() => import("@/components/rooms/RoomChat").then((m) => ({ default: m.RoomChat })));
const SharedConversation = lazy(() =>
  import("@/pages/SharedConversation").then((m) => ({
    default: m.SharedConversation,
  })),
);

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
      <Suspense fallback={null}>
        <GlobalSpotifyProvider>
          <LucyDJProvider>
            <LucyWorldsProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />

                {showIntro && (
                  <Suspense fallback={<PageSkeleton variant="default" />}>
                    <IntroScreen onComplete={handleIntroComplete} />
                  </Suspense>
                )}

                <Suspense fallback={null}>
                  <IOSAudioUnlockProvider />
                  <GlobalSpotifyAudioHost />
                  <GlobalMiniPlayer />
                  <LucySuggestionDrawer />
                  <FloatingCalculator />
                  <LucyWorldsOverlay />
                  <InstallPrompt />
                  <OfflineBanner />
                </Suspense>

                <div className={`w-full min-h-screen overflow-x-hidden ${hasShownIntro ? "animate-fade-in" : ""}`}>
                  <BrowserRouter>
                    <SystemGuards />
                    <ScrollToTop />
                    <Suspense fallback={null}>
                      <AnalyticsTracker />
                    </Suspense>

                    <Suspense fallback={null}>
                      <GlobalCinematicLayer>
                        <Suspense fallback={<PageSkeleton variant="default" />}>
                          <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/media" element={<Media />} />
                            <Route path="/features" element={<Features />} />
                            <Route path="/pricing" element={<Pricing />} />
                            <Route path="/tools" element={<Tools />} />
                            <Route path="/tools/marketplace" element={<ToolsMarketplace />} />
                            <Route path="/creator-studio" element={<CreatorStudio />} />
                            <Route path="/launch" element={<Launch />} />

                            <Route path="/listening-mode" element={<ListeningMode />} />
                            <Route path="/listening/explore" element={<ExploreMode />} />

                      <Route path="/studios" element={<Studios />} />
                      <Route path="/studios/ai" element={<StudiosAI />} />
                      <Route path="/studios/audio" element={<StudiosAudio />} />
                      <Route path="/studios/dev" element={<StudiosDev />} />

                      <Route path="/guides/business-credit-repair" element={<CreditRepairGuide />} />
                      <Route path="/guides/sba-loan-complete-guide" element={<SBALoanGuide />} />
                      <Route path="/guides/funding-for-women-entrepreneurs" element={<WomenFundingGuide />} />

                      <Route path="/about" element={<About />} />
                      <Route path="/about/terrence-milliner" element={<AuthorPage />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/testimonials" element={<Testimonials />} />
                      <Route path="/press" element={<Press />} />
                      <Route path="/editorial-standards" element={<EditorialStandards />} />
                      <Route path="/contact" element={<Contact />} />

                      <Route path="/rooms" element={<RoomList />} />
                      <Route path="/room/:roomId" element={<RoomChat />} />
                      <Route path="/shared/:token" element={<SharedConversation />} />

                      <Route path="/neural" element={<NeuralMode />} />
                      <Route path="/dream" element={<DreamMode />} />
                      <Route path="/vision" element={<VisionMode />} />
                      <Route path="/silent-room" element={<SilentRoom />} />
                      <Route path="/timeline" element={<MemoryTimeline />} />
                      <Route
                        path="/command"
                            element={
                              <Suspense fallback={<PageSkeleton variant="default" />}>
                                <AdminRoute>
                                  <CommandCenter />
                                </AdminRoute>
                              </Suspense>
                            }
                          />
                          <Route path="/quantum" element={<QuantumMode />} />
                          <Route path="/presence" element={<PresenceMode />} />
                          <Route path="/events" element={<WorldEvents />} />

                          {/* ARCADE */}
                          <Route path="/arcade" element={<ArcadeHub />} />
                          <Route path="/arcade/:gameId" element={<GamePage />} />

                          <Route path="/admin" element={<Admin />} />
                          <Route
                            path="/analytics"
                            element={
                              <Suspense fallback={<PageSkeleton variant="default" />}>
                                <AdminRoute>
                                  <Analytics />
                                </AdminRoute>
                              </Suspense>
                            }
                          />
                          </Routes>
                        </Suspense>
                      </GlobalCinematicLayer>
                    </Suspense>
                  </BrowserRouter>
                </div>
              </TooltipProvider>
            </LucyWorldsProvider>
          </LucyDJProvider>
        </GlobalSpotifyProvider>
      </Suspense>
    </QueryClientProvider>
  );
};

export default App;
