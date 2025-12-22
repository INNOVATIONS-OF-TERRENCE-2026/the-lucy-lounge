import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Loader2,
  Search,
  Download,
  Settings2,
  Shield,
  ChevronDown,
  Headphones,
  Film,
  Brain,
  MoonStar,
  Eye,
  Users,
  History,
  Atom,
  Sparkles,
  Globe,
  Command,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ExportDialog } from "./ExportDialog";
import { SearchModal } from "./SearchModal";
import { LucyLogo } from "@/components/branding/LucyLogo";
import { ContextIndicator } from "./ContextIndicator";
import { MemoryPanel } from "./MemoryPanel";
import { ChatSettings } from "./ChatSettings";
import { ReadingProgressBar } from "./ReadingProgressBar";
import { HeaderMusicPlayer } from "./HeaderMusicPlayer";
import { ScrollToBottom } from "./ScrollToBottom";
import { NewMessageDivider } from "./NewMessageDivider";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useScrollDetection } from "@/hooks/useScrollDetection";
import { useLucyStreaming } from "@/hooks/useLucyStreaming";
import { useReadingMode } from "@/hooks/useReadingMode";
import { useStreamingSpeed } from "@/hooks/useStreamingSpeed";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ───────────────────────────────────────────── */
/* INLINE LOUNGE DROPDOWN — NO EXTERNAL FILE */
/* ───────────────────────────────────────────── */
const LOUNGES = [
  { label: "Listening Mode", icon: Headphones, path: "/listening-mode" },
  { label: "Media Mode", icon: Film, path: "/media" },
  { label: "Neural Mode", icon: Brain, path: "/neural" },
  { label: "Dream Mode", icon: MoonStar, path: "/dream" },
  { label: "Vision Mode", icon: Eye, path: "/vision" },
  { label: "Silent Room", icon: Users, path: "/silent-room" },
  { label: "Memory Timeline", icon: History, path: "/timeline" },
  { label: "Quantum Mode", icon: Atom, path: "/quantum" },
  { label: "Presence Mode", icon: Sparkles, path: "/presence" },
  { label: "World Events", icon: Globe, path: "/events" },
  { label: "Command Center", icon: Command, path: "/command" },
];

function LoungeDropdownInline() {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          Lounges <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {LOUNGES.map((l) => (
          <DropdownMenuItem key={l.path} onClick={() => navigate(l.path)}>
            <l.icon className="w-4 h-4 mr-2" />
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ChatInterfaceProps {
  userId: string;
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ userId, conversationId, onConversationCreated }: ChatInterfaceProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAdminCheck();

  const { readingMode, setReadingMode } = useReadingMode();
  const { speed: streamingSpeed, setSpeed: setStreamingSpeed } = useStreamingSpeed();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [lastReadMessageIndex, setLastReadMessageIndex] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { displayText, isStreaming, startStreaming } = useLucyStreaming();
  const { showScrollButton } = useScrollDetection(chatContainerRef);

  useKeyboardShortcuts({
    onSend: () => handleSend(),
    onFocusInput: () => inputRef.current?.focus(),
    onSearch: () => setShowSearch(true),
  });

  /* rest of your restored logic continues unchanged */

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <ReadingProgressBar isStreaming={isStreaming} />

      <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 backdrop-blur-md bg-background/60 border-b">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <LucyLogo size="sm" showGlow />
          <LoungeDropdownInline />
        </div>

        <div className="flex-1 flex justify-center px-4">
          <HeaderMusicPlayer />
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <Shield className="w-4 h-4 mr-1" />
              <Badge>Admin</Badge>
            </Button>
          )}
        </div>
      </header>

      {/* body + input remain unchanged */}
    </main>
  );
}
