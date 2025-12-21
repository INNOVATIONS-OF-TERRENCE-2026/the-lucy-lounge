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
import { isSafeMode } from "@/lib/features";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

/* Loading skeleton */
const ChatLoadingSkeleton = () => (
  <div className="flex flex-row w-full h-screen max-h-screen overflow-hidden bg-background">
    <div className="w-64 h-full bg-muted/20 animate-pulse hidden md:block" />
    <div className="flex-1 flex flex-col max-w-full min-w-0">
      <div className="h-16 bg-muted/10 animate-pulse" />
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted/10 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-20 bg-muted/10 animate-pulse" />
    </div>
  </div>
);

/* Logged-out view */
const LoggedOutView = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h2 className="text-2xl font-semibold">Welcome to Lucy AI</h2>
        <p className="text-muted-foreground">Sign in to start chatting with your intelligent AI companion.</p>
        <Button onClick={() => navigate("/auth")} size="lg" className="gap-2">
          <LogIn className="w-4 h-4" />
          Sign In to Chat
        </Button>
      </div>
    </div>
  );
};

/* Core chat content */
const ChatContent = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  /* Weather context (safe guarded) */
  const { weather, season, intensity, enabled } = useWeatherAmbient();

  const { focusMode } = useFocusMode();

  const safeMode = isSafeMode();

  /**
   * ✅ FIXED LOGIC
   * Visuals show when:
   * - user enabled weather
   * - NOT focus mode
   * - NOT safe mode
   */
  const showEffects = enabled && !focusMode && !safeMode;

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(data.session?.user ?? null);
      } catch (e) {
        console.error("[CHAT_AUTH]", e);
      } finally {
        if (mounted) {
          setAuthChecked(true);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthChecked(true);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading || !authChecked) {
    return <LoadingScreen message="Entering the Cosmic AI Temple..." />;
  }

  if (!user) {
    return <LoggedOutView />;
  }

  return (
    <>
      {!safeMode && <CosmicBackground />}

      {showEffects && (
        <>
          <WeatherEffectsOverlay weather={weather} season={season} intensity={intensity} enabled={enabled} />
          <CursorGlowOverlay enabled={enabled} />
        </>
      )}

      <SidebarProvider>
        <div className="flex w-full h-screen max-h-screen overflow-hidden max-w-full min-w-0 bg-[var(--theme-bg-1)]">
          <ChatSidebar
            userId={user.id}
            currentConversationId={currentConversationId}
            onConversationSelect={setCurrentConversationId}
          />

          <div className="relative flex flex-col flex-1 h-full w-full bg-[var(--theme-bg-2)]">
            <ChatInterface
              userId={user.id}
              conversationId={currentConversationId}
              onConversationCreated={setCurrentConversationId}
            />
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

/* Export */
const Chat = () => (
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

export default Chat;
