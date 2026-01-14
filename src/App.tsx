import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* ===============================
   CORE LUCY MODULES - LAZY LOADED
================================ */

// Chat Page (includes auth handling, sidebar, and ChatInterface)
const Chat = lazy(() => import("./pages/Chat"));

// Cinematic Studio
const CinematicStudio = lazy(() => import("./cinematic/pages/CinematicStudio"));

// Landing pages
const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));

// Auth
const Auth = lazy(() => import("./pages/Auth"));

// Other pages
const About = lazy(() => import("./pages/About"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Features = lazy(() => import("./pages/Features"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Studios = lazy(() => import("./pages/Studios"));
const StudiosDev = lazy(() => import("./pages/StudiosDev"));
const StudiosAudio = lazy(() => import("./pages/StudiosAudio"));
const StudiosAI = lazy(() => import("./pages/StudiosAI"));
const Tools = lazy(() => import("./pages/Tools"));
const ToolsMarketplace = lazy(() => import("./pages/ToolsMarketplace"));
const Media = lazy(() => import("./pages/Media"));
const Admin = lazy(() => import("./pages/Admin"));
const Contact = lazy(() => import("./pages/Contact"));
const ListeningMode = lazy(() => import("./pages/ListeningMode"));
const ListeningExplore = lazy(() => import("./pages/ListeningExplore"));
const CreatorStudio = lazy(() => import("./pages/CreatorStudio"));
const SharedConversation = lazy(() => 
  import("./pages/SharedConversation").then(m => ({ default: m.SharedConversation }))
);

// Lounges
const DreamMode = lazy(() => import("./pages/lounges/DreamMode"));
const NeuralMode = lazy(() => import("./pages/lounges/NeuralMode"));
const VisionMode = lazy(() => import("./pages/lounges/VisionMode"));
const QuantumMode = lazy(() => import("./pages/lounges/QuantumMode"));
const SilentRoom = lazy(() => import("./pages/lounges/SilentRoom"));
const PresenceMode = lazy(() => import("./pages/lounges/PresenceMode"));
const MemoryTimeline = lazy(() => import("./pages/lounges/MemoryTimeline"));
const WorldEvents = lazy(() => import("./pages/lounges/WorldEvents"));
const CommandCenter = lazy(() => import("./pages/lounges/CommandCenter"));

// Arcade
const ArcadeHub = lazy(() => import("./arcade/pages/ArcadeHub"));
const GamePage = lazy(() => import("./arcade/pages/GamePage"));

/* ===============================
   LOADING FALLBACK
================================ */

function LoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading Lucy...</p>
      </div>
    </div>
  );
}

/* ===============================
   NOT FOUND
================================ */

function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center text-muted-foreground bg-background">
      Lucy couldn't find this page.
    </div>
  );
}

/* ===============================
   MASTER APP
================================ */

export default function App() {
  return (
    <div className="h-screen w-full bg-background text-foreground">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Root - Index page */}
          <Route path="/" element={<Index />} />

          {/* Lucy Lounge Chat */}
          <Route path="/lounge" element={<Chat />} />
          <Route path="/chat" element={<Chat />} />

          {/* Cinematic Studio */}
          <Route path="/cinematic" element={<CinematicStudio />} />

          {/* Auth */}
          <Route path="/auth" element={<Auth />} />

          {/* Landing pages */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />

          {/* Blog */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* Studios */}
          <Route path="/studios" element={<Studios />} />
          <Route path="/studios/dev" element={<StudiosDev />} />
          <Route path="/studios/audio" element={<StudiosAudio />} />
          <Route path="/studios/ai" element={<StudiosAI />} />
          <Route path="/creator-studio" element={<CreatorStudio />} />

          {/* Tools */}
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/marketplace" element={<ToolsMarketplace />} />

          {/* Media */}
          <Route path="/media" element={<Media />} />

          {/* Listening */}
          <Route path="/listening" element={<ListeningMode />} />
          <Route path="/listening/explore" element={<ListeningExplore />} />

          {/* Lounges */}
          <Route path="/lounges/dream" element={<DreamMode />} />
          <Route path="/lounges/neural" element={<NeuralMode />} />
          <Route path="/lounges/vision" element={<VisionMode />} />
          <Route path="/lounges/quantum" element={<QuantumMode />} />
          <Route path="/lounges/silent" element={<SilentRoom />} />
          <Route path="/lounges/presence" element={<PresenceMode />} />
          <Route path="/lounges/memory" element={<MemoryTimeline />} />
          <Route path="/lounges/world-events" element={<WorldEvents />} />
          <Route path="/lounges/command" element={<CommandCenter />} />

          {/* Arcade */}
          <Route path="/arcade" element={<ArcadeHub />} />
          <Route path="/arcade/:gameId" element={<GamePage />} />

          {/* Shared conversation */}
          <Route path="/share/:token" element={<SharedConversation />} />

          {/* Admin */}
          <Route path="/admin" element={<Admin />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}
