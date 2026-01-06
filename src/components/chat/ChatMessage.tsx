import { useState, useEffect, useRef, useCallback } from "react";
import type { KeyboardEvent } from "react";
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
import { LoungeSwitcher } from "@/components/lounge/LoungeSwitcher";
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

/* 🧠 IMAGE INTELLIGENCE */
import { detectLucyImageIntent } from "@/utils/lucyImageIntent";
import { generateLucyImage } from "@/utils/lucyImageEngine";

interface ChatInterfaceProps {
  userId: string;
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({
  userId,
  conversationId,
  onConversationCreated,
}: ChatInterfaceProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAdminCheck();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
  const { displayText, isStreaming: isLocalStreaming } = useLucyStreaming();

  useKeyboardShortcuts({
    onSend: () => handleSend(),
    onFocusInput: () => inputRef.current?.focus(),
    onSearch: () => setShowSearch(true),
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setConversationTitle("New Conversation");
      return;
    }

    loadConversationDetails();
    loadMessages();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const loadConversationDetails = async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from("conversations")
      .select("title")
      .eq("id", conversationId)
      .single();
    if (data?.title) setConversationTitle(data.title);
  };

  const loadMessages = async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  const scrollToLatest = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToLatest();
  }, [messages, streamingMessage, scrollToLatest]);

  /* ================= CORE SEND ================= */

  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage = input.trim();
    setLastUserMessage(userMessage);
    setInput("");
    setIsLoading(true);
    setError(null);
    setStreamingMessage("");
    setLastReadMessageIndex(messages.length);

    try {
      /* 🧠 IMAGE INTENT CHECK */
      const imageIntent = detectLucyImageIntent(userMessage);

      if (imageIntent.isImage) {
        const image = await generateLucyImage(imageIntent.prompt);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "image",
            imageUrl: image.imageUrl,
            created_at: new Date().toISOString(),
          },
        ]);

        setIsLoading(false);
        return;
      }

      /* 🧠 NORMAL CHAT FLOW */
      let convId = conversationId;
      if (!convId) {
        const { data } = await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            title: userMessage.slice(0, 50),
          })
          .select()
          .single();

        if (!data) throw new Error("Failed to create conversation");
        convId = data.id;
        onConversationCreated(convId);
      }

      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: userMessage,
      });

      const endpoint = selectedModel || fusionEnabled ? "model-router" : "chat-stream";

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMessage }],
            preferredModel: selectedModel,
            enableFusion: fusionEnabled,
          }),
        }
      );

      if (!response.ok) throw new Error("AI response failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          full += chunk;
          setStreamingMessage(full);
        }
      }

      if (full) {
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: full,
        });

        setStreamingMessage("");
        loadMessages();

        analyzeContext([
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: userMessage },
          { role: "assistant", content: full },
        ]);

        if (full.length > 100) {
          storeMemory(full.slice(0, 200), "conversation", 0.7);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send message");
      toast({
        title: "Error",
        description: err.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedFiles([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ================= RENDER ================= */

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <ReadingProgressBar isStreaming={!!streamingMessage || isLocalStreaming} />

      <ScrollToBottom
        visible={showScrollButton && messages.length > 3}
        onClick={scrollToLatest}
        newMessageCount={messages.length - lastReadMessageIndex - 1}
      />

      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-4 border-b border-border/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <LucyLogo size="sm" showGlow />
          <div>
            <h1 className="text-sm font-semibold">{conversationTitle}</h1>
            <p className="text-xs text-muted-foreground">Divine Intelligence</p>
          </div>
        </div>

        <HeaderMusicPlayer />

        <div className="flex items-center gap-1">
          <LoungeSwitcher />
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <Shield className="w-4 h-4 mr-1" />
              <Badge>Admin</Badge>
            </Button>
          )}
          <ChatSettings
            readingMode={readingMode}
            setReadingMode={setReadingMode}
            streamingSpeed={speed}
            setStreamingSpeed={setSpeed}
          />
          <MemoryPanel userId={userId} />
          <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
            <Search className="w-4 h-4" />
          </Button>
          {conversationId && (
            <Button variant="ghost" size="icon" onClick={() => setShowExport(true)}>
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setShowModelSelector((s) => !s)}>
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* CHAT */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-3">
        <div className={`max-w-5xl mx-auto ${getSpacingClass()}`}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}

          {streamingMessage && (
            <ChatMessage
              message={{
                role: "assistant",
                content: streamingMessage,
                created_at: new Date().toISOString(),
              }}
              isStreaming
            />
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Lucy is thinking…
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-border/30">
        <div className="max-w-5xl mx-auto flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Lucy… or ask her to create an image"
            className="resize-none min-h-[52px]"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="h-[52px] w-[52px]"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </div>

      <SearchModal open={showSearch} onOpenChange={setShowSearch} />
      {conversationId && (
        <ExportDialog
          open={showExport}
          onOpenChange={setShowExport}
          conversationId={conversationId}
          conversationTitle={conversationTitle}
        />
      )}
    </main>
  );
}
