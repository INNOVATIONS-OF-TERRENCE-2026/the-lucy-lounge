/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — STUDIOS HUB                                              │
 * │                                                                             │
 * │ Master control center for all Lucy features                                │
 * │ AI Tools, Lounges, Dev Studio, Arcade, Chat, and more                      │
 * │                                                                             │
 * │ Lucy's command center.                                                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Music, 
  Code, 
  Sparkles, 
  ArrowLeft,
  Gamepad2,
  Brain,
  Wrench,
  Headphones,
  Film,
  Users,
  Settings,
  TrendingUp,
  Clock,
  Zap,
  ChevronRight,
  Star,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucyAvatar } from '@/components/avatar/LucyAvatar';
import { StudioCard } from '@/components/studios/StudioCard';
import { StudiosSEO } from '@/components/seo/StudiosSEO';
import { useAuth } from '@/hooks/useAuth';

// =============================================================================
// TYPES
// =============================================================================

interface QuickAction {
  title: string;
  description: string;
  icon: typeof MessageSquare;
  route: string;
  color: string;
  badge?: string;
}

interface RecentActivity {
  type: 'chat' | 'tool' | 'game' | 'lounge';
  title: string;
  timestamp: Date;
  route: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

const Studios = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [greeting, setGreeting] = useState('Welcome');

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('Good evening');
    else setGreeting('Good night');
  }, []);

  const quickActions: QuickAction[] = [
    {
      title: 'Chat with Lucy',
      description: 'Start a conversation',
      icon: MessageSquare,
      route: '/chat',
      color: 'from-violet-500 to-purple-600',
    },
    {
      title: 'AI Tools',
      description: 'Summarize, caption, calculate',
      icon: Wrench,
      route: '/tools',
      color: 'from-blue-500 to-cyan-500',
      badge: '5 Tools',
    },
    {
      title: 'Listening Mode',
      description: 'Personalized music',
      icon: Headphones,
      route: '/listening',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Lucy Arcade',
      description: '33 games to play',
      icon: Gamepad2,
      route: '/arcade',
      color: 'from-amber-500 to-orange-500',
      badge: 'NEW',
    },
  ];

  const mainFeatures = [
    {
      title: 'AI Studio',
      description: 'Chat, reasoning, and intelligent workflows powered by Lucy.',
      icon: MessageSquare,
      route: '/studios/ai',
      gradient: 'from-violet-500 to-purple-600',
      stats: 'Unlimited chats',
    },
    {
      title: 'Audio Studio',
      description: 'Music discovery, playlists, and audio intelligence.',
      icon: Music,
      route: '/studios/audio',
      gradient: 'from-pink-500 to-rose-600',
      stats: 'For You recommendations',
    },
    {
      title: 'Dev Studio',
      description: 'Build websites and apps with AI assistance.',
      icon: Code,
      route: '/studios/dev',
      gradient: 'from-blue-500 to-cyan-600',
      stats: 'Project templates',
    },
  ];

  const lounges = [
    { name: 'Neural Mode', icon: Brain, route: '/lounges/neural', description: 'Deep focus' },
    { name: 'Dream Mode', icon: Sparkles, route: '/lounges/dream', description: 'Creative exploration' },
    { name: 'Silent Room', icon: Users, route: '/lounges/silent', description: 'Shared meditation' },
    { name: 'Memory Timeline', icon: Clock, route: '/lounges/memory', description: 'Your history' },
  ];

  const tools = [
    { name: 'Website Summarizer', route: '/tools/summarizer' },
    { name: 'Image Captioning', route: '/tools/captioning' },
    { name: 'Math Calculator', route: '/tools/calculator' },
    { name: 'Code Executor', route: '/tools/code-executor' },
    { name: 'Web Fetcher', route: '/tools/web-fetcher' },
  ];

  return (
    <>
      <StudiosSEO />
      <div className="min-h-screen-dvh bg-gradient-primary relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/35 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/settings')}
                  className="text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Hero Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6 flex justify-center">
              <LucyAvatar size="lg" state="happy" className="drop-shadow-2xl" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white text-shadow-strong">
              {greeting}{isAuthenticated && user?.user_metadata?.name ? `, ${user.user_metadata.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Your command center for AI, creativity, and entertainment
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {quickActions.map((action, i) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    className={`bg-gradient-to-br ${action.color} border-0 cursor-pointer h-full`}
                    onClick={() => navigate(action.route)}
                  >
                    <CardContent className="p-4 text-white">
                      <div className="flex items-start justify-between mb-2">
                        <action.icon className="w-6 h-6" />
                        {action.badge && (
                          <Badge className="bg-white/20 text-white text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-white/80">{action.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main Studios */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Studios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {mainFeatures.map((feature, i) => (
                <StudioCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  route={feature.route}
                  gradient={feature.gradient}
                />
              ))}
            </div>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {/* Lounges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/5 border-white/10 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Lucy Lounges
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white/70"
                      onClick={() => navigate('/lounges')}
                    >
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <CardDescription className="text-white/60">
                    Immersive AI-powered experiences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {lounges.map((lounge) => (
                      <div
                        key={lounge.name}
                        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                        onClick={() => navigate(lounge.route)}
                      >
                        <lounge.icon className="w-5 h-5 text-white/70 mb-2" />
                        <div className="font-medium text-white text-sm">{lounge.name}</div>
                        <div className="text-xs text-white/50">{lounge.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Tools */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/5 border-white/10 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      AI Tools
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white/70"
                      onClick={() => navigate('/tools')}
                    >
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <CardDescription className="text-white/60">
                    Powerful utilities at your fingertips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tools.map((tool) => (
                      <div
                        key={tool.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                        onClick={() => navigate(tool.route)}
                      >
                        <span className="text-white text-sm">{tool.name}</span>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Entertainment Section */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Entertainment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card 
                className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 cursor-pointer"
                onClick={() => navigate('/listening')}
              >
                <CardContent className="p-6 text-white">
                  <Headphones className="w-10 h-10 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Listening Mode</h3>
                  <p className="text-white/80 text-sm">Personalized music recommendations</p>
                  <Badge className="mt-4 bg-white/20">For You</Badge>
                </CardContent>
              </Card>

              <Card 
                className="bg-gradient-to-br from-red-500 to-rose-600 border-0 cursor-pointer"
                onClick={() => navigate('/media')}
              >
                <CardContent className="p-6 text-white">
                  <Film className="w-10 h-10 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Media Mode</h3>
                  <p className="text-white/80 text-sm">Movies, shows, and video content</p>
                  <Badge className="mt-4 bg-white/20">Discover</Badge>
                </CardContent>
              </Card>

              <Card 
                className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 cursor-pointer"
                onClick={() => navigate('/arcade')}
              >
                <CardContent className="p-6 text-white">
                  <Gamepad2 className="w-10 h-10 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Lucy Arcade</h3>
                  <p className="text-white/80 text-sm">33 games with AI opponents</p>
                  <Badge className="mt-4 bg-white/20">PvP Ready</Badge>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Stats Footer */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-wrap justify-center gap-8 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>5 AI Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>6 Lounges</span>
              </div>
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                <span>33 Games</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>6 AI Models</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Studios;
