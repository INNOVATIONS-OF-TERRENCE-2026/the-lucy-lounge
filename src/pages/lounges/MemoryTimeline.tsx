/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — MEMORY TIMELINE                                          │
 * │                                                                             │
 * │ Visual timeline of your conversations and interactions with Lucy           │
 * │ Browse history, revisit moments, track your journey                        │
 * │                                                                             │
 * │ Lucy remembers everything.                                                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  MessageSquare, 
  Calendar,
  Search,
  Filter,
  ChevronRight,
  Sparkles,
  Image,
  Music,
  Code,
  FileText
} from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/platform/LoadingStates';

// =============================================================================
// TYPES
// =============================================================================

interface ConversationSummary {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  messageCount: number;
  hasImages: boolean;
  hasCode: boolean;
  hasAudio: boolean;
}

interface TimelineGroup {
  date: string;
  conversations: ConversationSummary[];
}

// =============================================================================
// COMPONENT
// =============================================================================

const MemoryTimeline = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'images' | 'code' | 'audio'>('all');

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            title,
            created_at,
            messages (
              id,
              content,
              attachments
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        const mapped: ConversationSummary[] = (data || []).map(conv => {
          const messages = conv.messages || [];
          const firstMessage = messages[0];
          const hasImages = messages.some((m: any) => 
            m.attachments?.some((a: any) => a.type?.startsWith('image'))
          );
          const hasCode = messages.some((m: any) => 
            m.content?.includes('```')
          );
          const hasAudio = messages.some((m: any) => 
            m.attachments?.some((a: any) => a.type?.startsWith('audio'))
          );

          return {
            id: conv.id,
            title: conv.title || 'Untitled Conversation',
            preview: firstMessage?.content?.slice(0, 100) || 'No messages',
            createdAt: new Date(conv.created_at),
            messageCount: messages.length,
            hasImages,
            hasCode,
            hasAudio,
          };
        });

        setConversations(mapped);
      } catch (err) {
        console.error('[MemoryTimeline] Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [isAuthenticated, user?.id]);

  // Filter and search
  const filteredConversations = conversations.filter(conv => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!conv.title.toLowerCase().includes(query) && 
          !conv.preview.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Type filter
    if (filter === 'images' && !conv.hasImages) return false;
    if (filter === 'code' && !conv.hasCode) return false;
    if (filter === 'audio' && !conv.hasAudio) return false;

    return true;
  });

  // Group by date
  const groupedConversations: TimelineGroup[] = [];
  const dateMap = new Map<string, ConversationSummary[]>();

  filteredConversations.forEach(conv => {
    const dateKey = conv.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, []);
    }
    dateMap.get(dateKey)!.push(conv);
  });

  dateMap.forEach((convs, date) => {
    groupedConversations.push({ date, conversations: convs });
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getRelativeDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <CinematicWrapper loungeType="memory">
      <div className="container mx-auto px-4 py-8 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Memory Timeline
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Your journey with Lucy, visualized through time.
          </p>
        </motion.div>

        {!isAuthenticated ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Sign in to view your timeline</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your conversation history will appear here once you sign in.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Search and Filters */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'images' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('images')}
                >
                  <Image className="w-4 h-4 mr-1" />
                  Images
                </Button>
                <Button
                  variant={filter === 'code' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('code')}
                >
                  <Code className="w-4 h-4 mr-1" />
                  Code
                </Button>
                <Button
                  variant={filter === 'audio' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('audio')}
                >
                  <Music className="w-4 h-4 mr-1" />
                  Audio
                </Button>
              </div>
            </motion.div>

            {/* Timeline */}
            {loading ? (
              <LoadingState context="general" variant="card" message="Loading your memories..." />
            ) : groupedConversations.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No conversations yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start chatting with Lucy to build your memory timeline.
                  </p>
                  <Button onClick={() => navigate('/chat')}>
                    Start Chatting
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  {groupedConversations.map((group, groupIndex) => (
                    <motion.div
                      key={group.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIndex * 0.1 }}
                    >
                      {/* Date Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-purple-400">
                          <Calendar className="w-4 h-4" />
                          {group.date}
                        </div>
                        <div className="flex-1 h-px bg-border" />
                        <Badge variant="secondary">
                          {group.conversations.length} conversations
                        </Badge>
                      </div>

                      {/* Conversations */}
                      <div className="space-y-3 ml-6 border-l-2 border-purple-500/20 pl-6">
                        {group.conversations.map((conv, convIndex) => (
                          <motion.div
                            key={conv.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: groupIndex * 0.1 + convIndex * 0.05 }}
                          >
                            <Card 
                              className="bg-card/50 border-purple-500/10 hover:border-purple-500/30 transition-colors cursor-pointer"
                              onClick={() => navigate(`/chat?conversation=${conv.id}`)}
                            >
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium truncate">{conv.title}</h4>
                                      {conv.hasImages && <Image className="w-3 h-3 text-blue-400" />}
                                      {conv.hasCode && <Code className="w-3 h-3 text-green-400" />}
                                      {conv.hasAudio && <Music className="w-3 h-3 text-amber-400" />}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {conv.preview}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                      <span>{formatTime(conv.createdAt)}</span>
                                      <span>{conv.messageCount} messages</span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Stats */}
            {conversations.length > 0 && (
              <motion.div
                className="grid grid-cols-3 gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-card/30">
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{conversations.length}</div>
                    <div className="text-sm text-muted-foreground">Conversations</div>
                  </CardContent>
                </Card>
                <Card className="bg-card/30">
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {conversations.reduce((sum, c) => sum + c.messageCount, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Messages</div>
                  </CardContent>
                </Card>
                <Card className="bg-card/30">
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {conversations.length > 0 ? getRelativeDate(conversations[conversations.length - 1].createdAt) : '-'}
                    </div>
                    <div className="text-sm text-muted-foreground">First Chat</div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </CinematicWrapper>
  );
};

export default MemoryTimeline;
