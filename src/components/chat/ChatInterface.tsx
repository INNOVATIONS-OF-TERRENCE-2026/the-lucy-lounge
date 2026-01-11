import { useState, useEffect, useRef, useCallback } from "react";
import type { KeyboardEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Loader2,
  Search,
  Download,
  Settings2,
  Shield,
} from "lucide-react";
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

// 🎬 CINEMATIC INTENT ROUTER
import { detectCinematicIntent } from "@/chat/lucyIntentRouter";

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
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

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
  });

  const scrollToLatest = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToLatest, [messages, streamingMessage, videoUrl]);

  /* ----------------------------------
     LOAD MESSAGES
  ----------------------------------- */
  useEffect(() => {
    if (!conversationId) return;

    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => data && setMessages(data));

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
  }, [conversationId]);

  /* ----------------------------------
     SEND MESSAGE (🎬 CINEMATIC WIRED)
  ----------------------------------- */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setLastUserMessage(userMessage);
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");
    setError(null);
    setVideoUrl(null);

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

      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: userMessage,
      });

      /* 🎬 CINEMATIC INTERCEPT */
      if (detectCinematicIntent(userMessage)) {
        setStreamingMessage("🎬 Lucy is generating your cinematic video…");

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lucy-generate-video`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              prompt: userMessage,
              duration: 8,
              width: 512,
              height: 512,
              enhance_prompt: true,
            }),
          },
        );

        if (!res.ok) throw new Error(await res.text());

        const result = await res.json();
        setVideoUrl(result.video_url);

        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: "🎬 Your cinematic video is ready.",
        });

        setStreamingMessage("");
        return;
      }

      /* NORMAL CHAT */
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMessage }],
          }),
        },
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value);
          setStreamingMessage(fullText);
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
      setStreamingMessage("");
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ----------------------------------
     RENDER
  ----------------------------------- */
  return (
    <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
      <ReadingProgressBar isStreaming={isLoading} />

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <ChatMessage key={i} message={m} />
        ))}

        {(streamingMessage || displayText) && (
          <ChatMessage
            message={{ role: "assistant", content: streamingMessage || displayText, created_at: new Date().toISOString() }}
            isStreaming
          />
        )}

        {videoUrl && (
          <div className="rounded-xl overflow-hidden border shadow-xl mt-4">
            <video src={videoUrl} controls autoPlay className="w-full" />
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Lucy…"
            className="flex-1 resize-none"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </div>
    </main>
  );
}
