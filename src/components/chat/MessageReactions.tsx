import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
  count?: number;
  userReacted?: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  userId: string;
  className?: string;
}

const DEFAULT_EMOJIS = ['👍', '❤️', '🔥', '😂', '🤯'];

export const MessageReactions = ({ messageId, userId, className }: MessageReactionsProps) => {
  const [reactions, setReactions] = useState<Map<string, Reaction>>(new Map());
  const [showPicker, setShowPicker] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReactions();

    // Subscribe to reaction changes
    const channel = supabase
      .channel(`reactions-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`
        },
        () => {
          loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  const loadReactions = async () => {
    const { data } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId);

    if (data) {
      const reactionMap = new Map<string, Reaction>();
      
      data.forEach((r) => {
        const existing = reactionMap.get(r.emoji);
        if (existing) {
          existing.count = (existing.count || 0) + 1;
          if (r.user_id === userId) {
            existing.userReacted = true;
            existing.id = r.id;
          }
        } else {
          reactionMap.set(r.emoji, {
            id: r.id,
            emoji: r.emoji,
            user_id: r.user_id,
            count: 1,
            userReacted: r.user_id === userId
          });
        }
      });

      setReactions(reactionMap);
    }
  };

  const toggleReaction = async (emoji: string) => {
    const existing = reactions.get(emoji);

    if (existing?.userReacted) {
      // Remove reaction
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove reaction',
          variant: 'destructive'
        });
      }
    } else {
      // Add reaction
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: userId,
          emoji
        });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add reaction',
          variant: 'destructive'
        });
      }
    }

    setShowPicker(false);
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Existing reactions */}
      {Array.from(reactions.values()).map((reaction) => (
        <Button
          key={reaction.emoji}
          variant="ghost"
          size="sm"
          onClick={() => toggleReaction(reaction.emoji)}
          className={cn(
            'h-8 px-2 rounded-full glass-card border transition-all duration-200',
            reaction.userReacted
              ? 'border-primary/60 bg-primary/10 shadow-glow-violet scale-105'
              : 'border-border/30 hover:border-primary/40 hover:scale-105'
          )}
        >
          <span className="text-base mr-1">{reaction.emoji}</span>
          <span className="text-xs font-medium">{reaction.count}</span>
        </Button>
      ))}

      {/* Reaction picker */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPicker(!showPicker)}
          className="h-8 w-8 rounded-full glass-card border border-border/30 hover:border-primary/40 hover:scale-105 transition-all duration-200 p-0"
        >
          <span className="text-lg">+</span>
        </Button>

        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 p-2 glass-card-enhanced rounded-xl border border-primary/30 shadow-glow-violet flex gap-1 z-50 animate-scale-in">
            {DEFAULT_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => toggleReaction(emoji)}
                className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:scale-110 transition-all duration-200"
              >
                <span className="text-xl">{emoji}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
