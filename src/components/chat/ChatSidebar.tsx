import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquarePlus,
  Search,
  LogOut,
  Moon,
  Sun,
  Settings,
  Home,
  Film,
  Headphones,
  Brain,
  MoonStar,
  Eye,
  Users,
  Timeline,
  Command,
  Atom,
  Sparkles,
  Globe,
} from "lucide-react";
import { LucyLogo } from "@/components/branding/LucyLogo";
import { SettingsModal } from "./SettingsModal";
import { ColorThemeSelector } from "@/components/sidebar/ColorThemeSelector";
import { WeatherAmbientSelector } from "@/components/ambient/WeatherAmbientSelector";

interface Props {
  userId: string;
  currentConversationId: string | null;
  onConversationSelect: (id: string | null) => void;
}

export function ChatSidebar({ userId, currentConversationId, onConversationSelect }: Props) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .then(({ data }) => data && setConversations(data));
  }, [userId]);

  const filtered = conversations.filter((c) => c.title?.toLowerCase().includes(search.toLowerCase()));

  const lounges = [
    { label: "Listening Mode", icon: Headphones, path: "/listening" },
    { label: "Media Mode", icon: Film, path: "/media" },

    { label: "Neural Mode", icon: Brain, path: "/neural" },
    { label: "Dream Mode", icon: MoonStar, path: "/dream" },
    { label: "Vision Mode", icon: Eye, path: "/vision" },
    { label: "Silent Room", icon: Users, path: "/silent-room" },
    { label: "Memory Timeline", icon: Timeline, path: "/timeline" },
    { label: "Quantum Mode", icon: Atom, path: "/quantum" },
    { label: "Presence Mode", icon: Sparkles, path: "/presence" },
    { label: "World Events", icon: Globe, path: "/events" },
    { label: "Command Center", icon: Command, path: "/command" },
  ];

  return (
    <Sidebar className="flex flex-col h-screen overflow-hidden">
      {/* HEADER */}
      <SidebarHeader className="p-4 space-y-4">
        <LucyLogo size="sm" showGlow />
        <Button className="w-full" onClick={() => onConversationSelect(null)}>
          <MessageSquarePlus className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="flex-1 min-h-0 overflow-hidden">
        {/* Search */}
        <div className="px-4 pb-2 relative">
          <Search className="absolute mt-3 ml-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search chats"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 min-h-0 px-2">
          <div className="space-y-1">
            {filtered.map((c) => (
              <Button
                key={c.id}
                variant={c.id === currentConversationId ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onConversationSelect(c.id)}
              >
                {c.title}
              </Button>
            ))}
          </div>

          {/* Lounges */}
          <div className="mt-6 px-2">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Lounges</p>
            <div className="space-y-1">
              {lounges.map((l) => (
                <Button key={l.path} variant="ghost" className="w-full justify-start" onClick={() => navigate(l.path)}>
                  <l.icon className="mr-2 h-4 w-4" />
                  {l.label}
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-4 space-y-2">
        <ColorThemeSelector />
        <WeatherAmbientSelector />

        <Button variant="outline" onClick={() => navigate("/")}>
          <Home className="mr-2 h-4 w-4" /> Home
        </Button>

        <Button variant="outline" onClick={() => setShowSettings(true)}>
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            document.documentElement.classList.toggle("dark");
            setDark(!dark);
          }}
        >
          {dark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          {dark ? "Light" : "Dark"} Mode
        </Button>

        <Button
          variant="destructive"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate("/auth");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </SidebarFooter>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </Sidebar>
  );
}
