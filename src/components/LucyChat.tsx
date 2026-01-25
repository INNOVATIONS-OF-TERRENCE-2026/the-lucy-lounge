/**
 * THE LUCY LOUNGE - LUCY CHAT COMPONENT
 * 
 * Production-ready chat interface that integrates:
 * - Multi-model AI (via agentOrchestrator)
 * - Gesture-gated voice input/output
 * - Memory persistence
 * - Mobile-safe media handling
 * 
 * iOS Safari is the PRIMARY runtime - all media is gesture-gated.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useUserGestureGate } from '@/hooks/useUserGestureGate';
import { agentOrchestrator, type AgentMode, type OrchestratorResponse } from '@/ai';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Loader2,
  Sparkles,
  Brain,
  Music,
  Code,
  Search,
  Image as ImageIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: AgentMode;
  audioUrl?: string;
}

interface LucyChatProps {
  userId: string;
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
  className?: string;
}

// ============================================================================
// MODE ICONS
// ============================================================================

const MODE_ICONS: Record<AgentMode, React.ReactNode> = {
  chat: <Sparkles className="w-4 h-4" />,
  music: <Music className="w-4 h-4" />,
  vision: <ImageIcon className="w-4 h-4" />,
  dev: <Code className="w-4 h-4" />,
  research: <Search className="w-4 h-4" />,
  memory: <Brain className="w-4 h-4" />,
  creative: <Sparkles className="w-4 h-4" />,
  document: <Search className="w-4 h-4" />,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function LucyChat({ 
  userId, 
  conversationId,
  onConversationCreated,
  className = '',
}: LucyChatProps) {
  const { toast } = useToast();
  const { hasGesture, captureGesture } = useUserGestureGate();
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentMode, setCurrentMode] = useState<AgentMode>('chat');

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ============================================================================
  // VOICE INPUT (GESTURE-GATED)
  // ============================================================================

  const startRecording = useCallback(async () => {
    // Must have gesture token for microphone access
    if (!hasGesture) {
      toast({
        title: 'Tap to enable voice',
        description: 'Touch the screen first to enable microphone access.',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('[LucyChat] Recording error:', error);
      toast({
        title: 'Microphone error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  }, [hasGesture, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      // Call Whisper edge function
      const { data, error } = await supabase.functions.invoke('ai-whisper', {
        body: { audio: base64Audio },
      });

      if (error || !data?.ok) {
        throw new Error(data?.error ?? 'Transcription failed');
      }

      // Set transcribed text as input
      setInput(data.text);
      inputRef.current?.focus();
    } catch (error) {
      console.error('[LucyChat] Transcription error:', error);
      toast({
        title: 'Transcription failed',
        description: 'Could not transcribe audio. Please try typing instead.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // VOICE OUTPUT (GESTURE-GATED)
  // ============================================================================

  const speakText = useCallback(async (text: string) => {
    // Must have gesture token for audio playback
    if (!hasGesture) {
      console.warn('[LucyChat] Cannot speak without gesture token');
      return;
    }

    setIsSpeaking(true);
    try {
      // Call TTS edge function
      const { data, error } = await supabase.functions.invoke('ai-tts', {
        body: { text, voice: 'lucy' },
      });

      if (error || !data?.ok) {
        throw new Error(data?.error ?? 'TTS failed');
      }

      // Create AudioContext if needed (must be after gesture)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Decode and play audio
      const audioData = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData.buffer);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();

    } catch (error) {
      console.error('[LucyChat] TTS error:', error);
      setIsSpeaking(false);
    }
  }, [hasGesture]);

  // ============================================================================
  // SEND MESSAGE
  // ============================================================================

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Capture gesture on send (user interaction)
    captureGesture();

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call agent orchestrator
      const response: OrchestratorResponse = await agentOrchestrator.orchestrate({
        message: trimmedInput,
        userId,
        conversationId,
        mode: 'auto',
      });

      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        mode: response.mode,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentMode(response.mode);

      // Speak response if voice enabled
      if (voiceEnabled && hasGesture) {
        await speakText(response.response);
      }

    } catch (error) {
      console.error('[LucyChat] Send error:', error);
      toast({
        title: 'Message failed',
        description: 'Could not send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Sparkles className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Hi, I'm Lucy</p>
            <p className="text-sm">How can I help you today?</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.role === 'assistant' && message.mode && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  {MODE_ICONS[message.mode]}
                  <span className="capitalize">{message.mode}</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-2">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          {/* Voice Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="shrink-0"
          >
            {voiceEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>

          {/* Voice Input */}
          <Button
            variant={isRecording ? 'destructive' : 'ghost'}
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className="shrink-0"
          >
            {isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>

          {/* Text Input */}
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Lucy..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            disabled={isLoading}
          />

          {/* Send Button */}
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mode Indicator */}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          {MODE_ICONS[currentMode]}
          <span className="capitalize">{currentMode} mode</span>
          {isSpeaking && <span className="text-primary">● Speaking</span>}
        </div>
      </div>
    </div>
  );
}

export default LucyChat;
