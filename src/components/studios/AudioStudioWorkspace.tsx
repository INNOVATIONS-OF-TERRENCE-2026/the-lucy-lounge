/**
 * THE LUCY LOUNGE - Audio Studio with Smart Generation
 * 
 * UNIFIED AUDIO GENERATION:
 * - Single prompt box - Lucy decides Music vs Voice
 * - Music → HuggingFace MusicGen (FREE)
 * - Voice → ElevenLabs TTS (speech only)
 * 
 * FEATURES:
 * - Realtime status updates via Supabase postgres_changes
 * - Lucy Brain memory integration for cross-studio intelligence
 * - Animated waveform progress visualization
 * - iOS Safari compatible with proper gesture gating
 * 
 * Users see "Lucy AI" - no provider details exposed.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useIOSAudioUnlock } from '@/hooks/useIOSAudioUnlock';
import { useLucyBrainMemory } from '@/hooks/useLucyBrainMemory';
import { recordAudioGeneration } from '@/lib/lucyBrainSync';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { 
  Music, 
  Mic, 
  Settings2, 
  FolderOpen, 
  Play, 
  Pause, 
  Download,
  Loader2,
  Wand2,
  Volume2,
  Sliders,
  Save,
  Trash2,
  FileAudio,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Zap,
  Radio,
} from 'lucide-react';

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

// Music styles
const MUSIC_STYLES = [
  { id: 'lofi', label: 'Lo-Fi', emoji: '🎧' },
  { id: 'ambient', label: 'Ambient', emoji: '🌌' },
  { id: 'hiphop', label: 'Hip-Hop', emoji: '🎤' },
  { id: 'cinematic', label: 'Cinematic', emoji: '🎬' },
  { id: 'electronic', label: 'Electronic', emoji: '⚡' },
  { id: 'jazz', label: 'Jazz', emoji: '🎷' },
  { id: 'classical', label: 'Classical', emoji: '🎻' },
  { id: 'rock', label: 'Rock', emoji: '🎸' },
] as const;

// ElevenLabs voices
const VOICES = [
  { id: 'rachel', label: 'Rachel', desc: 'Warm, friendly female' },
  { id: 'domi', label: 'Domi', desc: 'Strong, confident female' },
  { id: 'bella', label: 'Bella', desc: 'Soft, young female' },
  { id: 'antoni', label: 'Antoni', desc: 'Well-rounded male' },
  { id: 'josh', label: 'Josh', desc: 'Deep, narrative male' },
  { id: 'adam', label: 'Adam', desc: 'Deep male' },
  { id: 'sam', label: 'Sam', desc: 'Dynamic male' },
] as const;

type MusicStyle = typeof MUSIC_STYLES[number]['id'];
type VoiceId = typeof VOICES[number]['id'];

interface AudioGeneration {
  id: string;
  type: 'music' | 'voice';
  prompt: string;
  style?: string;
  voice?: string;
  audioUrl: string;
  status: 'queued' | 'running' | 'success' | 'error';
  error?: string;
  createdAt: Date;
  autoDetected?: boolean;
}

// =============================================================================
// ANIMATED WAVEFORM COMPONENT
// =============================================================================

function AnimatedWaveform({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary rounded-full"
          animate={isActive ? {
            height: [8, 24, 12, 32, 16, 28, 8],
          } : { height: 8 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AudioStudioWorkspace() {
  const { toast } = useToast();
  const { isUnlocked, unlockAudio } = useIOSAudioUnlock();
  
  // Lucy Brain integration
  const { storeMemory, preferences, updatePreference } = useLucyBrainMemory('audio');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('smart');
  
  // Smart Generate state (unified prompt)
  const [smartPrompt, setSmartPrompt] = useState('');
  const [isGeneratingSmart, setIsGeneratingSmart] = useState(false);
  const [smartProgress, setSmartProgress] = useState(0);
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
  
  // Music state (manual mode)
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicStyle, setMusicStyle] = useState<MusicStyle>(
    (preferences?.musicStyles?.[0] as MusicStyle) || 'lofi'
  );
  const [musicDuration, setMusicDuration] = useState(10);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  
  // Voice state (manual mode)
  const [voiceText, setVoiceText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>('rachel');
  const [voiceStyle, setVoiceStyle] = useState('default');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  
  // Audio FX state
  const [fxVolume, setFxVolume] = useState(80);
  const [fxReverb, setFxReverb] = useState(30);
  const [fxBass, setFxBass] = useState(50);
  const [fxTreble, setFxTreble] = useState(50);
  
  // Generation history state
  const [generations, setGenerations] = useState<AudioGeneration[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  // Playback state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});
  
  // Realtime subscription ref
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  // =============================================================================
  // REALTIME SUBSCRIPTION FOR STATUS UPDATES
  // =============================================================================

  useEffect(() => {
    let mounted = true;

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id || !mounted) return;

      // Clean up existing channel
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }

      // Subscribe to audio_generations changes for this user
      const channel = supabase
        .channel(`audio-generations-${session.user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'audio_generations',
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            if (!mounted) return;
            
            const { eventType, new: newRow, old: oldRow } = payload;
            
            console.log(`[AudioStudio Realtime] ${eventType}:`, newRow || oldRow);

            if (eventType === 'INSERT') {
              // New generation started
              const gen = newRow as any;
              const mapped: AudioGeneration = {
                id: gen.id,
                type: gen.generation_type as 'music' | 'voice',
                prompt: gen.prompt,
                style: gen.generation_type === 'music' ? gen.style : undefined,
                voice: gen.generation_type === 'voice' ? gen.metadata?.voice : undefined,
                audioUrl: gen.public_url || '',
                status: gen.status,
                error: gen.error,
                createdAt: new Date(gen.created_at),
                autoDetected: gen.metadata?.autoDetected,
              };
              
              setGenerations(prev => {
                // Avoid duplicates
                if (prev.some(g => g.id === mapped.id)) return prev;
                return [mapped, ...prev];
              });
            } 
            else if (eventType === 'UPDATE') {
              // Generation status changed
              const gen = newRow as any;
              
              setGenerations(prev => prev.map(g => {
                if (g.id !== gen.id) return g;
                
                return {
                  ...g,
                  status: gen.status,
                  audioUrl: gen.public_url || g.audioUrl,
                  error: gen.error,
                };
              }));

              // If this is the active generation and it completed
              if (gen.id === activeGenerationId) {
                if (gen.status === 'success') {
                  setSmartProgress(100);
                  setMusicProgress(100);
                  
                  // Show success toast
                  toast({
                    title: gen.generation_type === 'music' ? '🎵 Music Ready!' : '🎤 Voice Ready!',
                    description: 'Your audio has been generated successfully.',
                  });
                  
                  // Reset generating states
                  setTimeout(() => {
                    setIsGeneratingSmart(false);
                    setIsGeneratingMusic(false);
                    setIsGeneratingVoice(false);
                    setSmartProgress(0);
                    setMusicProgress(0);
                    setActiveGenerationId(null);
                  }, 500);
                  
                } else if (gen.status === 'error') {
                  toast({
                    title: 'Generation Failed',
                    description: gen.error || 'Something went wrong',
                    variant: 'destructive',
                  });
                  
                  setIsGeneratingSmart(false);
                  setIsGeneratingMusic(false);
                  setIsGeneratingVoice(false);
                  setSmartProgress(0);
                  setMusicProgress(0);
                  setActiveGenerationId(null);
                }
              }
            }
            else if (eventType === 'DELETE') {
              const gen = oldRow as any;
              setGenerations(prev => prev.filter(g => g.id !== gen.id));
            }
          }
        )
        .subscribe((status) => {
          console.log('[AudioStudio Realtime] Subscription status:', status);
        });

      realtimeChannelRef.current = channel;
    };

    setupRealtime();

    return () => {
      mounted = false;
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [activeGenerationId, toast]);

  // =============================================================================
  // LOAD GENERATION HISTORY
  // =============================================================================

  const loadGenerationHistory = useCallback(async () => {
    try {
      setHistoryError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoadingHistory(false);
        return;
      }

      const { data, error } = await supabase
        .from('audio_generations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[AudioStudio] Failed to load history:', error);
        setHistoryError('Failed to load generation history');
        return;
      }

      if (data) {
        const mapped: AudioGeneration[] = data.map((row: any) => ({
          id: row.id,
          type: row.generation_type as 'music' | 'voice',
          prompt: row.prompt,
          style: row.generation_type === 'music' ? row.style : undefined,
          voice: row.generation_type === 'voice' ? row.metadata?.voice : undefined,
          audioUrl: row.public_url || '',
          status: row.status,
          error: row.error,
          createdAt: new Date(row.created_at),
          autoDetected: row.metadata?.autoDetected,
        }));
        setGenerations(mapped);
      }
    } catch (err) {
      console.error('[AudioStudio] Load history error:', err);
      setHistoryError('Failed to load generation history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    loadGenerationHistory();
  }, [loadGenerationHistory]);

  // =============================================================================
  // SMART GENERATE (Lucy decides)
  // =============================================================================

  const handleSmartGenerate = async () => {
    if (!smartPrompt.trim()) {
      toast({
        title: 'Enter a prompt',
        description: 'Describe what you want Lucy to create',
        variant: 'destructive',
      });
      return;
    }

    // Ensure audio is unlocked (iOS Safari)
    if (!isUnlocked) {
      await unlockAudio();
    }

    setIsGeneratingSmart(true);
    setSmartProgress(10);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Please sign in to generate audio');
      }

      // Call Edge Function with type: 'auto' - Lucy decides
      const { data, error } = await supabase.functions.invoke('lucy-audio-generate', {
        body: {
          type: 'auto',
          prompt: smartPrompt.trim(),
        },
      });

      if (error) {
        throw new Error(error.message || 'Generation failed');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Generation failed');
      }

      // Track the active generation for realtime updates
      setActiveGenerationId(data.generationId);
      setSmartProgress(30);

      // Lucy Brain: Store memory and learn preference
      await recordAudioGeneration(
        smartPrompt.trim(),
        data.type === 'music' ? (data.style || 'custom') : 'voice',
        data.generationId
      );
      
      // Store as memory
      await storeMemory(
        `Created ${data.type}: "${smartPrompt.trim().slice(0, 50)}..."`,
        'creation',
        0.7
      );

      // If realtime doesn't update quickly, the response has the URL
      if (data.audioUrl) {
        // Immediately add to generations if we got a URL back
        const newGeneration: AudioGeneration = {
          id: data.generationId,
          type: data.type,
          prompt: smartPrompt.trim(),
          style: data.type === 'music' ? data.style : undefined,
          voice: data.type === 'voice' ? data.voice : undefined,
          audioUrl: data.audioUrl,
          status: 'success',
          createdAt: new Date(),
          autoDetected: data.autoDetected,
        };
        
        setGenerations(prev => {
          if (prev.some(g => g.id === newGeneration.id)) return prev;
          return [newGeneration, ...prev];
        });

        setSmartProgress(100);
        
        toast({
          title: data.type === 'music' ? '🎵 Music Generated!' : '🎤 Voice Generated!',
          description: `Lucy created ${data.type === 'music' ? 'a ' + (data.style || 'custom') + ' track' : 'voice audio'} for you`,
        });

        setSmartPrompt('');
        
        setTimeout(() => {
          setIsGeneratingSmart(false);
          setSmartProgress(0);
          setActiveGenerationId(null);
        }, 500);
      }

    } catch (err) {
      console.error('[AudioStudio] Smart generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setIsGeneratingSmart(false);
      setSmartProgress(0);
      setActiveGenerationId(null);
    }
  };

  // =============================================================================
  // MANUAL AUDIO GENERATION
  // =============================================================================

  const generateAudio = async (type: 'music' | 'voice') => {
    const isMusic = type === 'music';
    const prompt = isMusic ? musicPrompt : voiceText;

    if (!prompt.trim()) {
      toast({
        title: isMusic ? 'Enter a prompt' : 'Enter text',
        description: isMusic ? 'Describe the music you want to create' : 'Enter the text you want spoken',
        variant: 'destructive',
      });
      return;
    }

    // Ensure audio is unlocked (iOS Safari)
    if (!isUnlocked) {
      await unlockAudio();
    }

    if (isMusic) {
      setIsGeneratingMusic(true);
      setMusicProgress(10);
    } else {
      setIsGeneratingVoice(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Please sign in to generate audio');
      }

      // Call the Edge Function with explicit type
      const { data, error } = await supabase.functions.invoke('lucy-audio-generate', {
        body: {
          type,
          prompt: prompt.trim(),
          ...(isMusic ? {
            style: musicStyle,
            duration: musicDuration,
          } : {
            voice: selectedVoice,
            voiceStyle,
          }),
        },
      });

      if (error) {
        throw new Error(error.message || 'Generation failed');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Generation failed');
      }

      // Track generation for realtime updates
      setActiveGenerationId(data.generationId);
      if (isMusic) setMusicProgress(30);

      // Lucy Brain: Record and learn
      await recordAudioGeneration(
        prompt.trim(),
        isMusic ? musicStyle : 'voice',
        data.generationId
      );

      // Learn music style preference
      if (isMusic) {
        await updatePreference('musicStyles', [musicStyle]);
      }

      // If we got a URL immediately
      if (data.audioUrl) {
        const newGeneration: AudioGeneration = {
          id: data.generationId,
          type,
          prompt: prompt.trim(),
          style: isMusic ? musicStyle : undefined,
          voice: !isMusic ? selectedVoice : undefined,
          audioUrl: data.audioUrl,
          status: 'success',
          createdAt: new Date(),
          autoDetected: false,
        };
        
        setGenerations(prev => {
          if (prev.some(g => g.id === newGeneration.id)) return prev;
          return [newGeneration, ...prev];
        });

        if (isMusic) setMusicProgress(100);
        
        toast({
          title: isMusic ? '🎵 Music Generated!' : '🎤 Voice Generated!',
          description: isMusic 
            ? `${MUSIC_STYLES.find(s => s.id === musicStyle)?.label} track created by Lucy`
            : `${VOICES.find(v => v.id === selectedVoice)?.label} voice created by Lucy`,
        });

        // Clear input
        if (isMusic) {
          setMusicPrompt('');
        } else {
          setVoiceText('');
        }

        setTimeout(() => {
          setIsGeneratingMusic(false);
          setIsGeneratingVoice(false);
          setMusicProgress(0);
          setActiveGenerationId(null);
        }, 500);
      }

    } catch (err) {
      console.error('[AudioStudio] Generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setIsGeneratingMusic(false);
      setIsGeneratingVoice(false);
      setMusicProgress(0);
      setActiveGenerationId(null);
    }
  };

  // =============================================================================
  // AUDIO PLAYBACK (iOS Safari compatible)
  // =============================================================================

  const togglePlay = useCallback(async (generation: AudioGeneration) => {
    if (generation.status !== 'success' || !generation.audioUrl) return;

    // Ensure audio is unlocked first
    if (!isUnlocked) {
      await unlockAudio();
    }

    // Stop current playback
    if (playingId && audioElementsRef.current[playingId]) {
      audioElementsRef.current[playingId].pause();
      audioElementsRef.current[playingId].currentTime = 0;
    }

    // If clicking the same track, just stop
    if (playingId === generation.id) {
      setPlayingId(null);
      return;
    }

    // Get or create audio element
    let audio = audioElementsRef.current[generation.id];
    if (!audio) {
      audio = new Audio();
      audio.preload = 'auto';
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => {
        toast({
          title: 'Playback Error',
          description: 'Failed to play audio. The file may have expired.',
          variant: 'destructive',
        });
        setPlayingId(null);
      };
      audioElementsRef.current[generation.id] = audio;
    }

    // Set source and play
    if (audio.src !== generation.audioUrl) {
      audio.src = generation.audioUrl;
    }

    try {
      await audio.play();
      setPlayingId(generation.id);
    } catch (err) {
      console.error('[AudioStudio] Play error:', err);
      toast({
        title: 'Playback Error',
        description: 'Could not play audio. Please try again.',
        variant: 'destructive',
      });
    }
  }, [playingId, isUnlocked, unlockAudio, toast]);

  // =============================================================================
  // DOWNLOAD
  // =============================================================================

  const downloadAudio = async (generation: AudioGeneration) => {
    if (!generation.audioUrl) return;

    try {
      const response = await fetch(generation.audioUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lucy_${generation.type}_${Date.now()}.${generation.type === 'voice' ? 'mp3' : 'wav'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: 'Downloaded!', description: 'Audio saved to your device' });
    } catch (err) {
      console.error('[AudioStudio] Download error:', err);
      toast({ title: 'Download failed', description: 'Could not download the audio file', variant: 'destructive' });
    }
  };

  // =============================================================================
  // DELETE
  // =============================================================================

  const deleteGeneration = async (id: string) => {
    // Stop playback if playing
    if (playingId === id) {
      audioElementsRef.current[id]?.pause();
      setPlayingId(null);
    }

    try {
      const { error } = await supabase
        .from('audio_generations')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Realtime will handle removing from state
      delete audioElementsRef.current[id];
      
      toast({ title: 'Deleted', description: 'Audio removed from your projects' });
    } catch (err) {
      console.error('[AudioStudio] Delete error:', err);
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  // =============================================================================
  // RETRY FAILED GENERATION
  // =============================================================================

  const retryGeneration = async (generation: AudioGeneration) => {
    if (generation.type === 'music') {
      setMusicPrompt(generation.prompt);
      if (generation.style) setMusicStyle(generation.style as MusicStyle);
      setActiveTab('music');
    } else {
      setVoiceText(generation.prompt);
      if (generation.voice) setSelectedVoice(generation.voice as VoiceId);
      setActiveTab('voice');
    }
    
    // Delete the failed one
    await deleteGeneration(generation.id);
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 mb-8">
          <TabsTrigger value="smart" className="gap-2">
            <Zap className="w-4 h-4" />
            Smart
          </TabsTrigger>
          <TabsTrigger value="music" className="gap-2">
            <Music className="w-4 h-4" />
            Music
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="w-4 h-4" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="fx" className="gap-2">
            <Settings2 className="w-4 h-4" />
            FX
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Projects
          </TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* SMART GENERATE TAB - Lucy decides */}
        {/* ================================================================= */}
        <TabsContent value="smart" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Lucy Audio Studio
                </CardTitle>
                <CardDescription>
                  Just describe what you want. Lucy will automatically create music or voice.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Unified prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">What would you like Lucy to create?</label>
                  <Textarea
                    placeholder="Examples:
