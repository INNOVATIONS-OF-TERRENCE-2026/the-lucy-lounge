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
    <>
      <CosmicBackground />

      <SidebarProvider>
        <div className="flex flex-row w-screen h-screen max-h-screen overflow-hidden bg-[var(--bg-1)] text-[var(--text)] transition-all duration-500">
          {/* Sidebar */}
          <ChatSidebar
            userId={user?.id}
            currentConversationId={currentConversationId}
            onConversationSelect={setCurrentConversationId}
          />

          {/* Chat Interface */}
          <div className="relative flex flex-col flex-1 h-full w-full overflow-hidden">
            {/* ⭐ Floating Theme Picker */}
            <div className="absolute top-3 right-4 z-50">
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
    </>
  );
};

export default Chat;
