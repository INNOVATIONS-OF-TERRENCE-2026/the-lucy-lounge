import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  MessageSquarePlus,
  Search,
  LogOut,
  Moon,
  Sun,
  Settings,
  Shield,
  Folder,
  Headphones,
  Home,
  Film, // ✅ ADDED
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SettingsModal } from "./SettingsModal";
import { LucyLogo } from "@/components/branding/LucyLogo";
import { ColorThemeSelector } from "@/components/sidebar/ColorThemeSelector";
import { WeatherAmbientSelector } from "@/components/ambient/WeatherAmbientSelector";

interface ChatSidebarProps {
  userId: string;
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  videoControls?: React.ReactNode;
}

export function ChatSidebar({ userId, currentConversationId, onConversationSelect, videoControls }: ChatSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
    checkAdminStatus();
    loadConversations();
    loadFolders();

    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadConversations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const checkAdminStatus = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (data) setIsAdmin(true);
  };

  const loadFolders = async () => {
    const { data } = await supabase.from("folders").select("*").eq("user_id", userId).order("position");
    if (data) setFolders(data);
  };

  const loadConversations = async () => {
    let query = supabase.from("conversations").select("*").eq("user_id", userId);

    if (selectedFolder) {
      query = query.eq("folder_id", selectedFolder);
    }

    const { data } = await query.order("updated_at", { ascending: false });
    if (data) setConversations(data);
  };

  const handleNewChat = () => {
    onConversationSelect(null as any);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <Sidebar className="border-r-0 bg-sidebar shadow-[4px_0_20px_rgba(0,0,0,0.1)] flex flex-col h-screen overflow-hidden">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <LucyLogo size="sm" showGlow />
          <div>
            <h2 className="font-bold text-lg">Lucy AI</h2>
            <p className="text-xs text-muted-foreground">Beyond Intelligence</p>
          </div>
        </div>
        <Button onClick={handleNewChat} className="w-full bg-gradient-primary">
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel>Conversations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredConversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      onClick={() => onConversationSelect(conversation.id)}
                      isActive={currentConversationId === conversation.id}
                    >
                      <MessageSquarePlus className="w-4 h-4 mr-2" />
                      {conversation.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        {videoControls}

        <ColorThemeSelector />
        <WeatherAmbientSelector />

        <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/")}>
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>

        <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/studios")}>
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          Studios
        </Button>

        <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/listening-mode")}>
          <Headphones className="w-4 h-4 mr-2" />
          Listening Mode
        </Button>

        {/* 🎬 MEDIA BUTTON — THIS WAS MISSING */}
        <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/media")}>
          <Film className="w-4 h-4 mr-2" />
          Media
        </Button>

        {isAdmin && (
          <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/admin")}>
            <Shield className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
        )}

        <Button variant="outline" className="w-full justify-start" onClick={() => setShowSettings(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>

        <Button variant="outline" className="w-full justify-start" onClick={toggleTheme}>
          {isDark ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          )}
        </Button>

        <Button variant="outline" className="w-full justify-start text-destructive" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </Sidebar>
  );
}
