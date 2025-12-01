// FINAL FIXED VERSION
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
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
  const [streamingMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [lastReadIndex] = useState(-1);

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    <main
      className="
        flex-1 flex flex-col h-screen 
        bg-[var(--bg-1)] text-[var(--text)]
        transition-all duration-500
      "
    >
      <ReadingProgressBar isStreaming={!!streamingMessage} />

      {/* HEADER */}
      <header className="h-16 flex items-center justify-between border-b border-primary/20 px-4 glass">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <LucyLogo size="sm" />
          <h1 className="font-semibold bg-gradient-button bg-clip-text text-transparent">{conversationTitle}</h1>
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
        className="
          flex-1 px-4 py-6 
          bg-[var(--bg-2)]
          transition-all duration-500
          scroll-smooth
        "
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <LucyLogo size="xl" showGlow />
            <div className="glass-card-enhanced p-10 rounded-3xl border border-primary/40 shadow-glow-divine bg-[var(--bg-1)]">
              <h2 className="text-4xl font-bold mb-4 text-[var(--text)]">Welcome to Lucy AI</h2>
              <p className="text-[var(--text)] text-lg">Divine intelligence awaits. Ask me anything!</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </ScrollArea>

      {/* INPUT AREA */}
      <div className="border-t border-primary/20 p-4 glass">
        <div className="space-y-3 max-w-5xl mx-auto">
          <FileUploadZone
            selectedFiles={selectedFiles}
            onFilesSelected={(files) => setSelectedFiles([...selectedFiles, ...files])}
            onRemoveFile={(i) => setSelectedFiles(selectedFiles.filter((_, x) => i !== x))}
          />

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
              placeholder="Message Lucy…"
              className="min-h-[70px] chat-input"
            />

            <Button disabled={!input.trim() || isLoading} onClick={handleSend} className="absolute bottom-3 right-3">
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </div>
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
