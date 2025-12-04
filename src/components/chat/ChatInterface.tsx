// FINAL FIXED VERSION - Full message rendering + conversation history
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileUploadZone } from "./FileUploadZone";
import { ExportDialog } from "./ExportDialog";
import { SearchModal } from "./SearchModal";
import { LucyLogo } from "@/components/branding/LucyLogo";
import { ChatSettings } from "./ChatSettings";
import { ReadingProgressBar } from "./ReadingProgressBar";
import { ScrollToBottom } from "./ScrollToBottom";

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
  const [showSearch, setShowSearch] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [showUpload, setShowUpload] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

      if (convData?.title) {
        setConversationTitle(convData.title);
      }

      // Load all messages for this conversation
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      setMessages(messagesData || []);
    };

    loadMessages();
  }, [conversationId]);

  // ---- REALTIME MESSAGE SUBSCRIPTION ----
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
          const newMessage = payload.new;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          // Trigger matrix gold flash on Lucy response
          if (newMessage.role === "assistant") {
            window.dispatchEvent(new Event("lucy-response"));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // ---- AUTO-SCROLL TO BOTTOM ----
  useEffect(() => {
    if (chatRef.current) {
      const scrollContainer = chatRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // ---- SEND MESSAGE ----
  const handleSend = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;
    setIsLoading(true);

    let convId = conversationId;

    try {
      if (!convId) {
        const { data } = await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            title: input.slice(0, 50) || "New Chat",
          })
          .select()
          .single();

        convId = data?.id;
        if (convId) {
          onConversationCreated(convId);
        }
      }

      if (!convId) {
        toast({ title: "Error", description: "Could not create conversation", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // Insert user message
      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: input,
      });

      const userMessage = input;
      setInput("");
      setSelectedFiles([]);

      // Call Lucy router for AI response
      const { data: responseData, error: responseError } = await supabase.functions.invoke("lucy-router", {
        body: {
          message: userMessage,
          conversationId: convId,
          userId,
        },
      });

      if (responseError) {
        console.error("Lucy router error:", responseError);
        toast({ title: "Error", description: "Lucy is momentarily unavailable", variant: "destructive" });
      } else if (responseData?.response) {
        // Insert Lucy's response
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: responseData.response,
        });

        // Trigger matrix gold flash
        window.dispatchEvent(new Event("lucy-response"));
      }
    } catch (err) {
      console.error("Send error:", err);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    }

    setIsLoading(false);
  };

  return (
    <main className="chat-container flex-1 flex flex-col h-screen bg-[var(--bg-1)] text-[var(--text)] transition-all duration-500">
      <ReadingProgressBar isStreaming={!!streamingMessage} />

      {/* HEADER - Lucy Goddess Style */}
      <header className="chat-header h-16 flex items-center justify-between border-b border-primary/20 px-4 bg-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <LucyLogo size="sm" />
          <div className="flex flex-col">
            <h1 className="chat-title font-semibold bg-gradient-button bg-clip-text text-transparent">
              Lucy • Supreme Code Goddess
            </h1>
            <span className="chat-badge text-xs text-primary/80">MATRIX ACTIVE</span>
          </div>
        </div>

        <ChatSettings
          readingMode={"comfortable"}
          setReadingMode={() => {}}
          streamingSpeed={"medium"}
          setStreamingSpeed={() => {}}
        />
      </header>

      {/* MESSAGES */}
      <ScrollArea
        ref={chatRef}
        className="chat-messages flex-1 px-4 py-6 bg-[var(--bg-2)]/80 transition-all duration-500 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <LucyLogo size="xl" showGlow />
            <div className="glass-card-enhanced p-10 rounded-3xl border border-primary/40 shadow-glow-divine bg-[var(--bg-1)]/80">
              <h2 className="text-4xl font-bold mb-4 text-[var(--text)]">Welcome to Lucy AI</h2>
              <p className="text-[var(--text)] text-lg">Divine intelligence awaits. Ask me anything!</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>

        {isLoading && (
          <div className="flex gap-4 justify-start animate-fade-in mt-4">
            <LucyLogo size="sm" showGlow className="flex-shrink-0" />
            <div className="glass-card-enhanced border border-primary/40 rounded-3xl px-6 py-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground">Lucy is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* INPUT AREA - Lucy Goddess Style */}
      <div className="chat-input-row border-t border-primary/20 p-4 bg-[var(--bg-1)]/90 backdrop-blur-sm">
        <div className="space-y-3 max-w-5xl mx-auto">
          {showUpload && (
            <FileUploadZone
              selectedFiles={selectedFiles}
              onFilesSelected={(files) => setSelectedFiles([...selectedFiles, ...files])}
              onRemoveFile={(i) => setSelectedFiles(selectedFiles.filter((_, x) => i !== x))}
            />
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="upload-btn flex-shrink-0 h-12 w-12 rounded-xl border-primary/30 hover:bg-primary/10"
              onClick={() => setShowUpload(!showUpload)}
            >
              <Plus className="h-5 w-5" />
            </Button>

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
              className="chat-input flex-1 min-h-[56px] max-h-[200px] resize-none rounded-xl border-primary/30 bg-[var(--bg-2)] focus:ring-primary/50"
            />

            <Button
              type="submit"
              disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
              className="chat-send-btn flex-shrink-0 h-12 px-6 rounded-xl bg-gradient-button hover:shadow-glow-violet"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
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
