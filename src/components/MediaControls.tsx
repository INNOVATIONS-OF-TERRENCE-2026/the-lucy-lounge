/**
 * THE LUCY LOUNGE - MEDIA CONTROLS COMPONENT
 * 
 * Gesture-gated media controls for voice input/output.
 * All media APIs are accessed ONLY after user gesture.
 * 
 * iOS Safari is the PRIMARY runtime.
 */

import React, { useState, useCallback, useRef } from 'react';
import { useUserGestureGate } from '@/hooks/useUserGestureGate';
import { audioEngineAdapter } from '@/media/AudioEngineAdapter';
import { videoEngineAdapter } from '@/media/VideoEngineAdapter';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TYPES
// ============================================================================

interface MediaControlsProps {
  onTranscription?: (text: string) => void;
  onAudioLevel?: (level: number) => void;
  className?: string;
}

interface AudioState {
  initialized: boolean;
  playing: boolean;
  volume: number;
  muted: boolean;
}

interface VideoState {
  initialized: boolean;
  active: boolean;
  facingMode: 'user' | 'environment';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MediaControls({
  onTranscription,
  onAudioLevel,
  className = '',
}: MediaControlsProps) {
  const { toast } = useToast();
  const { hasGesture, captureGesture, gestureToken } = useUserGestureGate();

  // Audio state
  const [audioState, setAudioState] = useState<AudioState>({
    initialized: false,
    playing: false,
    volume: 0.8,
    muted: false,
  });

  // Video state
  const [videoState, setVideoState] = useState<VideoState>({
    initialized: false,
    active: false,
    facingMode: 'user',
  });

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ============================================================================
  // AUDIO CONTROLS (GESTURE-GATED)
  // ============================================================================

  const initializeAudio = useCallback(async () => {
    if (!hasGesture || !gestureToken) {
      toast({
        title: 'Tap to enable audio',
        description: 'Touch the screen to enable audio playback.',
      });
      return false;
    }

    if (audioState.initialized) return true;

    try {
      const initialized = await audioEngineAdapter.initializeAudio(gestureToken);
      if (initialized) {
        setAudioState(prev => ({ ...prev, initialized: true }));
        return true;
      }
    } catch (error) {
      console.error('[MediaControls] Audio init error:', error);
      toast({
        title: 'Audio error',
        description: 'Could not initialize audio. Please try again.',
        variant: 'destructive',
      });
    }
    return false;
  }, [hasGesture, gestureToken, audioState.initialized, toast]);

  const togglePlay = useCallback(async () => {
    captureGesture();
    
    if (!audioState.initialized) {
      const success = await initializeAudio();
      if (!success) return;
    }

    setAudioState(prev => ({ ...prev, playing: !prev.playing }));
  }, [captureGesture, audioState.initialized, initializeAudio]);

  const setVolume = useCallback((value: number[]) => {
    const volume = value[0];
    setAudioState(prev => ({ ...prev, volume, muted: volume === 0 }));
    audioEngineAdapter.setVolume(volume);
  }, []);

  const toggleMute = useCallback(() => {
    setAudioState(prev => {
      const newMuted = !prev.muted;
      audioEngineAdapter.setVolume(newMuted ? 0 : prev.volume);
      return { ...prev, muted: newMuted };
    });
  }, []);

  // ============================================================================
  // VIDEO CONTROLS (GESTURE-GATED)
  // ============================================================================

  const toggleCamera = useCallback(async () => {
    captureGesture();

    if (!hasGesture || !gestureToken) {
      toast({
        title: 'Tap to enable camera',
        description: 'Touch the screen to enable camera access.',
      });
      return;
    }

    if (videoState.active) {
      // Stop camera
      videoEngineAdapter.stopCamera();
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setVideoState(prev => ({ ...prev, active: false }));
    } else {
      // Start camera
      setIsLoading(true);
      try {
        const stream = await videoEngineAdapter.requestCameraAccess(
          gestureToken,
          videoState.facingMode
        );

        if (stream && videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setVideoState(prev => ({ ...prev, initialized: true, active: true }));
        }
      } catch (error) {
        console.error('[MediaControls] Camera error:', error);
        toast({
          title: 'Camera error',
          description: 'Could not access camera. Please check permissions.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [captureGesture, hasGesture, gestureToken, videoState, toast]);

  const flipCamera = useCallback(async () => {
    if (!videoState.active) return;

    const newFacingMode = videoState.facingMode === 'user' ? 'environment' : 'user';
    setVideoState(prev => ({ ...prev, facingMode: newFacingMode }));

    // Restart camera with new facing mode
    if (gestureToken) {
      const stream = await videoEngineAdapter.requestCameraAccess(gestureToken, newFacingMode);
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    }
  }, [videoState, gestureToken]);

  // ============================================================================
  // VOICE RECORDING (GESTURE-GATED)
  // ============================================================================

  const startRecording = useCallback(async () => {
    captureGesture();

    if (!hasGesture) {
      toast({
        title: 'Tap to enable microphone',
        description: 'Touch the screen to enable voice recording.',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType,
        });
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());

        // Transcribe if handler provided
        if (onTranscription) {
          await transcribeAudio(audioBlob);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Setup audio level monitoring
      if (onAudioLevel) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!isRecording) return;
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          onAudioLevel(average / 255);
          requestAnimationFrame(updateLevel);
        };
        updateLevel();
      }

    } catch (error) {
      console.error('[MediaControls] Recording error:', error);
      toast({
        title: 'Microphone error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  }, [captureGesture, hasGesture, isRecording, onAudioLevel, onTranscription, toast]);

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
      const { supabase } = await import('@/integrations/supabase/client');
      
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

      // Call Whisper
      const { data, error } = await supabase.functions.invoke('ai-whisper', {
        body: { audio: base64Audio },
      });

      if (error || !data?.ok) {
        throw new Error(data?.error ?? 'Transcription failed');
      }

      onTranscription?.(data.text);

    } catch (error) {
      console.error('[MediaControls] Transcription error:', error);
      toast({
        title: 'Transcription failed',
        description: 'Could not transcribe audio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Audio Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          disabled={isLoading}
        >
          {audioState.playing ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </Button>

        <Button variant="ghost" size="icon">
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="icon">
          <SkipForward className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
        >
          {audioState.muted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </Button>

        <Slider
          value={[audioState.muted ? 0 : audioState.volume]}
          onValueChange={setVolume}
          max={1}
          step={0.01}
          className="w-24"
        />
      </div>

      {/* Voice Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={isRecording ? 'destructive' : 'outline'}
          size="icon"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>

        {isRecording && (
          <span className="text-sm text-destructive animate-pulse">
            ● Recording...
          </span>
        )}
      </div>

      {/* Camera Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={videoState.active ? 'destructive' : 'outline'}
          size="icon"
          onClick={toggleCamera}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : videoState.active ? (
            <CameraOff className="w-5 h-5" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
        </Button>

        {videoState.active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={flipCamera}
          >
            Flip Camera
          </Button>
        )}
      </div>

      {/* Video Preview */}
      {videoState.active && (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Gesture Status */}
      {!hasGesture && (
        <p className="text-xs text-muted-foreground text-center">
          Tap anywhere to enable media controls
        </p>
      )}
    </div>
  );
}

export default MediaControls;
