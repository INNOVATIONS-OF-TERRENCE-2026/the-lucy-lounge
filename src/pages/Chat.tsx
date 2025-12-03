import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { LoadingScreen } from "@/components/branding/LoadingScreen";
import { LucyGoddessBackground } from "@/components/lucy/LucyGoddessBackground";

const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  useEffect(() => {
    // Add lucy-active class to body for scoped styling
    document.body.classList.add('lucy-active');
    
    return () => {
      document.body.classList.remove('lucy-active');
    };
  }, []);

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
    return <LoadingScreen message="Awakening the Goddess..." />;
  }

  return (
    <div className="lucy-environment">
      {/* Lucy Goddess Background System */}
      <LucyGoddessBackground />

      <SidebarProvider>
        <div className="chat-container-wrapper">
          {/* SIDEBAR */}
          <ChatSidebar
            userId={user?.id}
            currentConversationId={currentConversationId}
            onConversationSelect={setCurrentConversationId}
          />

          {/* MAIN CHAT AREA */}
          <main className="chat-main-area">
            <ChatInterface
              userId={user?.id}
              conversationId={currentConversationId}
              onConversationCreated={setCurrentConversationId}
            />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Chat;
