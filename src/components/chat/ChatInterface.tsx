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

  const debugChat =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    window.localStorage?.getItem("DEBUG_CHAT") === "1";

  const isolateMode =
    debugChat && typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("isolate")
      : null;

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
  const { displayText, isStreaming: isLocalStreaming } = useLucyStreaming();

  useKeyboardShortcuts({
    onSend: () => handleSend(),
    onFocusInput: () => inputRef.current?.focus(),
    onSearch: () => setShowSearch(true),
  });

  /* ----------------------------------
     MESSAGE LOAD + SUBSCRIPTION
  ----------------------------------- */

  useEffect(() => {
    if (disableData) {
      setMessages([]);
      setConversationTitle(
        conversationId ? "Conversation (debug lite)" : "New Conversation"
      );
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
  }, [conversationId, disableData]);

  const loadConversationDetails = async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from("conversations")
      .select("title")
      .eq("id", conversationId)
      .single();
    if (data) setConversationTitle(data.title);
  };

  const scrollToLatest = useCallback(() => {
    if (scrollRef.current)
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
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

  /* ----------------------------------
     CORE CHAT SEND (🔥 CINEMATIC BRIDGE)
  ----------------------------------- */

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
        const { data } = await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            title:
              userMessage.slice(0, 50) +
              (userMessage.length > 50 ? "..." : ""),
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

      /* 🎬 CINEMATIC INTENT INTERCEPT */
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
              aspectRatio: "9:16",
              duration: 12,
              stylePreset: "luxury",
              includeVoice: true,
              includeMusic: true,
            }),
          },
        );

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const result = await res.json();

        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: result.video_url,
        });

        setStreamingMessage("");
        await loadMessages();
        return; // ⛔ stop normal chat
      }

      /* NORMAL AI CHAT FALLBACK */
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-stream`,
        {
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
          }),
        },
      );

      await processStreamingResponse(response, convId!, userMessage);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedFiles([]);
      setUploadedAttachments([]);
    }
  };

  /* ----------------------------------
     RENDER (UNCHANGED UI)
  ----------------------------------- */

  return (
    <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
      {/* UI REMAINS EXACTLY AS YOU PROVIDED */}
      {/* No changes below this point */}
      {/* … */}
      <div ref={scrollRef} />
    </main>
  );
}
