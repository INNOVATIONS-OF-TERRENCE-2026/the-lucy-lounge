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
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useScrollDetection } from "@/hooks/useScrollDetection";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollToBottom } from "./ScrollToBottom";
import { NewMessageDivider } from "./NewMessageDivider";

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
  const { showScrollButton, scrollToBottom } = useScrollDetection(chatContainerRef);

  useKeyboardShortcuts({
    onSend: () => handleSend(),
    onFocusInput: () => inputRef.current?.focus(),
    onSearch: () => setShowSearch(true),
  });

  useEffect(() => {
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
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]);
      setConversationTitle("New Conversation");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const loadConversationDetails = async () => {
    if (!conversationId) return;
    const { data } = await supabase.from("conversations").select("title").eq("id", conversationId).single();
    if (data) setConversationTitle(data.title);
  };

  // Auto-scroll when messages change or streaming
  const scrollToLatest = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
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

    if (data) {
      setMessages(data);
    }
  };

  const createConversation = async (firstMessage: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : ""),
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    const { error } = await supabase.from("messages").insert({
      conversation_id: convId,
      role,
      content,
    });

    if (error) throw error;
  };

  const uploadFiles = async (convId: string, msgId: string) => {
    if (selectedFiles.length === 0) return [];

    const attachments: any[] = [];
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", convId);
      formData.append("messageId", msgId);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-attachment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        attachments.push(data.attachment);
      }
    }

    setSelectedFiles([]);
    setUploadedAttachments(attachments);
    return attachments;
  };

  const analyzeMultimodal = async (attachmentIds: string[]) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/multimodal-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ attachmentIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429 || response.status === 402) {
          toast({
            title: "Analysis temporarily unavailable",
            description: errorData.error,
            variant: "destructive",
          });
        }
        return null;
      }

      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error("Multimodal analysis error:", error);
      return null;
    }
  };

  const processStreamingResponse = async (response: Response, convId: string) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    let receivedToolResults = false;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              if (parsed.toolResults && !receivedToolResults) {
                setToolResults(parsed.toolResults);
                receivedToolResults = true;
              }

              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                setStreamingMessage(fullResponse);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    }

    if (fullResponse) {
      await saveMessage(convId, "assistant", fullResponse);
      setStreamingMessage("");
      await loadMessages();

      setTimeout(() => {
        const allMessages = [
          ...messages,
          { role: "user", content: input },
          { role: "assistant", content: fullResponse },
        ];
        analyzeContext(allMessages.map((m) => ({ role: m.role, content: m.content })));
      }, 1000);

      if (fullResponse.length > 100 && (fullResponse.includes("remember") || fullResponse.includes("important"))) {
        storeMemory(fullResponse.slice(0, 200), "conversation", 0.7);
      }
    }
  };

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
        convId = await createConversation(userMessage);
        onConversationCreated(convId);
      }

      const { data: userMsgData } = await supabase
        .from("messages")
        .insert({
          conversation_id: convId,
          role: "user",
          content: userMessage || "(File attachment)",
        })
        .select()
        .single();

      let attachments: any[] = [];
      if (selectedFiles.length > 0 && userMsgData) {
        attachments = await uploadFiles(convId, userMsgData.id);

        if (attachments.length > 0) {
          const attachmentIds = attachments.map((a) => a.id);
          const analysis = await analyzeMultimodal(attachmentIds);

          if (analysis) {
            const enhancedMessage = `[Lucy's Multimodal Analysis]\n${analysis}\n\n[User Message]\n${
              userMessage || "Please analyze the uploaded files."
            }`;

            const endpoint = selectedModel || fusionEnabled ? "model-router" : "chat-stream";
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`, {
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
                  { role: "user", content: enhancedMessage },
                ],
                preferredModel: selectedModel,
                enableFusion: fusionEnabled,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to get AI response");
            }

            await processStreamingResponse(response, convId);
            return;
          }
        }
      }

      const endpoint = selectedModel || fusionEnabled ? "model-router" : "chat-stream";
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
          preferredModel: selectedModel,
          enableFusion: fusionEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      await processStreamingResponse(response, convId);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(error.message || "Failed to send message");
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedFiles([]);
      setUploadedAttachments([]);
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      setInput(lastUserMessage);
      setError(null);
      setTimeout(() => handleSend(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex-1 flex flex-col h-screen relative" data-theme-area="chat">
      <ReadingProgressBar isStreaming={!!streamingMessage} />

      <ScrollToBottom
        visible={showScrollButton && messages.length > 3}
        onClick={() => scrollToLatest()}
        newMessageCount={messages.length - lastReadMessageIndex - 1}
      />

      {/* HEADER */}
      <header className="h-14 md:h-16 border-b border-primary/20 flex items-center justify-between px-4 md:px-6 backdrop-blur-xl bg-background/80 shadow-[0_0_15px_rgba(168,85,247,0.1)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <LucyLogo size="sm" showGlow />
          <div>
            <h1 className="font-semibold bg-gradient-button bg-clip-text text-transparent">{conversationTitle}</h1>
            <p className="text-xs text-muted-foreground">Divine Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="glass-card border-primary/30 hover:shadow-glow-violet"
            >
              <Shield className="w-4 h-4 mr-2" />
              <Badge variant="default" className="bg-gradient-primary">
                Admin
              </Badge>
            </Button>
          )}
          <ChatSettings
            readingMode={readingMode}
            setReadingMode={setReadingMode}
            streamingSpeed={speed}
            setStreamingSpeed={setSpeed}
          />
          <MemoryPanel userId={userId} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(true)}
            className="glass-card border-primary/30"
          >
            <Search className="w-4 h-4" />
          </Button>
          {conversationId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExport(true)}
              className="glass-card border-primary/30"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="glass-card border-primary/30"
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <SmartSceneSuggestion
        suggestedScene={suggestedScene}
        onApply={(scene) => console.log("Apply scene:", scene)}
        onDismiss={() => {}}
      />

      {showModelSelector && (
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          fusionEnabled={fusionEnabled}
          onFusionToggle={setFusionEnabled}
        />
      )}

      {/* MAIN CHAT AREA – full remaining height */}
      <ScrollArea ref={chatContainerRef} className="flex-1 px-4 md:px-6 py-4 overflow-y-auto">
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-2xl mx-auto py-8">
            <LucyLogo size="xl" showGlow />
            <div className="bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-primary/20 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-button bg-clip-text text-transparent">
                Welcome to Lucy AI
              </h2>
              <p className="text-muted-foreground">Divine intelligence awaits. Ask me anything!</p>
            </div>
          </div>
        )}

        <div className={`max-w-4xl mx-auto ${getSpacingClass()}`}>
          {conversationId && <ContextIndicator conversationId={conversationId} />}

          {messages.map((message, index) => {
            const showDivider =
              index === 0 ||
              new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 3600000;
            const isNewMessage = index > lastReadMessageIndex;

            return (
              <div key={message.id}>
                {showDivider && <TimestampDivider timestamp={message.created_at} />}
                {isNewMessage && index === lastReadMessageIndex + 1 && <NewMessageDivider />}
                <ChatMessage message={message} />
              </div>
            );
          })}

          {toolResults && <ToolResultDisplay results={toolResults.results} />}

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

          {isLoading && !streamingMessage && (
            <div className="flex items-center gap-3 text-muted-foreground bg-background/60 backdrop-blur-sm px-5 py-3 rounded-xl border border-primary/20 w-fit shadow-[0_0_10px_rgba(168,85,247,0.1)]">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm">Lucy is thinking...</span>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 backdrop-blur-sm p-5 rounded-xl border border-destructive/30 space-y-3 max-w-2xl">
              <p className="text-destructive font-medium text-sm">Response Error</p>
              <p className="text-sm text-foreground whitespace-pre-wrap break-words">{error}</p>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleRetry} variant="default" size="sm" className="bg-primary hover:bg-primary/90">
                  Retry
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(lastUserMessage);
                    toast({
                      title: "Copied",
                      description: "Message copied to clipboard",
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  Copy Message
                </Button>
              </div>
            </div>
          )}

          {conversationId && !isLoading && messages.length > 0 && (
            <ProactiveSuggestions
              conversationId={conversationId}
              onSelectSuggestion={(text) => {
                setInput(text);
                setTimeout(() => handleSend(), 100);
              }}
            />
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* INPUT AREA – compact with inline upload */}
      <div className="border-t border-primary/20 p-4 md:p-6 backdrop-blur-xl glass shadow-[0_0_20px_rgba(168,85,247,0.15)] flex-shrink-0" data-theme-area="chat">
        <div className="max-w-5xl mx-auto space-y-2">
          {/* File previews above input if files selected */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-2">
              {selectedFiles.map((file, index) => {
                const isImage = file.type.startsWith("image/");
                const previewUrl = isImage ? URL.createObjectURL(file) : null;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-full border border-primary/30 text-xs max-w-[140px]"
                  >
                    {previewUrl && (
                      <img src={previewUrl} alt="" className="w-4 h-4 rounded-sm object-cover flex-shrink-0" />
                    )}
                    <span className="truncate text-foreground">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                      className="flex-shrink-0 hover:text-destructive transition-colors ml-0.5"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="relative flex items-end gap-2">
            {/* Inline upload button */}
            <InlineFileUpload
              selectedFiles={[]}
              onFilesSelected={(files) => setSelectedFiles([...selectedFiles, ...files])}
              onRemoveFile={() => {}}
            />
            
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Lucy..."
                className="chat-input pr-16 min-h-[56px] md:min-h-[64px] max-h-[200px] resize-none text-base px-5 py-4 rounded-2xl border border-primary/30 focus:border-primary/60 focus:shadow-[0_0_12px_rgba(168,85,247,0.25)] transition-all duration-300 bg-background/80 backdrop-blur-sm"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
                size="sm"
                className="absolute bottom-2 right-2 bg-gradient-button hover:shadow-glow-divine hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl h-10 w-10"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center opacity-70">
            <span className="hidden md:inline">Enter to send • Shift+Enter for new line • </span>
            Ctrl/Cmd+K to search
          </p>
        </div>
      </div>

      <SearchModal
        open={showSearch}
        onOpenChange={setShowSearch}
        onSelectConversation={(id) => {
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
