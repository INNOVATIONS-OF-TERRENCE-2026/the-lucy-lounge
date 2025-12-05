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

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("lucy-router", {
        body: { 
          message: userMessage.content,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        },
      });

      if (fnError) {
        console.error("Edge function error:", fnError);
        setError("Lucy is overloaded. Try again in a moment.");
        return;
      }

      // Handle lucy-router response format: { ok, plan: { finalAnswer, steps } }
      let responseContent = "I'm here to help!";
      
      if (data?.plan?.finalAnswer) {
        responseContent = data.plan.finalAnswer;
      } else if (data?.response) {
        responseContent = data.response;
      } else if (data?.reply) {
        responseContent = data.reply;
      } else if (data?.error) {
        responseContent = data.plan?.finalAnswer || "I encountered an issue. Please try again.";
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseContent,
        createdAt: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setError("Network issue — check your connection.");
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
