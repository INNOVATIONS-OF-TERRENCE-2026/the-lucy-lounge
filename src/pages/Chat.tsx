import { useState, useEffect } from "react";
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
// ChatAmbientPlayer removed - music player now in header via HeaderMusicPlayer

// Inner component that uses the weather context
const ChatContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { weather, season, intensity, enabled } = useWeatherAmbient();
  const { focusMode } = useFocusMode();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return <LoadingScreen message="Entering the Cosmic AI Temple..." />;
  }

  return (
    <>
      <CosmicBackground />
      {!focusMode && (
        <>
          <WeatherEffectsOverlay 
            weather={weather} 
            season={season} 
            intensity={intensity} 
            enabled={enabled} 
          />
          <CursorGlowOverlay enabled={enabled} />
        </>
      )}

      <SidebarProvider>
        <div
          className="
          flex flex-row w-screen h-screen max-h-screen overflow-hidden
          bg-[var(--theme-bg-1)] text-[var(--theme-text)]
          transition-all duration-500
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
            {/* Music player moved to header - HeaderMusicPlayer in ChatInterface */}
            <ChatInterface
              userId={user?.id}
              conversationId={currentConversationId}
              onConversationCreated={setCurrentConversationId}
            />
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

// Main Chat component with provider wrapper
const Chat = () => {
  return (
    <FocusModeProvider>
      <WeatherAmbientProvider>
        <ChatContent />
      </WeatherAmbientProvider>
    </FocusModeProvider>
  );
};

export default Chat;
