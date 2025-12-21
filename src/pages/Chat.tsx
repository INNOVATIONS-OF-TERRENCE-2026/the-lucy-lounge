import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/branding/LoadingScreen";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { WeatherEffectsOverlay } from "@/components/ambient/WeatherEffectsOverlay";
import { WeatherAmbientProvider, useWeatherAmbient } from "@/hooks/useWeatherAmbient";
import { FocusModeProvider, useFocusMode } from "@/hooks/useFocusMode";
import { CursorGlowOverlay } from "@/components/ambient/CursorGlowOverlay";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { ClientOnly } from "@/components/system/ClientOnly";
import { isSafeMode, isWeatherEffectsEnabled } from "@/lib/features";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

// Loading skeleton for chat
const ChatLoadingSkeleton = () => (
  <div className="flex flex-row w-full h-screen max-h-screen overflow-hidden bg-background">
    <div className="w-64 h-full bg-muted/20 animate-pulse hidden md:block" />
    <div className="flex-1 flex flex-col max-w-full min-w-0">
      <div className="h-16 bg-muted/10 animate-pulse" />
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted/10 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-20 bg-muted/10 animate-pulse" />
    </div>
  </div>
);

// Logged out view - shows sign in prompt instead of redirecting
const LoggedOutView = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome to Lucy AI
          </h2>
          <p className="text-muted-foreground">
            Sign in to start chatting with your intelligent AI companion.
          </p>
        </div>
        <Button 
          onClick={() => navigate("/auth")} 
          size="lg"
          className="gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In to Chat
        </Button>
      </div>
    </div>
  );
};

// Inner component that uses the weather context
const ChatContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Safe access to context with fallbacks
  let weather = 'clear';
  let season = 'none';
  let intensity = 0.7;
  let enabled = true;
  let focusMode = false;
  
  try {
    const weatherContext = useWeatherAmbient();
    weather = weatherContext.weather;
    season = weatherContext.season;
    intensity = weatherContext.intensity;
    enabled = weatherContext.enabled;
  } catch (e) {
    console.warn('[CHAT_CRASH_GUARD] Weather context unavailable:', e);
  }
  
  try {
    const focusContext = useFocusMode();
    focusMode = focusContext.focusMode;
  } catch (e) {
    console.warn('[CHAT_CRASH_GUARD] Focus mode context unavailable:', e);
  }

  // Safe mode check
  const safeMode = isSafeMode();
  const showEffects = !safeMode && !focusMode && isWeatherEffectsEnabled();

  // Redirect guard ref to prevent multiple redirects
  const hasRedirected = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('[CHAT_CRASH_GUARD] Auth error:', error);
        }
        
        if (session?.user) {
          setUser(session.user);
        }
        
        setAuthChecked(true);
        setIsLoading(false);
      } catch (e) {
        console.error('[CHAT_CRASH_GUARD] Session check failed:', e);
        if (isMounted) {
          setAuthChecked(true);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      if (session?.user) {
        setUser(session.user);
        setIsLoading(false);
      } else {
        setUser(null);
        setIsLoading(false);
      }
      setAuthChecked(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show loading while checking auth
  if (isLoading || !authChecked) {
    return <LoadingScreen message="Entering the Cosmic AI Temple..." />;
  }

  // Show logged out view if no user (instead of hard redirect)
  if (!user) {
    return <LoggedOutView />;
  }

  const debugChat =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    window.localStorage?.getItem("DEBUG_CHAT") === "1";

  const isolateMode = debugChat && typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("isolate")
    : null;

  return (
    <>
      {!safeMode && <CosmicBackground />}
      {showEffects && (
        <>
          <WeatherEffectsOverlay
            weather={weather as any}
            season={season as any}
            intensity={intensity}
            enabled={enabled}
          />
          <CursorGlowOverlay enabled={enabled} />
        </>
      )}

      <SidebarProvider>
        <div
          className="
          flex flex-row w-full h-screen max-h-screen overflow-hidden
          max-w-full min-w-0
          bg-[var(--theme-bg-1)] text-[var(--theme-text)]
          transition-all duration-500
          chat-container
        "
        >
          <ChatSidebar
            userId={user?.id}
            currentConversationId={currentConversationId}
            onConversationSelect={setCurrentConversationId}
          />

          <div
            className="
            relative flex flex-col flex-1 h-full w-full overflow-visible
            bg-[var(--theme-bg-2)]
            transition-all duration-500
          "
          >
            {/* DEBUG: isolate chat failures without changing production behavior */}
            {debugChat && isolateMode === "shell" ? (
              <div className="p-6 text-sm text-muted-foreground">
                DEBUG_CHAT enabled • isolate=shell • ChatInterface disabled
              </div>
            ) : (
              <ChatInterface
                userId={user?.id}
                conversationId={currentConversationId}
                onConversationCreated={setCurrentConversationId}
              />
            )}
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

// Main Chat component with provider wrapper and error boundary
const Chat = () => {
  return (
    <ErrorBoundary routeTag="CHAT" fallbackMessage="Chat failed to load.">
      <ClientOnly fallback={<ChatLoadingSkeleton />}>
        <FocusModeProvider>
          <WeatherAmbientProvider>
            <ChatContent />
          </WeatherAmbientProvider>
        </FocusModeProvider>
      </ClientOnly>
    </ErrorBoundary>
  );
};

export default Chat;
