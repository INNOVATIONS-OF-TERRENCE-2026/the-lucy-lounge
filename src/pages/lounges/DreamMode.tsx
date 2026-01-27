/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — DREAM MODE                                               │
 * │                                                                             │
 * │ Creative exploration and dream journaling lounge                           │
 * │ Dream journal, creative prompts, visualization                             │
 * │                                                                             │
 * │ Lucy helps you dream bigger.                                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Cloud, 
  Palette, 
  PenTool,
  Save,
  Star,
  Moon,
  Sun
} from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useLounge, formatDuration } from '@/hooks/useLounge';
import { useAuth } from '@/hooks/useAuth';

// =============================================================================
// TYPES
// =============================================================================

const MOODS = ['peaceful', 'exciting', 'mysterious', 'nostalgic', 'surreal', 'hopeful'];
const THEMES = ['flying', 'water', 'nature', 'space', 'home', 'journey', 'transformation'];

// =============================================================================
// COMPONENT
// =============================================================================

const DreamMode = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const {
    session,
    isSessionActive,
    sessionDuration,
    saveArtifact,
    artifacts,
    loading,
  } = useLounge({
    loungeType: 'dream',
    aiMode: 'creative',
    autoStartSession: true,
    trackPresence: false,
  });

  // Dream journal state
  const [dreamDescription, setDreamDescription] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [lucidity, setLucidity] = useState(5);
  const [saving, setSaving] = useState(false);

  // Creative prompts
  const CREATIVE_PROMPTS = [
    "Describe a door that leads somewhere impossible...",
    "What would your perfect sanctuary look like?",
    "If you could fly, where would you go first?",
    "Describe a conversation with your future self...",
    "What does your inner landscape look like?",
    "Imagine a color that doesn't exist...",
  ];
  const [currentPrompt] = useState(CREATIVE_PROMPTS[Math.floor(Math.random() * CREATIVE_PROMPTS.length)]);

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const handleSaveDream = async () => {
    if (!dreamDescription.trim()) {
      toast({
        title: 'Empty dream',
        description: 'Please describe your dream first',
        variant: 'destructive',
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save your dreams',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const dreamData = {
        description: dreamDescription,
        mood: selectedMood,
        themes: selectedThemes,
        lucidity,
        timestamp: new Date().toISOString(),
      };

      const artifactId = await saveArtifact(
        'dream',
        `Dream Journal - ${selectedMood || 'Untitled'}`,
        dreamDescription,
        dreamData,
        ['dream', selectedMood, ...selectedThemes].filter(Boolean)
      );

      if (artifactId) {
        toast({
          title: 'Dream saved!',
          description: 'Your dream has been recorded in your journal.',
        });
        
        // Reset form
        setDreamDescription('');
        setSelectedMood('');
        setSelectedThemes([]);
        setLucidity(5);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save dream',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <CinematicWrapper loungeType="dream">
      <div className="container mx-auto px-4 py-8 min-h-screen-dvh">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/20 mb-4">
            <Cloud className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Dream Mode
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Capture your dreams, explore your imagination, let creativity flow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Dream Journal */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 border-violet-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-violet-400" />
                  Dream Journal
                </CardTitle>
                <CardDescription>
                  {currentPrompt}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dream Description */}
                <Textarea
                  placeholder="Describe your dream..."
                  value={dreamDescription}
                  onChange={(e) => setDreamDescription(e.target.value)}
                  rows={8}
                  className="resize-none bg-background/50"
                />

                {/* Mood Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mood</label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((mood) => (
                      <Button
                        key={mood}
                        variant={selectedMood === mood ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedMood(mood === selectedMood ? '' : mood)}
                        className="capitalize"
                      >
                        {mood}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Themes</label>
                  <div className="flex flex-wrap gap-2">
                    {THEMES.map((theme) => (
                      <Badge
                        key={theme}
                        variant={selectedThemes.includes(theme) ? 'default' : 'outline'}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleTheme(theme)}
                      >
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Lucidity Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Lucidity Level</label>
                    <span className="text-sm text-muted-foreground">{lucidity}/10</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Moon className="w-4 h-4 text-muted-foreground" />
                    <Slider
                      value={[lucidity]}
                      onValueChange={([v]) => setLucidity(v)}
                      max={10}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <Sun className="w-4 h-4 text-amber-400" />
                  </div>
                </div>

                {/* Save Button */}
                <Button 
                  className="w-full bg-violet-500 hover:bg-violet-600"
                  onClick={handleSaveDream}
                  disabled={saving || !dreamDescription.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Dream'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Session Info */}
            <Card className="bg-card/50 border-violet-500/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-400">
                  {formatDuration(sessionDuration)}
                </div>
                <p className="text-sm text-muted-foreground">Dream time</p>
              </CardContent>
            </Card>

            {/* Recent Dreams */}
            <Card className="bg-card/50 border-violet-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-violet-400" />
                  Recent Dreams
                </CardTitle>
              </CardHeader>
              <CardContent>
                {artifacts.filter(a => a.artifactType === 'dream').length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No dreams recorded yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {artifacts
                      .filter(a => a.artifactType === 'dream')
                      .slice(0, 5)
                      .map((dream) => (
                        <div 
                          key={dream.id}
                          className="p-2 rounded-lg bg-muted/50 text-sm"
                        >
                          <div className="font-medium truncate">{dream.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {dream.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Creative Spark */}
            <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/30">
              <CardContent className="pt-4">
                <Sparkles className="w-6 h-6 text-violet-400 mb-2" />
                <h3 className="font-medium mb-1">Creative Spark</h3>
                <p className="text-sm text-muted-foreground">
                  Dreams are the seeds of creativity. Let them grow.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Floating elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-violet-400/20"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                x: [null, Math.random() * window.innerWidth],
              }}
              transition={{
                duration: 20 + Math.random() * 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </CinematicWrapper>
  );
};

export default DreamMode;
