import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Sparkles, Search, Download, Upload, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileUploadZone } from "./FileUploadZone";
import { ExportDialog } from "./ExportDialog";
import { SearchModal } from "./SearchModal";
import { ModelSelector } from "./ModelSelector";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([]);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [fusionEnabled, setFusionEnabled] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      loadConversationDetails();

      // Set up realtime subscription for messages
      const channel = supabase
        .channel(`messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]);
      setConversationTitle("New Conversation");
    }
  }, [conversationId]);

  const loadConversationDetails = async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from('conversations')
      .select('title')
      .eq('id', conversationId)
      .single();
    if (data) setConversationTitle(data.title);
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage]);

  const loadMessages = async () => {
    if (!conversationId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const createConversation = async (firstMessage: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : ''),
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        role,
        content,
      });

    if (error) throw error;
  };

  const uploadFiles = async (convId: string, msgId: string) => {
    if (selectedFiles.length === 0) return [];

    const attachments = [];
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', convId);
      formData.append('messageId', msgId);

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-attachment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        attachments.push(data.attachment);
      }
    }

    setSelectedFiles([]);
    return attachments;
  };

  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");

    try {
      // Create conversation if needed
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(userMessage);
        onConversationCreated(convId);
      }

      // Save user message and get message ID
      const { data: userMsgData } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          role: 'user',
          content: userMessage || '(File attachment)',
        })
        .select()
        .single();

      // Upload files if any
      if (selectedFiles.length > 0 && userMsgData) {
        await uploadFiles(convId, userMsgData.id);
      }

      // Call streaming edge function (use model-router for advanced features)
      const endpoint = selectedModel || fusionEnabled ? 'model-router' : 'chat-stream';
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessage }],
            preferredModel: selectedModel,
            enableFusion: fusionEnabled,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  setStreamingMessage(fullResponse);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Save assistant message
      if (fullResponse) {
        await saveMessage(convId, 'assistant', fullResponse);
        setStreamingMessage("");
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex-1 flex flex-col h-screen relative">
      {/* Header */}
      <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 backdrop-blur-xl bg-background/60">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center animate-neural-pulse">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold">{conversationTitle}</h1>
            <p className="text-xs text-muted-foreground">Powered by advanced intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)}>
            <Search className="w-4 h-4" />
          </Button>
          {conversationId && (
            <Button variant="ghost" size="sm" onClick={() => setShowExport(true)}>
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowModelSelector(!showModelSelector)}>
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {showModelSelector && (
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          fusionEnabled={fusionEnabled}
          onFusionToggle={setFusionEnabled}
        />
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-8">
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center animate-neural-pulse">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
                Welcome to Lucy AI
              </h2>
              <p className="text-muted-foreground text-lg">
                Your advanced AI assistant is ready to help. Ask me anything!
              </p>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {streamingMessage && (
            <ChatMessage 
              message={{ 
                role: 'assistant', 
                content: streamingMessage,
                created_at: new Date().toISOString()
              }} 
              isStreaming 
            />
          )}
          
          {isLoading && !streamingMessage && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Lucy is thinking...</span>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/50 p-6 backdrop-blur-xl bg-background/60">
        <div className="max-w-4xl mx-auto space-y-3">
          <FileUploadZone
            selectedFiles={selectedFiles}
            onFilesSelected={(files) => setSelectedFiles([...selectedFiles, ...files])}
            onRemoveFile={(index) => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
          />
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Lucy anything..."
              className="pr-12 min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
              size="icon"
              className="absolute bottom-2 right-2 bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Press Enter to send, Shift+Enter for new line
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
