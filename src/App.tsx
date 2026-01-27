import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { loadStoredTheme, loadThemeFromRemote } from "@/theme/useTheme";
import { useDarkMode } from "@/hooks/useDarkMode";
import { UIDensityProvider } from "@/hooks/useUIDensity";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { IntroScreen } from "@/components/branding/IntroScreen";
import { IOSAudioUnlockProvider } from "@/components/audio/IOSAudioUnlockProvider";
import { GlobalSpotifyProvider } from "@/contexts/GlobalSpotifyContext";
import { LucyDJProvider } from "@/contexts/LucyDJContext";
import { LucyWorldsProvider } from "@/contexts/LucyWorldsContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { GlobalSpotifyAudioHost } from "@/components/audio/GlobalSpotifyAudioHost";
import { GlobalMiniPlayer } from "@/components/audio/GlobalMiniPlayer";
import { LucySuggestionDrawer } from "@/components/chat/LucySuggestionDrawer";
import { LucyWorldsOverlay } from "@/components/worlds/LucyWorldsOverlay";
import { PageSkeleton } from "@/components/skeleton/PageSkeleton";

import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { IOSInstallPrompt } from "@/components/pwa/IOSInstallPrompt";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingCalculator } from "@/components/tools/FloatingCalculator";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { SystemGuards } from "@/components/system/SystemGuards";
import { GlobalCinematicLayer } from "@/components/cinematic/GlobalCinematicLayer";
import { FeatureErrorBoundary } from "@/components/system/FeatureErrorBoundary";
import { SafeMediaGateProvider } from "@/components/system/SafeMediaGate";
import { UserGestureGateProvider } from "@/hooks/useUserGestureGate";
import { OfflineGateProvider } from "@/components/system/OfflineGate";

/* ======================
   LAZY IMPORT WITH AUTO-RELOAD ON CHUNK ERROR
   ====================== */

/**
 * Wraps lazy import to auto-reload page when chunk fails to load.
 * This handles deployment cache mismatches gracefully.
 */
const lazyWithReload = (importFn: () => Promise<{ default: React.ComponentType<any> }>) => {
  return lazy(() => 
    importFn().catch((error) => {
      // Check if this is a chunk load error
      if (
        error.message?.includes('Failed to fetch dynamically imported module') ||
        error.message?.includes('Loading chunk') ||
        error.name === 'ChunkLoadError'
      ) {
        console.warn('[App] Chunk load failed, reloading page...', error.message);
        // Reload the page to get fresh chunks
        window.location.reload();
        // Return a dummy component while reloading
        return { default: () => null };
      }
      throw error;
    })
  );
};

/* ======================
   LAZY PAGES
   ====================== */

const Landing = lazyWithReload(() => import("@/pages/Landing"));
const Chat = lazyWithReload(() => import("@/pages/Chat"));
const Auth = lazyWithReload(() => import("@/pages/Auth"));
const Features = lazyWithReload(() => import("@/pages/Features"));
const Pricing = lazyWithReload(() => import("@/pages/Pricing"));
const About = lazyWithReload(() => import("@/pages/About"));
const Blog = lazyWithReload(() => import("@/pages/Blog"));
const BlogPost = lazyWithReload(() => import("@/pages/BlogPost"));
const Tools = lazyWithReload(() => import("@/pages/Tools"));
const ToolsMarketplace = lazyWithReload(() => import("@/pages/ToolsMarketplace"));
const CreatorStudio = lazyWithReload(() => import("@/pages/CreatorStudio"));
const Launch = lazyWithReload(() => import("@/pages/Launch"));
const Studios = lazyWithReload(() => import("@/pages/Studios"));
const StudiosAI = lazyWithReload(() => import("@/pages/StudiosAI"));
const StudiosAudio = lazyWithReload(() => import("@/pages/StudiosAudio"));
const StudiosDev = lazyWithReload(() => import("@/pages/StudiosDev"));
// PHASE 2: MediaV2 with Universal Media Intelligence Layer
const Media = lazyWithReload(() => import("@/pages/MediaV2"));
// PHASE 2: ListeningModeV2 with Graph-driven recommendations
const ListeningMode = lazyWithReload(() => import("@/pages/ListeningModeV2"));
// PHASE 2: ExploreModeV2 with Lucy Journeys & Mood Discovery
const ExploreMode = lazyWithReload(() => import("@/pages/listening/ExploreModeV2"));

/* LOUNGES */
const NeuralMode = lazyWithReload(() => import("@/pages/lounges/NeuralMode"));
const DreamMode = lazyWithReload(() => import("@/pages/lounges/DreamMode"));
const VisionMode = lazyWithReload(() => import("@/pages/lounges/VisionMode"));
const SilentRoom = lazyWithReload(() => import("@/pages/lounges/SilentRoom"));
const MemoryTimeline = lazyWithReload(() => import("@/pages/lounges/MemoryTimeline"));
const CommandCenter = lazyWithReload(() => import("@/pages/lounges/CommandCenter"));
const QuantumMode = lazyWithReload(() => import("@/pages/lounges/QuantumMode"));
const PresenceMode = lazyWithReload(() => import("@/pages/lounges/PresenceMode"));
const WorldEvents = lazyWithReload(() => import("@/pages/lounges/WorldEvents"));

