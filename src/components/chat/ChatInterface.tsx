import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Search, Download, Settings2 } from "lucide-react";
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
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useScrollDetection } from "@/hooks/useScrollDetection";
import { ScrollToBottom } from "./ScrollToBottom";
import { NewMessageDivider } from "./NewMessageDivider";

interface ChatInterfaceProps {
  userId: string;
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ userId, conversationId, onConversationCreated }: ChatInterfaceProps) {
  const { toast } = useToast();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [lastReadMessageIndex, setLastReadMessageIndex] = useState(-1);
  const [showExport, setShowExport] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { readingMode, setReadingMode, getSpacingClass } = useReadingMode();
  const { speed, setSpeed } = useStreamingSpeed();
  const { showScrollButton, scrollToBottom } = useScrollDetection(chatContainerRef);

  useKeyboardShortcuts({
    onSend: () => handleSend(),
    onFocusInput: () => inputRef.current?.focus(),
    onSearch: () => setShowSearch(true),
  });

  useEffect(() => {
    if (!conversationId) return;

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

    return () => supabase.removeChannel(channel);
  }, [conversationId]);

  const loadConversationDetails = async () => {
    const { data } = await supabase.from("conversations").select("title").eq("id", conversationId).single();
    if (data) setConversationTitle(data.title);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  // ---- FIXED POSITION ----
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setLastUserMessage(userMessage);
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");
    setLastReadMessageIndex(messages.length);

    const convId = conversationId || (await createConversation(userMessage));
    onConversationCreated(convId);

    await saveMessage(convId, "user", userMessage);
    setIsLoading(false);
  };

  const createConversation = async (msg: string) => {
    const { data } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title: msg.slice(0, 50),
      })
      .select()
      .single();

    return data.id;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    await supabase.from("messages").insert({
      conversation_id: convId,
      role,
      content,
    });
  };

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

      {/* HEADER */}
      <header className="h-16 md:h-20 border-b border-primary/20 flex items-center justify-between px-4 md:px-6 backdrop-blur-xl glass">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <LucyLogo size="sm" showGlow />
          <div>
            <h1 className="font-semibold bg-gradient-button bg-clip-text text-transparent">{conversationTitle}</h1>
            <p className="text-xs text-muted-foreground">Divine Intelligence</p>
          </div>
        </div>

        <ChatSettings
          readingMode={readingMode}
          setReadingMode={setReadingMode}
          streamingSpeed={speed}
          setStreamingSpeed={setSpeed}
        />
      </header>

      {/* MAIN CHAT AREA */}
      <ScrollArea
        ref={chatContainerRef}
        className="
          flex-1 scroll-smooth overflow-y-auto
          bg-[var(--bg-2)]
          px-4 md:px-6 py-4 md:py-6
        "
      >
        {/* your message rendering continues unchanged */}
      </ScrollArea>

      {/* INPUT AREA */}
      <div className="border-t border-primary/20 p-4 md:p-6 glass">
        <div className="max-w-5xl mx-auto space-y-3">
          <FileUploadZone />
          <div className="relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Lucy..."
              className="chat-input min-h-[70px]"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="absolute bottom-3 right-3">
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </div>
        </div>
      </div>

      <SearchModal open={showSearch} onOpenChange={setShowSearch} />
      <ExportDialog open={showExport} onOpenChange={setShowExport} />
    </main>
  );
}
