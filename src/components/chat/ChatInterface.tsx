import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Search, Download, Settings2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileUploadZone } from "./FileUploadZone";
import { ExportDialog } from "./ExportDialog";
import { SearchModal } from "./SearchModal";
import { ModelSelector } from "./ModelSelector";
import { LucyLogo } from "@/components/branding/LucyLogo";
import { ToolResultDisplay } from "./ToolResultDisplay";
import { ProactiveSuggestions } from "./ProactiveSuggestions";
import { ContextIndicator } from "./ContextIndicator";
import { MemoryPanel } from "./MemoryPanel";
import { SmartSceneSuggestion } from "./SmartSceneSuggestion";
import { ChatSettings } from "./ChatSettings";
import { ReadingProgressBar } from "./ReadingProgressBar";
import { TimestampDivider } from "./TimestampDivider";
import { useSmartSceneSuggestion } from "@/hooks/useSmartSceneSuggestion";
import { useMemoryManager } from "@/hooks/useMemoryManager";
import { useContextAnalyzer } from "@/hooks/useContextAnalyzer";
import { useReadingMode } from "@/hooks/useReadingMode";
import { useStreamingSpeed } from "@/hooks/useStreamingSpeed";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useScrollDetection } from "@/hooks/useScrollDetection";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollToBottom } from "./ScrollToBottom";
import { NewMessageDivider } from "./NewMessageDivider";

interface ChatInterfaceProps {
  userId: string;
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ userId, conversationId, onConversationCreated }: ChatInterfaceProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAdminCheck();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([]);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [fusionEnabled, setFusionEnabled] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [toolResults, setToolResults] = useState<any>(null);
  const [lastReadMessageIndex, setLastReadMessageIndex] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { suggestedScene } = useSmartSceneSuggestion(conversationId);
  const { storeMemory } = useMemoryManager(userId);
  const { analyzeContext } = useContextAnalyzer(conversationId);
  const { readingMode, setReadingMode, getSpacingClass } = useReadingMode();
  const { speed, setSpeed } = useStreamingSpeed();
  const { showScrollButton, scrollToBottom } = useScrollDetection(chatContainerRef);

  useKeyboardShortcuts({
    onSend: () => handleSend(),
    onFocusInput: () => inputRef.current?.focus(),
    onSearch: () => setShowSearch(true),
  });

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      loadConversationDetails();

      const channel = supabase
        .channel(`messages-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]);
      setConversationTitle("New Conversation");
    }
  }, [conversationId]);

  const loadConversationDetails = async () => {
    if (!conversationId) return;
    const { data } = await supabase.from("conversations").select("title").eq("id", conversationId).single();
    if (data) setConversationTitle(data.title);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage]);

  const loadMessages = async () => {
    if (!conversationId) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const createConversation = async (firstMessage: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : ""),
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    const { error } = await supabase.from("messages").insert({
      conversation_id: convId,
      role,
      content,
    });

    if (error) throw error;
  };

  // shortened here because unchanged logic — now the UI updates:

  return (
    <main
      className="
        flex-1 flex flex-col h-screen relative
        bg-[var(--bg-1)] text-[var(--text)]
        transition-all duration-500
      "
    >
      <ReadingProgressBar isStreaming={!!streamingMessage} />

      <ScrollToBottom
        visible={showScrollButton && messages.length > 3}
        onClick={() => scrollToBottom()}
        newMessageCount={messages.length - lastReadMessageIndex - 1}
      />

      <header className="h-16 md:h-20 border-b border-primary/20 flex items-center justify-between px-4 md:px-6 backdrop-blur-xl glass shadow-glow-violet flex-shrink-0">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <LucyLogo size="sm" showGlow />
          <div>
            <h1 className="font-semibold bg-gradient-button bg-clip-text text-transparent">{conversationTitle}</h1>
            <p className="text-xs text-muted-foreground">Divine Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChatSettings
            readingMode={readingMode}
            setReadingMode={setReadingMode}
            streamingSpeed={speed}
            setStreamingSpeed={setSpeed}
          />
        </div>
      </header>

      <ScrollArea
        ref={chatContainerRef}
        className="
          flex-1 scroll-smooth overflow-y-auto
          bg-[var(--bg-2)]
          px-4 md:px-6 py-4 md:py-6
          transition-all duration-500
        "
      >
        {/* all your existing message rendering stays EXACTLY the same */}
      </ScrollArea>

      {/* input stays unchanged */}
    </main>
  );
}