/* TOOLS (Individual Tool Pages) */
const PdfExtractor = lazyWithReload(() => import("@/pages/tools/PdfExtractor"));
const WebsiteSummarizer = lazyWithReload(() => import("@/pages/tools/WebsiteSummarizer"));
const ImageCaptioning = lazyWithReload(() => import("@/pages/tools/ImageCaptioning"));
const MathCalculator = lazyWithReload(() => import("@/pages/tools/MathCalculator"));
const HtmlToText = lazyWithReload(() => import("@/pages/tools/HtmlToText"));
const DataTableAnalyzer = lazyWithReload(() => import("@/pages/tools/DataTableAnalyzer"));
const CodeExecutorPage = lazyWithReload(() => import("@/pages/tools/CodeExecutor"));
const WebFetcher = lazyWithReload(() => import("@/pages/tools/WebFetcher"));

/* ARCADE */
const ArcadeHub = lazyWithReload(() => import("@/arcade/pages/ArcadeHub"));
const GamePage = lazyWithReload(() => import("@/arcade/pages/GamePage"));

/* GUIDES */
const CreditRepairGuide = lazyWithReload(() => import("@/pages/guides/CreditRepairGuide"));
const SBALoanGuide = lazyWithReload(() => import("@/pages/guides/SBALoanGuide"));
const WomenFundingGuide = lazyWithReload(() => import("@/pages/guides/WomenFundingGuide"));

/* COMPANY */
const Testimonials = lazyWithReload(() => import("@/pages/Testimonials"));
const Press = lazyWithReload(() => import("@/pages/Press"));
const EditorialStandards = lazyWithReload(() => import("@/pages/EditorialStandards"));
const Contact = lazyWithReload(() => import("@/pages/Contact"));
const AuthorPage = lazyWithReload(() => import("@/pages/about/AuthorPage"));

/* ADMIN */
const Analytics = lazyWithReload(() => import("@/pages/Analytics"));
const Admin = lazyWithReload(() => import("@/pages/Admin"));

/* ROOMS — NAMED EXPORT ADAPTERS (CRITICAL FIX) */
const RoomList = lazyWithReload(() => import("@/components/rooms/RoomList").then((m) => ({ default: m.RoomList })));
const RoomChat = lazyWithReload(() => import("@/components/rooms/RoomChat").then((m) => ({ default: m.RoomChat })));
const SharedConversation = lazyWithReload(() =>
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
      <BrandingProvider>
        <OrganizationProvider>
          <SubscriptionProvider>
            <UIDensityProvider>
              <OfflineGateProvider>
                <UserGestureGateProvider>
                  <GlobalSpotifyProvider>
                    <LucyDJProvider>
                      <LucyWorldsProvider>
                        <SafeMediaGateProvider>
                          <TooltipProvider>
                      <Toaster />
                      <Sonner />

                      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}

                      {/* Audio components wrapped in error boundary - these are high-risk on mobile */}
                      <FeatureErrorBoundary feature="audio-providers" silent>
                        <IOSAudioUnlockProvider />
                        <GlobalSpotifyAudioHost />
                      </FeatureErrorBoundary>

                      <FeatureErrorBoundary feature="mini-player" silent>
                      <GlobalMiniPlayer />
                    </FeatureErrorBoundary>

                    <LucySuggestionDrawer />
                    <FloatingCalculator />
                    
                    <FeatureErrorBoundary feature="worlds-overlay" silent>
                      <LucyWorldsOverlay />
                    </FeatureErrorBoundary>

                    <InstallPrompt />
                    <IOSInstallPrompt />
                    <OfflineBanner />

              <div className={`w-full min-h-screen overflow-x-hidden ${hasShownIntro ? "animate-fade-in" : ""}`}>
                <BrowserRouter>
                  <SystemGuards />
                  <ScrollToTop />
                  <AnalyticsTracker />

                  <GlobalCinematicLayer>
                    <Suspense fallback={<PageSkeleton variant="default" />}>
                      <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/media" element={<Media />} />
                        <Route path="/features" element={<Features />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/tools" element={<Tools />} />
                        <Route path="/tools/marketplace" element={<ToolsMarketplace />} />
                        <Route path="/tools/pdf-extractor" element={<PdfExtractor />} />
                        <Route path="/tools/website-summarizer" element={<WebsiteSummarizer />} />
                        <Route path="/tools/image-captioning" element={<ImageCaptioning />} />
                        <Route path="/tools/calculator" element={<MathCalculator />} />
                        <Route path="/tools/html-to-text" element={<HtmlToText />} />
                        <Route path="/tools/data-analyzer" element={<DataTableAnalyzer />} />
                        <Route path="/tools/code-executor" element={<CodeExecutorPage />} />
                        <Route path="/tools/web-fetcher" element={<WebFetcher />} />
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
                          <AdminRoute>
                            <CommandCenter />
                          </AdminRoute>
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
                          <AdminRoute>
                            <Analytics />
                          </AdminRoute>
                        }
                      />
                      </Routes>
                    </Suspense>
                  </GlobalCinematicLayer>
                </BrowserRouter>
              </div>
                          </TooltipProvider>
                      </SafeMediaGateProvider>
                    </LucyWorldsProvider>
                  </LucyDJProvider>
                </GlobalSpotifyProvider>
              </UserGestureGateProvider>
            </OfflineGateProvider>
          </UIDensityProvider>
        </SubscriptionProvider>
      </OrganizationProvider>
    </BrandingProvider>
    </QueryClientProvider>
  );
};

export default App;
