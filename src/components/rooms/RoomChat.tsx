import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, ArrowLeft, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const RoomChat = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUser();
    loadRoom();
    loadMessages();
    loadParticipants();
    subscribeToMessages();
    subscribeToParticipants();
  }, [roomId]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadRoom = async () => {
    const { data } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (data) setRoom(data);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('room_messages')
      .select('*, profiles(name, email)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
    scrollToBottom();
  };

  const loadParticipants = async () => {
    const { data } = await supabase
      .from('room_participants')
      .select('*, profiles(name, email)')
      .eq('room_id', roomId);
    
    if (data) setParticipants(data);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', payload.new.user_id)
            .single();
          
          setMessages(prev => [...prev, { ...payload.new, profiles: profile }]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToParticipants = () => {
    const channel = supabase
      .channel(`room-participants-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const { error } = await supabase
      .from('room_messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        content: input.trim(),
      });

    if (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } else {
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen-dvh bg-background">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/rooms')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="font-semibold">{room?.name}</h2>
              <p className="text-sm text-muted-foreground">{room?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participants.length} members</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`p-3 max-w-[70%] ${
                msg.user_id === user?.id ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto'
              }`}
            >
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {msg.profiles?.name?.[0] || msg.profiles?.email?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">
                      {msg.profiles?.name || msg.profiles?.email?.split('@')[0] || 'Anonymous'}
                    </span>
                    <span className="text-xs opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            </Card>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={sendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Participants sidebar */}
      <div className="w-64 border-l p-4">
        <h3 className="font-semibold mb-4">Participants ({participants.length})</h3>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {participant.profiles?.name?.[0] || participant.profiles?.email?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {participant.profiles?.name || participant.profiles?.email?.split('@')[0] || 'Anonymous'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{participant.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
