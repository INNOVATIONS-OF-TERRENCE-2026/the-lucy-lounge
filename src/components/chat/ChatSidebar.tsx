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
  SidebarTrigger,
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
  Tag as TagIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SettingsModal } from "./SettingsModal";
import { TagManager } from "./TagManager";
import { LucyLogo } from "@/components/branding/LucyLogo";

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
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    // Check theme
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);

    // Check if user is admin
    checkAdminStatus();

    // Load conversations and folders
    loadConversations();
    loadFolders();

    // Set up realtime subscription
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${userId}`
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const checkAdminStatus = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (data) {
      setIsAdmin(true);
    }
  };

  const loadFolders = async () => {
    const { data } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('position');
    if (data) setFolders(data);
  };

  const loadConversations = async () => {
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId);

    if (selectedFolder) {
      query = query.eq('folder_id', selectedFolder);
    }

    const { data } = await query.order('updated_at', { ascending: false });
    if (data) setConversations(data);
  };

  const updateConversationTags = async (convId: string, tags: string[]) => {
    await supabase
      .from('conversations')
      .update({ tags })
      .eq('id', convId);
    loadConversations();
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

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <LucyLogo size="sm" showGlow />
          <div>
            <h2 className="font-bold text-lg text-sidebar-foreground">Lucy AI</h2>
            <p className="text-xs text-muted-foreground">Beyond Intelligence</p>
          </div>
        </div>
        <Button
          onClick={handleNewChat}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
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
          {folders.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Folders</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setSelectedFolder(null)}
                      isActive={selectedFolder === null}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      All Conversations
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {folders.map((folder) => (
                    <SidebarMenuItem key={folder.id}>
                      <SidebarMenuButton
                        onClick={() => setSelectedFolder(folder.id)}
                        isActive={selectedFolder === folder.id}
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        {folder.name}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel>Conversations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredConversations.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No conversations yet. Start a new chat!
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <div className="w-full">
                        <SidebarMenuButton
                          onClick={() => onConversationSelect(conversation.id)}
                          isActive={currentConversationId === conversation.id}
                          className="w-full justify-start"
                        >
                          <MessageSquarePlus className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate flex-1">{conversation.title}</span>
                        </SidebarMenuButton>
                        {conversation.tags && conversation.tags.length > 0 && (
                          <div className="px-4 py-1 flex flex-wrap gap-1">
                            {conversation.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-2">
        {videoControls && (
          <div className="pb-2 border-b border-border/50">
            {videoControls}
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate("/studios")}
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          Studios
        </Button>
        {isAdmin && (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate("/admin")}
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={toggleTheme}
        >
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
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </Sidebar>
  );
}
