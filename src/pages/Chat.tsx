import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/branding/LoadingScreen";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { ThemePicker } from "@/components/ThemePicker";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

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
    <ThemeProvider>
      <CosmicBackground />

      <SidebarProvider>
        <div className="flex flex-row w-screen h-screen max-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
          <ChatSidebar
            userId={user?.id}
            currentConversationId={currentConversationId}
            onConversationSelect={setCurrentConversationId}
          />

          <div className="flex flex-col flex-1 h-full w-full overflow-visible bg-white dark:bg-gray-800 transition-colors duration-500">
            <div className="absolute top-3 right-4 z-[999]">
              <ThemePicker />
            </div>

            <ChatInterface
              userId={user?.id}
              conversationId={currentConversationId}
              onConversationCreated={setCurrentConversationId}
            />
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Chat;
