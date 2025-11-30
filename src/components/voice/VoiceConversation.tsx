import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceConversationProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  autoPlay?: boolean;
}

export function VoiceConversation({
  onTranscript,
  onResponse,
  autoPlay = false
}: VoiceConversationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(autoPlay);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
    } catch (error) {
      console.error('[Voice] Mic access error:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to STT
        const { data, error } = await supabase.functions.invoke('speech-to-text', {
          body: { audio: base64Audio }
        });

        if (error || !data?.text) {
          throw new Error('Transcription failed');
        }

        const transcribedText = data.text;
        console.log('[Voice] Transcribed:', transcribedText);
        
        if (onTranscript) {
          onTranscript(transcribedText);
        }

        toast({
          title: "Voice Input",
          description: `"${transcribedText.slice(0, 50)}${transcribedText.length > 50 ? '...' : ''}"`,
        });
      };
    } catch (error) {
      console.error('[Voice] Processing error:', error);
      toast({
        title: "Voice Processing Failed",
        description: "Could not process your voice input.",
        variant: "destructive",
      });
    }
  };

  const speakText = useCallback(async (text: string) => {
    if (!audioEnabled || !text) return;

    try {
      setIsSpeaking(true);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });

      if (error || !data?.audioContent) {
        throw new Error('TTS failed');
      }

      // Play audio
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();

    } catch (error) {
      console.error('[Voice] TTS error:', error);
      setIsSpeaking(false);
    }
  }, [audioEnabled]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isSpeaking}
      >
        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setAudioEnabled(!audioEnabled)}
        disabled={isRecording || isSpeaking}
      >
        {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </Button>
    </div>
  );
}
