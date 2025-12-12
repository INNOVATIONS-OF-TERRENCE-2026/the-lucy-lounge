import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { ThemePicker } from "@/components/ThemePicker";

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
  const [toolResults, setToolResults] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { suggestedScene } = useSmartSceneSuggestion(conversationId);
  const { storeMemory } = useMemoryManager(userId);
  const { analyzeContext } = useContextAnalyzer(conversationId);
  const { readingMode, setReadingMode, getSpacingClass } = useReadingMode();
  const { speed, setSpeed } = useStreamingSpeed();
  const { showScrollButton } = useScrollDetection(chatContainerRef);
  const { displayText, isStreaming, startStreaming } = useLucyStreaming();

  useKeyboardShortcuts({
    onSend: () => handleSend(),
    onFocusInput: () => inputRef.current?.focus(),
  });

  const scrollToLatest = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToLatest();
  }, [messages, streamingMessage, scrollToLatest]);

  const saveMessage = async (convId: string, role: string, content: string) => {
    await supabase.from("messages").insert({
      conversation_id: convId,
      role,
      content,
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);
    setLastUserMessage(userMessage);

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

      await saveMessage(convId!, "user", userMessage);

      const imageKeywords = [
        "generate an image",
        "create an image",
        "draw",
        "make an image",
        "create a picture",
        "generate a picture",
        "show me",
        "paint",
        "illustrate",
      ];

      const isImageRequest = imageKeywords.some((k) => userMessage.toLowerCase().includes(k));

      const endpoint = isImageRequest ? "lucy-router" : "chat-stream";

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
          userId,
        }),
      });

      // 🔒 lucy-router NEVER throws
      if (isImageRequest) {
        let data: any = null;
        try {
          data = await response.json();
        } catch {}

        const finalAnswer = data?.plan?.finalAnswer ?? "I couldn’t generate that image right now, but I’m still here.";

        await saveMessage(convId!, "assistant", finalAnswer);
        setMessages((prev) => [...prev, { role: "assistant", content: finalAnswer }]);
        return;
      }

      // Normal streaming path
      if (!response.ok) {
        throw new Error("Chat failed");
      }

      startStreaming(response, async (finalText: string) => {
        await saveMessage(convId!, "assistant", finalText);
        analyzeContext([...messages, { role: "assistant", content: finalText }]);
      });
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen">
      <ReadingProgressBar isStreaming={isStreaming} />

      <header className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <LucyLogo size="sm" />
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={() => navigate("/admin")} size="sm">
              <Shield className="w-4 h-4" />
            </Button>
          )}
          <ChatSettings
            readingMode={readingMode}
            setReadingMode={setReadingMode}
            streamingSpeed={speed}
            setStreamingSpeed={setSpeed}
          />
        </div>
      </header>

      <ScrollArea ref={chatContainerRef} className="flex-1 px-4">
        {messages.map((m, i) => (
          <ChatMessage key={i} message={m} />
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
        <div ref={scrollRef} />
      </ScrollArea>

      {error && <div className="text-red-500 p-2">{error}</div>}

      <div className="p-3 flex gap-2">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Lucy..."
        />
        <Button onClick={handleSend} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>
    </main>
  );
}
