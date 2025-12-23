import { useEffect, useState, memo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
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
  History,
  Command,
  Atom,
  Sparkles,
  Globe,
  ChevronDown,
  Palette,
  Cloud,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LucyAvatar } from "@/components/avatar/LucyAvatar";
import { LucyPresenceGlow } from "@/components/animation/LucyPresenceGlow";
import { SettingsModal } from "./SettingsModal";
import { ColorThemeSelector } from "@/components/sidebar/ColorThemeSelector";
import { WeatherAmbientSelector } from "@/components/ambient/WeatherAmbientSelector";
import { LucyWorldsSelector } from "@/components/worlds/LucyWorldsSelector";
import { useLucyWorlds } from "@/contexts/LucyWorldsContext";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Props {
  userId: string;
  currentConversationId: string | null;
  onConversationSelect: (id: string | null) => void;
  lucyState?: 'idle' | 'thinking' | 'responding';
}

const lounges = [
  { label: "Listening Mode", icon: Headphones, path: "/listening-mode", color: "text-purple-400" },
  { label: "Media Mode", icon: Film, path: "/media", color: "text-pink-400" },
  { label: "Neural Mode", icon: Brain, path: "/neural", color: "text-blue-400" },
  { label: "Dream Mode", icon: MoonStar, path: "/dream", color: "text-indigo-400" },
  { label: "Vision Mode", icon: Eye, path: "/vision", color: "text-cyan-400" },
  { label: "Silent Room", icon: Users, path: "/silent-room", color: "text-gray-400" },
  { label: "Memory Timeline", icon: History, path: "/timeline", color: "text-amber-400" },
  { label: "Quantum Mode", icon: Atom, path: "/quantum", color: "text-teal-400" },
  { label: "Presence Mode", icon: Sparkles, path: "/presence", color: "text-rose-400" },
  { label: "World Events", icon: Globe, path: "/events", color: "text-green-400" },
  { label: "Command Center", icon: Command, path: "/command", color: "text-orange-400" },
];

const LoungeItem = memo(function LoungeItem({ 
  lounge, 
  isActive, 
  onClick 
}: { 
  lounge: typeof lounges[0]; 
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = lounge.icon;
  
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onClick}
        isActive={isActive}
        className={cn(
          "w-full justify-start transition-all duration-200",
          "hover:bg-accent/50 hover:shadow-sm",
          isActive && "bg-primary/15 border-l-2 border-primary shadow-glow-violet"
        )}
        tooltip={lounge.label}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className={cn("h-4 w-4", isActive ? "text-primary" : lounge.color)} />
        </motion.div>
        <span className={cn(
          "truncate",
          isActive && "text-primary font-medium"
        )}>
          {lounge.label}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

export const LucyControlDeck = memo(function LucyControlDeck({ 
  userId, 
  currentConversationId, 
  onConversationSelect,
  lucyState = 'idle'
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));
  const [showSettings, setShowSettings] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'themes' | 'weather' | 'worlds'>('themes');
  
  const { worldConfig, isWorldEnabled } = useLucyWorlds();

  useEffect(() => {
    supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .then(({ data }) => data && setConversations(data));
  }, [userId]);

  const filtered = conversations.filter((c) => 
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLoungeClick = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const toggleDarkMode = useCallback(() => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
    localStorage.setItem('theme', !dark ? 'dark' : 'light');
  }, [dark]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  }, [navigate]);

  return (
    <Sidebar className="flex flex-col h-screen overflow-hidden border-r border-border/50 bg-sidebar/95 backdrop-blur-xl">
      {/* ═══════════════════════════════════════════════════════════
          ZONE 1: LUCY IDENTITY (FIXED TOP)
          ═══════════════════════════════════════════════════════════ */}
      <SidebarHeader className="p-4 space-y-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <LucyPresenceGlow state={lucyState} size="sm">
            <LucyAvatar size="sm" state={lucyState} />
          </LucyPresenceGlow>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">Lucy</h2>
            <p className="text-xs text-muted-foreground truncate">
              {isWorldEnabled && worldConfig ? worldConfig.name : 'Your AI Companion'}
            </p>
          </div>
        </div>
        
        <Button 
          className="w-full bg-primary/90 hover:bg-primary shadow-glow-violet" 
          onClick={() => onConversationSelect(null)}
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="flex-1 min-h-0 overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════
            ZONE 2: LOUNGE MODES (ALWAYS VISIBLE, NO SCROLL)
            ═══════════════════════════════════════════════════════════ */}
        <SidebarGroup className="flex-shrink-0">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Lounge Modes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {lounges.map((lounge) => (
                <LoungeItem
                  key={lounge.path}
                  lounge={lounge}
                  isActive={location.pathname === lounge.path}
                  onClick={() => handleLoungeClick(lounge.path)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ═══════════════════════════════════════════════════════════
            ZONE 3: CONVERSATIONS (SCROLLABLE ONLY)
            ═══════════════════════════════════════════════════════════ */}
        <SidebarGroup className="flex-1 min-h-0 overflow-hidden">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Conversations
          </SidebarGroupLabel>
          
          <div className="px-2 pb-2 relative">
            <Search className="absolute mt-2.5 ml-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-9 bg-background/50 border-border/50"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ScrollArea className="flex-1 min-h-0 px-2">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground text-center py-4"
                >
                  No conversations yet
                </motion.p>
              ) : (
                <div className="space-y-1">
                  {filtered.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Button
                        variant={c.id === currentConversationId ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-sm truncate",
                          c.id === currentConversationId && "bg-primary/10 border-l-2 border-primary"
                        )}
                        onClick={() => onConversationSelect(c.id)}
                      >
                        {c.title || "Untitled"}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </SidebarGroup>
      </SidebarContent>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER: CUSTOMIZATION & ACTIONS
          ═══════════════════════════════════════════════════════════ */}
      <SidebarFooter className="p-3 space-y-2 border-t border-border/30">
        {/* Customization Panel */}
        <Collapsible open={customizeOpen} onOpenChange={setCustomizeOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Customize
              </span>
              <motion.div
                animate={{ rotate: customizeOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 space-y-2"
            >
              {/* Tab Buttons */}
              <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                <Button
                  variant={activeTab === 'themes' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setActiveTab('themes')}
                >
                  <Palette className="h-3 w-3 mr-1" />
                  Themes
                </Button>
                <Button
                  variant={activeTab === 'weather' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setActiveTab('weather')}
                >
                  <Cloud className="h-3 w-3 mr-1" />
                  Weather
                </Button>
                <Button
                  variant={activeTab === 'worlds' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setActiveTab('worlds')}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Worlds
                </Button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="max-h-[250px] overflow-y-auto"
                >
                  {activeTab === 'themes' && <ColorThemeSelector />}
                  {activeTab === 'weather' && <WeatherAmbientSelector />}
                  {activeTab === 'worlds' && <LucyWorldsSelector />}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={() => navigate("/")}
          >
            <Home className="mr-1 h-3 w-3" /> Home
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="mr-1 h-3 w-3" /> Settings
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={toggleDarkMode}
          >
            {dark ? <Sun className="mr-1 h-3 w-3" /> : <Moon className="mr-1 h-3 w-3" />}
            {dark ? "Light" : "Dark"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="text-xs"
            onClick={handleSignOut}
          >
            <LogOut className="mr-1 h-3 w-3" /> Sign Out
          </Button>
        </div>
      </SidebarFooter>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </Sidebar>
  );
});

export default LucyControlDeck;
