import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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

interface ChatInterfaceProps {
  userId: string;
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ userId, conversationId, onConversationCreated }: ChatInterfaceProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
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
      .then(({ data }) => {
        if (data?.title) setConversationTitle(data.title);
      });

    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data);
      });
  }, [conversationId]);

  const scrollToLatest = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToLatest();
  }, [messages, displayText, scrollToLatest]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);
    setLastReadMessageIndex(messages.length);

    try {
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

        convId = data.id;
        onConversationCreated(convId);
      }

      const createdAt = new Date().toISOString();

      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: userMessage,
        created_at: createdAt,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userMessage,
          created_at: createdAt,
        },
      ]);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      startStreaming(await response.text());
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      toast({
        title: "Error",
        description: err.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <ReadingProgressBar isStreaming={isStreaming} />

      <ScrollToBottom
        visible={showScrollButton && messages.length > 3}
        onClick={scrollToLatest}
        newMessageCount={messages.length - lastReadMessageIndex - 1}
      />

      {/* HEADER */}
      <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 backdrop-blur-md bg-background/60 border-b">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <LucyLogo size="sm" showGlow />

          <div className="hidden sm:block">
            <h1 className="font-semibold text-sm">{conversationTitle}</h1>
            <p className="text-xs text-muted-foreground">Divine Intelligence</p>
          </div>

          {/* ✅ SAFE LOUNGE DROPDOWN (NON-INTRUSIVE) */}
          <div className="flex-shrink-0">
            <LoungesDropdown />
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex justify-center px-4">
          <HeaderMusicPlayer />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <Shield className="w-4 h-4 mr-2" />
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

          {conversationId && (
            <Button variant="ghost" size="icon" onClick={() => setShowExport(true)}>
              <Download className="w-4 h-4" />
            </Button>
          )}

          <Button variant="ghost" size="icon">
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* BODY */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-2">
        <div className="max-w-5xl mx-auto space-y-4">
          {conversationId && <ContextIndicator conversationId={conversationId} />}

          {messages.map((message, index) => (
            <div key={`${index}-${message.created_at}`}>
              {index === lastReadMessageIndex + 1 && <NewMessageDivider />}
              <ChatMessage message={message} />
            </div>
          ))}

          {displayText && (
            <ChatMessage
              message={{
                role: "assistant",
                content: displayText,
                created_at: new Date().toISOString(),
              }}
              isStreaming
            />
          )}

          {error && <div className="text-destructive text-sm">{error}</div>}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="p-4 border-t">
        <div className="max-w-5xl mx-auto flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Lucy..."
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="resize-none"
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <SearchModal
        open={showSearch}
        onOpenChange={setShowSearch}
        onSelectConversation={(id: string) => {
          onConversationCreated(id);
          setShowSearch(false);
        }}
      />

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
