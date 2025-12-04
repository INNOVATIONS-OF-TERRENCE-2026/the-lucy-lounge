// LUCY AI GODDESS CHAT INTERFACE
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CompactFileUpload } from "./CompactFileUpload";
import { ExportDialog } from "./ExportDialog";
import { SearchModal } from "./SearchModal";
import { LucyLogo } from "@/components/branding/LucyLogo";
import { ChatSettings } from "./ChatSettings";
import { ReadingProgressBar } from "./ReadingProgressBar";
import { useReadingMode } from "@/hooks/useReadingMode";
import { useStreamingSpeed } from "@/hooks/useStreamingSpeed";

interface ChatInterfaceProps {
  userId: string;
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ userId, conversationId, onConversationCreated }: ChatInterfaceProps) {
  const { toast } = useToast();
  const { readingMode, setReadingMode, getSpacingClass } = useReadingMode();
  const { speed: streamingSpeed, setSpeed: setStreamingSpeed } = useStreamingSpeed();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
        // Scroll to bottom after loading
        setTimeout(() => {
          if (chatRef.current) {
            const scrollArea = chatRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollArea) {
              scrollArea.scrollTop = scrollArea.scrollHeight;
            }
          }
        }, 100);
      }
    };

    loadMessages();

    // Load conversation title
    const loadConversation = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("title")
        .eq("id", conversationId)
        .single();
      if (data) setConversationTitle(data.title);
    };
    loadConversation();
  }, [conversationId]);

  // ---- REALTIME MESSAGE LOADER ----
  useEffect(() => {
    if (!conversationId) return;

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

    // cleanup must NOT be async
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // ---- SEND MESSAGE ----
  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    let convId = conversationId;

    if (!convId) {
      const { data } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          title: input.slice(0, 50),
        })
        .select()
        .single();

      convId = data.id;
      onConversationCreated(convId);
    }

    await supabase.from("messages").insert({
      conversation_id: convId,
      role: "user",
      content: input,
    });

    setInput("");
    setIsLoading(false);
  };

  return (
    <main className="chat-interface-main">
      <ReadingProgressBar isStreaming={!!streamingMessage} />

      {/* TRANSPARENT HEADER - No background, no border */}
      <header className="chat-header-transparent">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div className="chat-title-badge">
            <span className="chat-title">Lucy</span>
            <span className="chat-subtitle">Supreme Code Goddess</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="matrix-status-badge">
            <span className="status-dot" />
            <span>MATRIX ACTIVE</span>
          </div>
        <ChatSettings
            readingMode={readingMode}
            setReadingMode={setReadingMode}
            streamingSpeed={streamingSpeed}
            setStreamingSpeed={setStreamingSpeed}
          />
        </div>
      </header>

      {/* MESSAGES */}
      <ScrollArea
        ref={chatRef}
        className="chat-messages-area"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <LucyLogo size="xl" showGlow />
            <div className="goddess-welcome-card">
              <h2 className="goddess-welcome-title">Welcome to Lucy AI</h2>
              <p className="goddess-welcome-text">Divine intelligence awaits. Ask me anything!</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </ScrollArea>

      {/* COMPACT INPUT ROW - ChatGPT style */}
      <div className="chat-input-container">
        <div className="chat-input-row">
          <CompactFileUpload
            selectedFiles={selectedFiles}
            onFilesSelected={(files) => setSelectedFiles([...selectedFiles, ...files])}
            onRemoveFile={(i) => setSelectedFiles(selectedFiles.filter((_, x) => i !== x))}
          />

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
            placeholder="Ask Lucy…"
            className="chat-input-field"
          />

          <Button 
            disabled={!input.trim() || isLoading} 
            onClick={handleSend} 
            className="chat-send-button"
          >
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      <SearchModal
        open={showSearch}
        onOpenChange={setShowSearch}
        onSelectConversation={(id) => {
          onConversationCreated(id);
          setShowSearch(false);
        }}
      />

      {/* EXPORT */}
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
