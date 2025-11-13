import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { BackgroundVideo } from "@/components/background/BackgroundVideo";
import { VideoControls } from "@/components/background/VideoControls";

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Background video state
  const [videoTheme, setVideoTheme] = useState('nature');
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // Load video preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('lucy-bg-theme');
    const savedMuted = localStorage.getItem('lucy-bg-muted');
    if (savedTheme) setVideoTheme(savedTheme);
    if (savedMuted) setIsVideoMuted(savedMuted === 'true');
  }, []);

  const handleThemeChange = (theme: string) => {
    setVideoTheme(theme);
    localStorage.setItem('lucy-bg-theme', theme);
  };

  const toggleVideoPause = () => {
    setIsVideoPaused(!isVideoPaused);
  };

  const toggleVideoMute = () => {
    const newMuted = !isVideoMuted;
    setIsVideoMuted(newMuted);
    localStorage.setItem('lucy-bg-muted', String(newMuted));
  };

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full animate-neural-pulse mx-auto" />
          <p className="text-muted-foreground">Loading Lucy AI...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackgroundVideo 
        theme={videoTheme}
        isPaused={isVideoPaused}
        isMuted={isVideoMuted}
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full relative">
          <ChatSidebar 
            userId={user?.id}
            currentConversationId={currentConversationId}
            onConversationSelect={setCurrentConversationId}
            videoControls={
              <VideoControls
                isPaused={isVideoPaused}
                isMuted={isVideoMuted}
                currentTheme={videoTheme}
                onTogglePause={toggleVideoPause}
                onToggleMute={toggleVideoMute}
                onChangeTheme={handleThemeChange}
              />
            }
          />
          <ChatInterface 
            userId={user?.id}
            conversationId={currentConversationId}
            onConversationCreated={setCurrentConversationId}
          />
        </div>
      </SidebarProvider>
    </>
  );
};

export default Chat;
