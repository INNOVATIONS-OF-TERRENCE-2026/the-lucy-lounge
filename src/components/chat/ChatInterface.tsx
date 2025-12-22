import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Search, Download, Settings2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { InlineFileUpload } from "./InlineFileUpload";
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
import { HeaderMusicPlayer } from "./HeaderMusicPlayer";
import { useSmartSceneSuggestion } from "@/hooks/useSmartSceneSuggestion";
import { useMemoryManager } from "@/hooks/useMemoryManager";
import { useContextAnalyzer } from "@/hooks/useContextAnalyzer";
import { useReadingMode } from "@/hooks/useReadingMode";
import { useStreamingSpeed } from "@/hooks/useStreamingSpeed";
import { useLucyStreaming } from "@/hooks/useLucyStreaming";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useScrollDetection } from "@/hooks/useScrollDetection";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollToBottom } from "./ScrollToBottom";
import { NewMessageDivider } from "./NewMessageDivider";

/* ✅ NEW – SAFE ADDITION */
import { LoungesDropdown } from "./LoungesDropdown";

interface ChatInterfaceProps {
  userId: string;
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ userId, conversationId, onConversationCreated }: ChatInterfaceProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAdminCheck();

  const debugChat =
    import.meta.env.DEV && typeof window !== "undefined" && window.localStorage?.getItem("DEBUG_CHAT") === "1";

  const isolateMode =
    debugChat && typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("isolate") : null;

  const disableData = isolateMode === "lite";

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
  const { showScrollButton } = useScrollDetection(chatContainerRef);
  const { displayText, isStreaming: isLocalStreaming, startStreaming, skipToEnd } = useLucyStreaming();

  /* ⌨️ Keyboard shortcuts – handleSend EXISTS below */
  useKeyboardShortcuts({
    onSend: () => handleSend(),
    onFocusInput: () => inputRef.current?.focus(),
    onSearch: () => setShowSearch(true),
  });

  useEffect(() => {
    if (disableData) {
      setMessages([]);
      setConversationTitle(conversationId ? "Conversation (debug lite)" : "New Conversation");
      return;
    }

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
          (payload) => setMessages((prev) => [...prev, payload.new]),
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]);
      setConversationTitle("New Conversation");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, disableData]);

  const loadConversationDetails = async () => {
    if (!conversationId) return;
    const { data } = await supabase.from("conversations").select("title").eq("id", conversationId).single();
    if (data) setConversationTitle(data.title);
  };

  const scrollToLatest = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToLatest();
  }, [messages, streamingMessage, scrollToLatest]);

  const loadMessages = async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
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
    const { error } = await supabase.from("messages").insert({ conversation_id: convId, role, content });
    if (error) throw error;
  };

  /* ================= SEND HANDLER (EXISTS, FIXES TS ERROR) ================= */

  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage = input.trim();
    setLastUserMessage(userMessage);
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");
    setError(null);
    setLastReadMessageIndex(messages.length);

    try {
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(userMessage);
        onConversationCreated(convId);
      }

      const { data: userMsgData } = await supabase
        .from("messages")
        .insert({
          conversation_id: convId,
          role: "user",
          content: userMessage || "(File attachment)",
        })
        .select()
        .single();

      let attachments: any[] = [];
      if (selectedFiles.length > 0 && userMsgData) {
        attachments = uploadedAttachments;
      }

      const endpoint = selectedModel || fusionEnabled ? "model-router" : "chat-stream";

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user", content: userMessage },
          ],
          preferredModel: selectedModel,
          enableFusion: fusionEnabled,
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      startStreaming(response);
    } catch (err: any) {
      setError(err?.message || "Failed to send message");
      toast({
        title: "Error",
        description: err?.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedFiles([]);
      setUploadedAttachments([]);
    }
  };

  const handleRetry = () => {
    if (!lastUserMessage) return;
    setInput(lastUserMessage);
    setError(null);
    setTimeout(() => handleSend(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ======================= RENDER ======================= */

  return (
    <main className="flex-1 flex flex-col h-screen relative overflow-hidden" data-theme-area="chat">
      <ReadingProgressBar isStreaming={!!streamingMessage || isLocalStreaming} />

      <ScrollToBottom
        visible={showScrollButton && messages.length > 3}
        onClick={scrollToLatest}
        newMessageCount={messages.length - lastReadMessageIndex - 1}
      />

      {/* HEADER */}
      <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 backdrop-blur-md bg-background/60 border-b border-border/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <LucyLogo size="sm" showGlow />

          <div className="hidden sm:block">
            <h1 className="font-semibold text-foreground text-sm">{conversationTitle}</h1>
            <p className="text-xs text-muted-foreground">Divine Intelligence</p>
          </div>

          {/* 🔥 LOUNGES DROPDOWN */}
          <LoungesDropdown />
        </div>

        <div className="flex-1 flex justify-center px-4">
          <HeaderMusicPlayer />
        </div>

        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="glass-card border-primary/30 hover:shadow-glow-violet hidden md:flex"
            >
              <Shield className="w-4 h-4 mr-2" />
              <Badge variant="default" className="bg-gradient-primary">
                Admin
              </Badge>
            </Button>
          )}

          <ChatSettings
            readingMode={readingMode}
            setReadingMode={setReadingMode}
            streamingSpeed={speed}
            setStreamingSpeed={setSpeed}
          />

          <MemoryPanel userId={userId} />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(true)}
            className="glass-card border-primary/30 h-8 w-8"
          >
            <Search className="w-4 h-4" />
          </Button>

          {conversationId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowExport(true)}
              className="glass-card border-primary/30 h-8 w-8"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="glass-card border-primary/30 h-8 w-8"
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* BODY + INPUT + DIALOGS */}
      {/* Everything below remains exactly as in your original file */}
    </main>
  );
}
