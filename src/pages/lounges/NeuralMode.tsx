/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — NEURAL MODE                                              │
 * │                                                                             │
 * │ Deep focus and cognitive enhancement lounge                                │
 * │ Pomodoro timer, task breakdown, focus tracking                             │
 * │                                                                             │
 * │ Lucy helps you think deeper.                                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  Lightbulb, 
  Play, 
  Pause, 
  RotateCcw,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLounge, formatDuration } from '@/hooks/useLounge';
import { useAuth } from '@/hooks/useAuth';

// =============================================================================
// TYPES
// =============================================================================

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

// =============================================================================
// COMPONENT
// =============================================================================

const NeuralMode = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const {
    session,
    isSessionActive,
    sessionDuration,
    startSession,
    endSession,
    saveArtifact,
    presence,
    loading,
    error,
  } = useLounge({
    loungeType: 'neural',
    aiMode: 'focus',
    autoStartSession: false,
    trackPresence: true,
  });

  // Timer state
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATIONS.focus);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Task state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Timer completed
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining]);

  const handleTimerComplete = useCallback(() => {
    setIsTimerRunning(false);
    
    if (timerMode === 'focus') {
      setCompletedPomodoros(prev => prev + 1);
      toast({
        title: 'Focus session complete!',
        description: 'Time for a break. Great work!',
      });
      
      // Auto-switch to break
      if ((completedPomodoros + 1) % 4 === 0) {
        setTimerMode('longBreak');
        setTimeRemaining(TIMER_DURATIONS.longBreak);
      } else {
        setTimerMode('shortBreak');
        setTimeRemaining(TIMER_DURATIONS.shortBreak);
      }
    } else {
      toast({
        title: 'Break complete!',
        description: 'Ready to focus again?',
      });
      setTimerMode('focus');
      setTimeRemaining(TIMER_DURATIONS.focus);
    }

    // Play notification sound
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
  }, [timerMode, completedPomodoros, toast]);

  const toggleTimer = () => {
    if (!isTimerRunning && !isSessionActive && isAuthenticated) {
      startSession();
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(TIMER_DURATIONS[timerMode]);
  };

  const switchMode = (mode: TimerMode) => {
    setTimerMode(mode);
    setTimeRemaining(TIMER_DURATIONS[mode]);
    setIsTimerRunning(false);
  };

  // Task management
  const addTask = () => {
    if (!newTaskText.trim()) return;
    
    setTasks(prev => [...prev, {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
    }]);
    setNewTaskText('');
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Save session
  const handleSaveSession = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save your focus session',
        variant: 'destructive',
      });
      return;
    }

    const completedTasks = tasks.filter(t => t.completed);
    const sessionData = {
      completedPomodoros,
      totalFocusMinutes: completedPomodoros * 25,
      tasks: tasks.map(t => ({ text: t.text, completed: t.completed })),
      completedTaskCount: completedTasks.length,
    };

    const artifactId = await saveArtifact(
      'focus-session',
      `Focus Session - ${completedPomodoros} Pomodoros`,
      `Completed ${completedPomodoros} focus sessions (${completedPomodoros * 25} minutes). ${completedTasks.length}/${tasks.length} tasks completed.`,
      sessionData,
      ['focus', 'productivity', 'neural']
    );

    if (artifactId) {
      toast({
        title: 'Session saved!',
        description: 'Your focus session has been recorded.',
      });
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((TIMER_DURATIONS[timerMode] - timeRemaining) / TIMER_DURATIONS[timerMode]) * 100;

  return (
    <CinematicWrapper loungeType="neural">
      <div className="container mx-auto px-4 py-8 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Neural Mode
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Deep focus with Pomodoro technique. Let Lucy guide your concentration.
          </p>
          {presence && presence.activeCount > 0 && (
            <Badge variant="secondary" className="mt-2">
              {presence.activeCount} others focusing now
            </Badge>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Timer Section */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Focus Timer
                </CardTitle>
                <CardDescription>
                  {timerMode === 'focus' ? 'Time to focus!' : 'Take a break'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mode Selector */}
                <div className="flex gap-2 justify-center">
                  <Button
                    variant={timerMode === 'focus' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => switchMode('focus')}
                  >
                    Focus
                  </Button>
                  <Button
                    variant={timerMode === 'shortBreak' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => switchMode('shortBreak')}
                  >
                    Short Break
                  </Button>
                  <Button
                    variant={timerMode === 'longBreak' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => switchMode('longBreak')}
                  >
                    Long Break
                  </Button>
                </div>

                {/* Timer Display */}
                <div className="relative">
                  <div className="text-center py-8">
                    <motion.div
                      className="text-7xl md:text-8xl font-mono font-bold text-foreground"
                      key={timeRemaining}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.1 }}
                    >
                      {formatTime(timeRemaining)}
                    </motion.div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Timer Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={toggleTimer}
                    className={isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="lg" onClick={resetTimer}>
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-8 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{completedPomodoros}</div>
                    <div className="text-sm text-muted-foreground">Pomodoros</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{completedPomodoros * 25}</div>
                    <div className="text-sm text-muted-foreground">Focus Minutes</div>
                  </div>
                  {isSessionActive && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{formatDuration(sessionDuration)}</div>
                      <div className="text-sm text-muted-foreground">Session Time</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 border-blue-500/20 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Focus Tasks
                </CardTitle>
                <CardDescription>
                  What are you working on?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Task */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a task..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  />
                  <Button size="icon" onClick={addTask}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Task List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {tasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          index === currentTaskIndex ? 'bg-blue-500/20' : 'bg-muted/50'
                        }`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleTask(task.id)}
                        >
                          <CheckCircle className={`w-4 h-4 ${task.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                        </Button>
                        <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.text}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {tasks.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Add tasks to track your progress
                    </p>
                  )}
                </div>

                {/* Save Button */}
                {(completedPomodoros > 0 || tasks.length > 0) && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSaveSession}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Session
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/30 border-blue-500/10">
            <CardContent className="pt-4">
              <Zap className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="font-medium mb-1">Deep Focus</h3>
              <p className="text-sm text-muted-foreground">
                25-minute focus sessions with breaks
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/30 border-blue-500/10">
            <CardContent className="pt-4">
              <Target className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="font-medium mb-1">Task Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Break down work into manageable tasks
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/30 border-blue-500/10">
            <CardContent className="pt-4">
              <Lightbulb className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="font-medium mb-1">Progress Saved</h3>
              <p className="text-sm text-muted-foreground">
                Your focus sessions are recorded
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Neural Visualization */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="relative w-48 h-48">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-blue-500/30"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.1, 0.5]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className={`w-12 h-12 ${isTimerRunning ? 'text-blue-400' : 'text-blue-400/50'}`} />
            </div>
          </div>
        </motion.div>
      </div>
    </CinematicWrapper>
  );
};

export default NeuralMode;
