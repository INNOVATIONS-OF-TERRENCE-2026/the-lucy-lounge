import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { LoadingScreen } from "@/components/branding/LoadingScreen";

export default function Chat() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingScreen message="Loading Chat..." />;

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Please sign in to chat.</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full max-w-full overflow-x-hidden">
        <ChatSidebar userId={user.id} currentConversationId={conversationId} onConversationSelect={setConversationId} />
        <div className="flex-1 min-w-0">
          <ChatInterface userId={user.id} conversationId={conversationId} onConversationCreated={setConversationId} />
        </div>
      </div>
    </SidebarProvider>
  );
}
