import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  conversation_id?: string;
  created_at?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    userId: string,
    conversationId: string | null,
    onConversationCreated?: (id: string) => void
  ) => {
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    // Create user message locally first
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userContent,
      createdAt: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    let convId = conversationId;

    try {
      // Create conversation if needed
      if (!convId) {
        const { data } = await supabase
          .from('conversations')
          .insert({
            user_id: userId,
            title: userContent.slice(0, 50),
          })
          .select()
          .single();

        if (data) {
          convId = data.id;
          onConversationCreated?.(convId);
        }
      }

      // Save user message to database
      if (convId) {
        await supabase.from('messages').insert({
          conversation_id: convId,
          role: 'user',
          content: userContent,
        });
      }

      // Call Lucy router for AI response
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lucy-router`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            userId,
            messages: [...messages, userMsg].map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      const data = await res.json();

      // Extract response from various possible formats
      const reply =
        data?.plan?.finalAnswer ||
        data?.response ||
        data?.reply ||
        data?.message ||
        "I'm here with you 💚";

      // Create assistant message
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        createdAt: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);

      // Save assistant message to database
      if (convId) {
        await supabase.from('messages').insert({
          conversation_id: convId,
          role: 'assistant',
          content: reply,
        });
      }
    } catch (err) {
      console.error('Lucy chat error:', err);
      setError('Unable to reach Lucy. Please try again.');

      // Add error message
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having a moment. Please try again! 💜",
        createdAt: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const loadHistory = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs || []);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    loadHistory,
    clearMessages,
    setMessages,
  };
}
