/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — SILENT ROOM                                              │
 * │                                                                             │
 * │ Shared meditation and mindfulness space                                    │
 * │ Real-time presence, breathing exercises, ambient sounds                    │
 * │                                                                             │
 * │ Lucy creates space for stillness.                                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, 
  Users, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  Wind,
  Waves,
  CloudRain,
  Flame
} from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useLounge, formatDuration } from '@/hooks/useLounge';

// =============================================================================
// TYPES
// =============================================================================

type BreathingPattern = 'box' | 'relaxing' | 'energizing' | 'sleep';
type AmbientSound = 'rain' | 'waves' | 'wind' | 'fire' | 'none';

const BREATHING_PATTERNS: Record<BreathingPattern, { inhale: number; hold1: number; exhale: number; hold2: number; name: string }> = {
  box: { inhale: 4, hold1: 4, exhale: 4, hold2: 4, name: 'Box Breathing' },
  relaxing: { inhale: 4, hold1: 7, exhale: 8, hold2: 0, name: '4-7-8 Relaxing' },
  energizing: { inhale: 6, hold1: 0, exhale: 2, hold2: 0, name: 'Energizing' },
  sleep: { inhale: 4, hold1: 4, exhale: 6, hold2: 2, name: 'Sleep Prep' },
};

// =============================================================================
// COMPONENT
// =============================================================================

const SilentRoom = () => {
  const {
    session,
    isSessionActive,
    sessionDuration,
    startSession,
    endSession,
    presence,
    updateActivity,
    loading,
  } = useLounge({
    loungeType: 'silent',
    aiMode: 'reflective',
    autoStartSession: true,
    trackPresence: true,
  });

  // Breathing state
  const [breathingPattern, setBreathingPattern] = useState<BreathingPattern>('box');
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);
  const [breathCount, setBreathCount] = useState(0);

  // Ambient sound state
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // Breathing animation
  useEffect(() => {
    if (!isBreathing) return;

    const pattern = BREATHING_PATTERNS[breathingPattern];
    const phases: Array<{ phase: typeof breathPhase; duration: number }> = [
      { phase: 'inhale', duration: pattern.inhale },
      { phase: 'hold1', duration: pattern.hold1 },
      { phase: 'exhale', duration: pattern.exhale },
      { phase: 'hold2', duration: pattern.hold2 },
    ].filter(p => p.duration > 0);

    let currentPhaseIndex = phases.findIndex(p => p.phase === breathPhase);
    let elapsed = 0;
    const currentPhaseDuration = phases[currentPhaseIndex].duration;

    const interval = setInterval(() => {
      elapsed += 0.1;
      setBreathProgress((elapsed / currentPhaseDuration) * 100);

      if (elapsed >= currentPhaseDuration) {
        // Move to next phase
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        setBreathPhase(phases[currentPhaseIndex].phase);
        elapsed = 0;

        // Count completed breath cycles
        if (currentPhaseIndex === 0) {
          setBreathCount(prev => prev + 1);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isBreathing, breathingPattern, breathPhase]);

  const toggleBreathing = () => {
    if (!isBreathing) {
      setBreathPhase('inhale');
      setBreathProgress(0);
      updateActivity('breathing');
    }
    setIsBreathing(!isBreathing);
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
    }
  };

  const getCircleScale = () => {
    switch (breathPhase) {
      case 'inhale': return 1 + (breathProgress / 100) * 0.5;
      case 'hold1': return 1.5;
      case 'exhale': return 1.5 - (breathProgress / 100) * 0.5;
      case 'hold2': return 1;
    }
  };

  const SOUND_ICONS: Record<AmbientSound, typeof Wind> = {
    rain: CloudRain,
    waves: Waves,
    wind: Wind,
    fire: Flame,
    none: VolumeX,
  };

  return (
    <CinematicWrapper loungeType="silent">
      <div className="container mx-auto px-4 py-8 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 mb-4">
            <Moon className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Silent Room
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A shared space for stillness. Breathe together in silence.
          </p>
          
          {/* Presence indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-muted-foreground">
              {presence?.activeCount || 0} people here now
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Breathing Exercise */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 border-indigo-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Breathing Exercise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pattern Selector */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(BREATHING_PATTERNS).map(([key, pattern]) => (
                    <Button
                      key={key}
                      variant={breathingPattern === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBreathingPattern(key as BreathingPattern)}
                      disabled={isBreathing}
                    >
                      {pattern.name}
                    </Button>
                  ))}
                </div>

                {/* Breathing Circle */}
                <div className="flex justify-center py-8">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-indigo-500/20 border-2 border-indigo-500/50"
                      animate={{ scale: getCircleScale() }}
                      transition={{ duration: 0.1 }}
                    />
                    <div className="text-center z-10">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={breathPhase}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xl font-medium text-indigo-400"
                        >
                          {isBreathing ? getBreathInstruction() : 'Ready'}
                        </motion.div>
                      </AnimatePresence>
                      {isBreathing && (
                        <div className="text-sm text-muted-foreground mt-2">
                          {Math.ceil((100 - breathProgress) / 100 * BREATHING_PATTERNS[breathingPattern][breathPhase === 'hold1' ? 'hold1' : breathPhase === 'hold2' ? 'hold2' : breathPhase])}s
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={toggleBreathing}
                    className={isBreathing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-500 hover:bg-indigo-600'}
                  >
                    {isBreathing ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-8 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-400">{breathCount}</div>
                    <div className="text-sm text-muted-foreground">Breaths</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{formatDuration(sessionDuration)}</div>
                    <div className="text-sm text-muted-foreground">Session</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ambient Sounds */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 border-indigo-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Ambient Sounds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sound Selector */}
                <div className="grid grid-cols-2 gap-3">
                  {(['rain', 'waves', 'wind', 'fire'] as AmbientSound[]).map((sound) => {
                    const Icon = SOUND_ICONS[sound];
                    return (
                      <Button
                        key={sound}
                        variant={ambientSound === sound ? 'default' : 'outline'}
                        className="h-20 flex-col gap-2"
                        onClick={() => setAmbientSound(sound === ambientSound ? 'none' : sound)}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="capitalize">{sound}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* Volume Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Volume</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={([v]) => {
                      setVolume(v);
                      setIsMuted(false);
                    }}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Active Users */}
                {presence && presence.recentActivity.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Others in the room</h4>
                    <div className="space-y-2">
                      {presence.recentActivity.slice(0, 5).map((user, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>{user.displayName}</span>
                          {user.activityType && (
                            <Badge variant="secondary" className="text-xs">
                              {user.activityType}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="bg-card/30 border-indigo-500/10 mt-4">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your session</span>
                  {isSessionActive ? (
                    <Badge className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="outline">Not started</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Floating particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-indigo-400/30"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
              }}
              animate={{
                y: -10,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      </div>
    </CinematicWrapper>
  );
};

export default SilentRoom;
