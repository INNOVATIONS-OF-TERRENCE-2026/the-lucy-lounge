import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";

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
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToLatest = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToLatest();
  }, [messages, scrollToLatest]);

  const loadMessages = async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const saveMessage = async (convId: string, role: string, content: string) => {
    await supabase.from("messages").insert({
      conversation_id: convId,
      role,
      content,
    });
  };

  const processStreamingResponse = async (response: Response, convId: string) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    }

    if (fullResponse) {
      await saveMessage(convId, "assistant", fullResponse);
      setMessages((prev) => [...prev, { role: "assistant", content: fullResponse }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      let convId = conversationId;

      if (!convId) {
        const { data } = await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            title: userMessage.slice(0, 50),
          })
          .select()
          .single();

        convId = data.id;
        onConversationCreated(convId);
      }

      await saveMessage(convId!, "user", userMessage);
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Chat failed");
      }

      await processStreamingResponse(response, convId!);
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      toast({
        title: "Error",
        description: err.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen">
      <ScrollArea className="flex-1 px-4">
        {messages.map((m, i) => (
          <ChatMessage key={i} message={m} />
        ))}
        <div ref={scrollRef} />
      </ScrollArea>

      {error && <div className="text-red-500 p-2">{error}</div>}

      <div className="p-3 flex gap-2">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Lucy..." />
        <Button onClick={handleSend} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>
    </main>
  );
}