• &quot;Create a chill lo-fi beat for studying&quot;
• &quot;Read this message in a warm voice: Hello, welcome to our app!&quot;
• &quot;Epic cinematic music for a trailer&quot;
• &quot;Say: The meeting starts at 3pm today&quot;"
                    value={smartPrompt}
                    onChange={(e) => setSmartPrompt(e.target.value)}
                    className="min-h-[140px]"
                    disabled={isGeneratingSmart}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lucy will detect if you want music or voice and use the right engine.
                  </p>
                </div>

                {/* Progress with animated waveform */}
                {isGeneratingSmart && (
                  <div className="space-y-4 py-4">
                    <AnimatedWaveform isActive={true} />
                    <Progress value={smartProgress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                      <Radio className="w-4 h-4 animate-pulse text-primary" />
                      {smartProgress < 30 ? 'Starting generation...' : 
                       smartProgress < 70 ? 'Lucy is creating your audio...' : 
                       smartProgress < 100 ? 'Finalizing...' : 'Complete!'}
                    </p>
                  </div>
                )}

                {/* Generate button */}
                <Button
                  className="w-full gap-2 h-12 text-lg"
                  size="lg"
                  onClick={handleSmartGenerate}
                  disabled={isGeneratingSmart || !smartPrompt.trim()}
                >
                  {isGeneratingSmart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate with Lucy
                    </>
                  )}
                </Button>

                {/* Quick examples */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Quick prompts:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => setSmartPrompt('Create a relaxing lo-fi hip hop beat for studying')}
                    >
                      🎧 Lo-fi study beat
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => setSmartPrompt('Epic cinematic orchestral music for a movie trailer')}
                    >
                      🎬 Cinematic trailer
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => setSmartPrompt('Say in a warm friendly voice: Welcome to The Lucy Lounge, your personal AI companion!')}
                    >
                      🎤 Welcome message
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => setSmartPrompt('Ambient peaceful music with floating synths for meditation')}
                    >
                      🌌 Ambient meditation
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ================================================================= */}
        {/* MUSIC TAB (Manual mode) */}
        {/* ================================================================= */}
        <TabsContent value="music" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" />
                  Music Generator
                </CardTitle>
                <CardDescription>
                  Create original music. Select a style and describe your track.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Describe your music</label>
                  <Textarea
                    placeholder="e.g., Relaxing piano melody with soft strings, perfect for studying..."
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    className="min-h-[100px]"
                    disabled={isGeneratingMusic}
                  />
                </div>

                {/* Style selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Style</label>
                  <div className="grid grid-cols-4 gap-2">
                    {MUSIC_STYLES.map((style) => (
                      <Button
                        key={style.id}
                        variant={musicStyle === style.id ? 'default' : 'outline'}
                        className="h-auto py-3 flex-col gap-1"
                        onClick={() => setMusicStyle(style.id)}
                        disabled={isGeneratingMusic}
                      >
                        <span className="text-xl">{style.emoji}</span>
                        <span className="text-xs">{style.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration: {musicDuration}s</label>
                  <Slider
                    value={[musicDuration]}
                    onValueChange={([val]) => setMusicDuration(val)}
                    min={5}
                    max={30}
                    step={5}
                    disabled={isGeneratingMusic}
                  />
                </div>

                {/* Progress with waveform */}
                {isGeneratingMusic && (
                  <div className="space-y-4 py-4">
                    <AnimatedWaveform isActive={true} />
                    <Progress value={musicProgress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      Generating music... {musicProgress}%
                    </p>
                  </div>
                )}

                {/* Generate button */}
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => generateAudio('music')}
                  disabled={isGeneratingMusic || !musicPrompt.trim()}
                >
                  {isGeneratingMusic ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Music
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ================================================================= */}
        {/* VOICE TAB (Manual mode) */}
        {/* ================================================================= */}
        <TabsContent value="voice" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-orange-500" />
                  Voice Studio
                </CardTitle>
                <CardDescription>
                  Convert text to natural speech. Choose a voice and style.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Text to speak</label>
                  <Textarea
                    placeholder="Enter the text you want converted to speech..."
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    className="min-h-[120px]"
                    disabled={isGeneratingVoice}
                    maxLength={5000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {voiceText.length}/5000 characters
                  </p>
                </div>

                {/* Voice selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {VOICES.map((voice) => (
                      <Button
                        key={voice.id}
                        variant={selectedVoice === voice.id ? 'default' : 'outline'}
                        className="h-auto py-3 flex-col gap-0.5"
                        onClick={() => setSelectedVoice(voice.id)}
                        disabled={isGeneratingVoice}
                      >
                        <span className="font-medium">{voice.label}</span>
                        <span className="text-xs opacity-70">{voice.desc}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Style</label>
                  <Select value={voiceStyle} onValueChange={setVoiceStyle} disabled={isGeneratingVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                      <SelectItem value="expressive">Expressive</SelectItem>
                      <SelectItem value="narrative">Narrative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate */}
                <Button
                  className="w-full gap-2 bg-orange-500 hover:bg-orange-600"
                  size="lg"
                  onClick={() => generateAudio('voice')}
                  disabled={isGeneratingVoice || !voiceText.trim()}
                >
                  {isGeneratingVoice ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      Generate Voice
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ================================================================= */}
        {/* AUDIO FX TAB */}
        {/* ================================================================= */}
        <TabsContent value="fx" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-cyan-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-cyan-500" />
                  Audio Effects
                </CardTitle>
                <CardDescription>
                  Adjust playback settings and effects.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Volume */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Master Volume
                    </label>
                    <span className="text-sm text-muted-foreground">{fxVolume}%</span>
                  </div>
                  <Slider
                    value={[fxVolume]}
                    onValueChange={([val]) => setFxVolume(val)}
                    max={100}
                  />
                </div>

                {/* Reverb */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Reverb</label>
                    <span className="text-sm text-muted-foreground">{fxReverb}%</span>
                  </div>
                  <Slider
                    value={[fxReverb]}
                    onValueChange={([val]) => setFxReverb(val)}
                    max={100}
                  />
                </div>

                {/* Bass */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Bass</label>
                    <span className="text-sm text-muted-foreground">{fxBass}%</span>
                  </div>
                  <Slider
                    value={[fxBass]}
                    onValueChange={([val]) => setFxBass(val)}
                    max={100}
                  />
                </div>

                {/* Treble */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Treble</label>
                    <span className="text-sm text-muted-foreground">{fxTreble}%</span>
                  </div>
                  <Slider
                    value={[fxTreble]}
                    onValueChange={([val]) => setFxTreble(val)}
                    max={100}
                  />
                </div>

                {/* Presets */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Quick Presets</label>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => { setFxVolume(80); setFxReverb(20); setFxBass(60); setFxTreble(50); }}
                    >
                      Balanced
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => { setFxVolume(85); setFxReverb(40); setFxBass(40); setFxTreble(60); }}
                    >
                      Bright
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => { setFxVolume(90); setFxReverb(15); setFxBass(80); setFxTreble(40); }}
                    >
                      Bass Boost
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => { setFxVolume(75); setFxReverb(60); setFxBass(50); setFxTreble(45); }}
                    >
                      Ambient
                    </Badge>
                  </div>
                </div>

                <Button className="w-full gap-2" variant="outline">
                  <Save className="w-4 h-4" />
                  Save Preset
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ================================================================= */}
        {/* PROJECTS TAB */}
        {/* ================================================================= */}
        <TabsContent value="projects" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" />
                      Your Audio Projects
                    </CardTitle>
                    <CardDescription>
                      Play, download, or delete your generated audio
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{generations.filter(g => g.status === 'success').length} items</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={loadGenerationHistory}
                      disabled={isLoadingHistory}
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Loading state */}
                {isLoadingHistory && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* Error state */}
                {historyError && !isLoadingHistory && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 mx-auto text-destructive/50 mb-4" />
                    <p className="text-muted-foreground">{historyError}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={loadGenerationHistory}
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Empty state */}
                {!isLoadingHistory && !historyError && generations.length === 0 && (
                  <div className="text-center py-12">
                    <FileAudio className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No audio generated yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use the Smart tab to create music or voice
                    </p>
                  </div>
                )}

                {/* Generation list */}
                {!isLoadingHistory && !historyError && generations.length > 0 && (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {generations.map((generation) => (
                        <motion.div
                          key={generation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                            generation.status === 'error' 
                              ? 'bg-destructive/5 border-destructive/20' 
                              : generation.status === 'running'
                              ? 'bg-primary/5 border-primary/20'
                              : 'bg-card hover:bg-muted/50'
                          }`}
                        >
                          {/* Play button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={() => togglePlay(generation)}
                            disabled={generation.status !== 'success'}
                          >
                            {generation.status === 'running' || generation.status === 'queued' ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : generation.status === 'error' ? (
                              <AlertCircle className="w-5 h-5 text-destructive" />
                            ) : playingId === generation.id ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </Button>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {generation.type === 'music' ? (
                                <Music className="w-4 h-4 text-primary shrink-0" />
                              ) : (
                                <Mic className="w-4 h-4 text-orange-500 shrink-0" />
                              )}
                              <span className="font-medium truncate">
                                {generation.prompt.length > 50 
                                  ? `${generation.prompt.substring(0, 50)}...` 
                                  : generation.prompt}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {generation.type === 'music' 
                                  ? MUSIC_STYLES.find(s => s.id === generation.style)?.label || generation.style
                                  : VOICES.find(v => v.id === generation.voice)?.label || generation.voice || 'Voice'}
                              </Badge>
                              {generation.autoDetected && (
                                <Badge variant="outline" className="text-xs">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Auto
                                </Badge>
                              )}
                              {(generation.status === 'running' || generation.status === 'queued') && (
                                <Badge variant="default" className="text-xs animate-pulse">
                                  <Radio className="w-3 h-3 mr-1" />
                                  {generation.status === 'queued' ? 'Queued' : 'Generating'}
                                </Badge>
                              )}
                              {generation.status === 'error' && (
                                <Badge variant="destructive" className="text-xs">
                                  Failed
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {generation.createdAt.toLocaleString()}
                              </span>
                            </div>
                            {generation.error && (
                              <p className="text-xs text-destructive mt-1">{generation.error}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {generation.status === 'success' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => downloadAudio(generation)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            {generation.status === 'error' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => retryGeneration(generation)}
                                title="Retry"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteGeneration(generation.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AudioStudioWorkspace;
