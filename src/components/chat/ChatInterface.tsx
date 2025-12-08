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
import { useLucyStreaming } from "@/hooks/useLucyStreaming";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");

  // Hooks for settings
  const { readingMode, setReadingMode, getSpacingClass } = useReadingMode();
  const { speed: streamingSpeed, setSpeed: setStreamingSpeed, getDelay } = useStreamingSpeed();
  const { displayText, isStreaming, startStreaming } = useLucyStreaming();

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ---- LOAD MESSAGES WHEN CONVERSATION CHANGES ----
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setConversationTitle("New Conversation");
      return;
    }

    const loadMessages = async () => {
      // Load conversation title
      const { data: convData } = await supabase
        .from("conversations")
        .select("title")
        .eq("id", conversationId)
        .single();

      if (convData) {
        setConversationTitle(convData.title);
      }

      // Load messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
      }
    };

    loadMessages();
  }, [conversationId]);

  // ---- AUTO-SCROLL ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayText]);

  // ---- REALTIME SUBSCRIPTION ----
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
          // Only add if not already in messages
          setMessages((prev) => {
            const exists = prev.some(m => m.id === (payload.new as any).id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // ---- SEND MESSAGE WITH AI RESPONSE ----
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    setInput("");
    setIsLoading(true);

    let convId = conversationId;

    try {
      // Create conversation if needed
      if (!convId) {
        const { data } = await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            title: userContent.slice(0, 50),
          })
          .select()
          .single();

        if (data) {
          convId = data.id;
          onConversationCreated(convId);
        }
      }

      // Save user message
      const userMsgId = crypto.randomUUID();
      const userMsg = {
        id: userMsgId,
        conversation_id: convId,
        role: "user",
        content: userContent,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMsg]);

      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: userContent,
      });

      // Call Lucy router for AI response
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lucy-router`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            userId,
            messages: [...messages, userMsg].map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      const data = await res.json();

      // Extract response
      const reply =
        data?.plan?.finalAnswer ||
        data?.response ||
        data?.reply ||
        "I'm here with you 💚";

      // Add AI message
      const aiMsg = {
        id: crypto.randomUUID(),
        conversation_id: convId,
        role: "assistant",
        content: reply,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);

      // Start streaming effect if not instant
      if (streamingSpeed !== "instant") {
        startStreaming(reply, getDelay());
      }

      // Save to database
      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "assistant",
        content: reply,
      });

      // Trigger matrix effect
      window.dispatchEvent(new Event("lucy-response"));

    } catch (err) {
      console.error("Lucy chat error:", err);
      toast({
        title: "Connection issue",
        description: "Unable to reach Lucy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="chat-interface-main">
      <ReadingProgressBar isStreaming={isStreaming || isLoading} />

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
        <div className={getSpacingClass()}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <LucyLogo size="xl" showGlow />
              <div className="goddess-welcome-card">
                <h2 className="goddess-welcome-title">Welcome to Lucy AI</h2>
                <p className="goddess-welcome-text">Divine intelligence awaits. Ask me anything!</p>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <ChatMessage 
              key={msg.id} 
              message={{
                ...msg,
                // Show streaming text for last assistant message
                content: isStreaming && index === messages.length - 1 && msg.role === "assistant"
                  ? displayText
                  : msg.content,
              }} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
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
