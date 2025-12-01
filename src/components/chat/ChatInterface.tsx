import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Search, Download, Settings2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FileUploadZone } from "./FileUploadZone";
import { ExportDialog } from "./ExportDialog";
import { SearchModal } from "./SearchModal";
import { ModelSelector } from "./ModelSelector";
import { LucyLogo } from "@/components/branding/LucyLogo";
import { ContextIndicator } from "./ContextIndicator";
import { MemoryPanel } from "./MemoryPanel";
import { SmartSceneSuggestion } from "./SmartSceneSuggestion";
import { ChatSettings } from "./ChatSettings";
import { useSmartSceneSuggestion } from "@/hooks/useSmartSceneSuggestion";
import { useMemoryManager } from "@/hooks/useMemoryManager";
import { useContextAnalyzer } from "@/hooks/useContextAnalyzer";
import { useReadingMode } from "@/hooks/useReadingMode";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useScrollDetection } from "@/hooks/useScrollDetection";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ChatInterfaceProps {
  userId: string;
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ userId, conversationId, onConversationCreated }: ChatInterfaceProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAdminCheck();

  // FIXED missing state
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [showSearch, setShowSearch] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    // TEMP fake send logic so UI works:
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: input }]);
    setInput("");
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex-1 flex flex-col h-full w-full">
      <header className="h-16 border-b border-primary/10 flex items-center justify-between px-4 md:px-6 flex-shrink-0 backdrop-blur-xl shadow-sm">
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
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <Shield className="w-4 h-4 mr-1" />
              <Badge variant="default">Admin</Badge>
            </Button>
          )}

          <ChatSettings />
          <MemoryPanel userId={userId} />

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

      <ScrollArea ref={chatContainerRef} className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

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

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="flex-shrink-0 border-t border-primary/10 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl w-full flex flex-col gap-3">
          {selectedFiles.length > 0 && (
            <FileUploadZone
              selectedFiles={selectedFiles}
              onFilesSelected={(files) => setSelectedFiles([...files])}
              onRemoveFile={(i) => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))}
            />
          )}

          <div className="relative w-full">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Lucy…"
              className="w-full pr-20 resize-none min-h-[70px] max-h-[200px]"
            />

            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="lg"
              className="absolute bottom-2 right-2 rounded-xl h-12 w-12 bg-gradient-button"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <SearchModal open={showSearch} onOpenChange={setShowSearch} />

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
