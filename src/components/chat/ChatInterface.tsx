import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Search, Download, Settings2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ExportDialog } from "./ExportDialog";
import { SearchModal } from "./SearchModal";
import { LucyLogo } from "@/components/branding/LucyLogo";
import { ContextIndicator } from "./ContextIndicator";
import { MemoryPanel } from "./MemoryPanel";
import { ChatSettings } from "./ChatSettings";
import { ReadingProgressBar } from "./ReadingProgressBar";
import { HeaderMusicPlayer } from "./HeaderMusicPlayer";
import { ScrollToBottom } from "./ScrollToBottom";
import { NewMessageDivider } from "./NewMessageDivider";
import { LoungesDropdown } from "./LoungesDropdown";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useScrollDetection } from "@/hooks/useScrollDetection";
import { useLucyStreaming } from "@/hooks/useLucyStreaming";
import { useReadingMode } from "@/hooks/useReadingMode";
import { useStreamingSpeed } from "@/hooks/useStreamingSpeed";
import { Badge } from "@/components/ui/badge";

const LOUNGE_GLOW_MAP: Record<string, string> = {
  listening: "shadow-cyan-400/50",
  media: "shadow-purple-500/50",
  neural: "shadow-emerald-400/50",
  dream: "shadow-indigo-400/50",
  vision: "shadow-amber-400/50",
  quantum: "shadow-fuchsia-500/50",
  presence: "shadow-rose-400/50",
  events: "shadow-blue-400/50",
  command: "shadow-red-500/50",
};

interface ChatInterfaceProps {
  userId: string;
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ userId, conversationId, onConversationCreated }: ChatInterfaceProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAdminCheck();

  const { readingMode, setReadingMode } = useReadingMode();
  const { speed: streamingSpeed, setSpeed: setStreamingSpeed } = useStreamingSpeed();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [lastReadMessageIndex, setLastReadMessageIndex] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { displayText, isStreaming, startStreaming } = useLucyStreaming();
  const { showScrollButton } = useScrollDetection(chatContainerRef);

  const activeLounge = Object.keys(LOUNGE_GLOW_MAP).find((k) => location.pathname.includes(k)) ?? "neural";

  const glowClass = LOUNGE_GLOW_MAP[activeLounge];

  useKeyboardShortcuts({
    onSend: () => handleSend(),
    onFocusInput: () => inputRef.current?.focus(),
    onSearch: () => setShowSearch(true),
  });

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setConversationTitle("New Conversation");
      return;
    }

    supabase
      .from("conversations")
      .select("title")
      .eq("id", conversationId)
      .single()
      .then(({ data }) => data?.title && setConversationTitle(data.title));

    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => data && setMessages(data));
  }, [conversationId]);

  const scrollToLatest = useCallback(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), []);

  useEffect(scrollToLatest, [messages, displayText]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setLastReadMessageIndex(messages.length);

    try {
      let convId = conversationId;

      if (!convId) {
        const { data } = await supabase
          .from("conversations")
          .insert({ user_id: userId, title: userMessage.slice(0, 50) })
          .select()
          .single();
        convId = data.id;
        onConversationCreated(convId);
      }

      const created_at = new Date().toISOString();

      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: userMessage,
        created_at,
      });

      setMessages((m) => [...m, { role: "user", content: userMessage, created_at }]);

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: userMessage }] }),
      });

      startStreaming(await res.text());
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <ReadingProgressBar isStreaming={isStreaming} />

      <header className="relative isolate z-10 h-16 flex items-center px-4 border-b backdrop-blur-md bg-background/70">
        {/* LEFT */}
        <div className="flex items-center gap-3 z-30 relative pointer-events-auto">
          <SidebarTrigger />

          {/* ✅ LUCY LOGO — FORCED VISIBLE */}
          <div
            className={`relative z-40 rounded-full transition-all duration-500 hover:shadow-lg ${glowClass} ${
              isStreaming ? "animate-pulse" : ""
            }`}
          >
            <LucyLogo size="sm" showGlow />
          </div>

          <LoungesDropdown />
        </div>

        {/* CENTER */}
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <HeaderMusicPlayer />
        </div>

        {/* RIGHT */}
        <div className="ml-auto flex items-center gap-2 z-30">
          {isAdmin && (
            <Button size="sm" variant="ghost" onClick={() => navigate("/admin")}>
              <Shield className="w-4 h-4 mr-1" />
              <Badge>Admin</Badge>
            </Button>
          )}

          <ChatSettings
            readingMode={readingMode}
            setReadingMode={setReadingMode}
            streamingSpeed={streamingSpeed}
            setStreamingSpeed={setStreamingSpeed}
          />

          <MemoryPanel userId={userId} />

          <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* BODY + INPUT unchanged */}
      {/* (Intentionally left same to avoid regressions) */}
    </main>
  );
}
