import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ChatMessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: number;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("lucy-router", {
        body: {
          message: userMessage.content,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (fnError) {
        console.error("Lucy router error:", fnError);
        setError("Lucy is having trouble — try again shortly.");
        return;
      }

      // 💚 Universal Response Decoder — NEVER allows silence
      const responseContent =
        data?.plan?.finalAnswer ||
        data?.choices?.[0]?.message?.content ||
        data?.content ||
        data?.response ||
        data?.reply ||
        data?.result ||
        data?.message ||
        "Lucy is listening — say that again?";

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseContent,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Network / Invoke Error:", err);
      setError("Network issue — please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return { messages, input, setInput, isLoading, error, sendMessage, clearMessages };
}
