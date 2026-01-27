/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — FEATURES PAGE                                            │
 * │                                                                             │
 * │ Comprehensive showcase of all platform capabilities                        │
 * │ AI tools, lounges, arcade, dev studio, and more                            │
 * │                                                                             │
 * │ Lucy does it all.                                                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { SEOHead } from '@/components/seo/SEOHead';
import { FAQSchema } from '@/components/seo/FAQSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Features as FeaturesSection } from '@/components/landing/Features';
import { SEOFAQSection } from '@/components/blog/SEOFAQSection';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Brain, 
  Gamepad2, 
  Code, 
  Music, 
  Wrench,
  Moon,
  Clock,
  Users,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LucyAvatar } from '@/components/avatar/LucyAvatar';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';
import { motion } from 'framer-motion';

const Features = () => {
  const navigate = useNavigate();

  // New feature highlights
  const newFeatures = [
    {
      icon: Wrench,
      title: 'AI Tools',
      description: 'Website summarizer, image captioning, math calculator, code executor, and web fetcher',
      link: '/tools',
      badge: 'NEW',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'Lucy Lounges',
      description: 'Neural Mode, Dream Mode, Silent Room, Memory Timeline, and more immersive spaces',
      link: '/lounges',
      badge: 'NEW',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Gamepad2,
      title: 'Lucy Arcade',
      description: '33 games with AI opponents, PvP multiplayer, and controller support',
      link: '/arcade',
      badge: '33 GAMES',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Code,
      title: 'Dev Studio',
      description: 'Build websites and apps with AI assistance, templates, and live preview',
      link: '/studios/dev',
      badge: 'NEW',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Music,
      title: 'Listening Mode',
      description: 'Personalized music recommendations with Spotify-level UX',
      link: '/listening',
      badge: 'ENHANCED',
      color: 'from-rose-500 to-red-500',
    },
  ];

  const detailedFeatures = [
    {
      category: 'AI Capabilities',
      items: [
        { name: 'Advanced Reasoning Engine', description: 'Multi-step chain-of-thought analysis with transparent reasoning process' },
        { name: 'Vision & Multimodal', description: 'Analyze images, videos, PDFs, and documents with AI' },
        { name: 'Long-term Memory', description: 'Remembers your preferences across all sessions' },
        { name: 'Code Execution', description: 'Run Python and JavaScript in secure sandbox' },
        { name: 'Web Search', description: 'Real-time information with source citations' },
        { name: 'Image Generation', description: 'Create AI images from text descriptions' }
      ]
    },
    {
      category: 'AI Tools',
      items: [
        { name: 'Website Summarizer', description: 'Extract and summarize content from any URL' },
        { name: 'Image Captioning', description: 'Generate descriptions and tags for images' },
        { name: 'Math Calculator', description: 'Solve complex equations with step-by-step solutions' },
        { name: 'Code Executor', description: 'Run JavaScript/TypeScript in secure sandbox' },
        { name: 'Web Fetcher', description: 'Safely fetch and extract web content' },
        { name: 'Tool History', description: 'All tool runs saved and searchable' }
      ]
    },
    {
      category: 'Lucy Lounges',
      items: [
        { name: 'Neural Mode', description: 'Deep focus with Pomodoro timer and task tracking' },
        { name: 'Dream Mode', description: 'Creative exploration and dream journaling' },
        { name: 'Silent Room', description: 'Shared meditation with breathing exercises' },
        { name: 'Memory Timeline', description: 'Visual history of all your conversations' },
        { name: 'Vision Mode', description: 'Goal visualization and planning' },
        { name: 'Quantum Mode', description: 'Explore branching thought paths' }
      ]
    },
    {
      category: 'Lucy Arcade',
      items: [
        { name: '33 Premium Games', description: 'Strategy, action, puzzle, sports, and card games' },
        { name: 'AI Opponents', description: 'Play against intelligent AI at multiple difficulty levels' },
        { name: 'PvP Multiplayer', description: 'Challenge friends with invite codes and lobbies' },
        { name: 'Controller Support', description: 'Full Gamepad API integration for console-like play' },
        { name: 'Global Leaderboards', description: 'Compete for top rankings worldwide' },
        { name: 'Player Profiles', description: 'Track stats, achievements, and progress' }
      ]
    },
    {
      category: 'Dev Studio',
      items: [
        { name: 'Project Management', description: 'Create, save, and manage web projects' },
        { name: 'Code Editor', description: 'Full IDE experience with syntax highlighting' },
        { name: 'File Tree', description: 'Visual file system navigation' },
        { name: 'Live Preview', description: 'See changes in real-time' },
        { name: 'Templates', description: 'Start from React, landing page, or blank templates' },
        { name: 'Version History', description: 'Track and restore previous versions' }
      ]
    },
    {
      category: 'User Experience',
      items: [
        { name: 'Real-time Streaming', description: 'Token-by-token response generation' },
        { name: 'Voice Capabilities', description: 'Speech-to-text and text-to-speech' },
        { name: 'Proactive Suggestions', description: 'Context-aware follow-up recommendations' },
        { name: 'Animated Avatar', description: 'Lucy avatar with emotional expressions' },
        { name: 'Smart Backgrounds', description: 'Dynamic 4K HDR nature scenes' },
        { name: 'Dark/Light Modes', description: 'Beautiful themes for any preference' }
      ]
    },
  ];

  const featuresFAQs = [
    {
      question: "What AI capabilities does Lucy AI have?",
      answer: "Lucy AI includes advanced reasoning with chain-of-thought analysis, multimodal vision for analyzing images/videos/PDFs, long-term memory across sessions, secure code execution in Python and JavaScript, real-time web search with citations, AI image generation, and voice conversation capabilities."
    },
    {
      question: "What are Lucy's AI Tools?",
      answer: "Lucy offers 5 powerful AI tools: Website Summarizer (extract and summarize web content), Image Captioning (generate descriptions for images), Math Calculator (solve equations with steps), Code Executor (run JS/TS safely), and Web Fetcher (extract web data). All tool runs are saved to your history."
    },
    {
      question: "What are Lucy Lounges?",
      answer: "Lucy Lounges are immersive spaces for different activities: Neural Mode (deep focus with Pomodoro), Dream Mode (creative journaling), Silent Room (shared meditation), Memory Timeline (conversation history), Vision Mode (goal planning), and Quantum Mode (thought exploration)."
    },
    {
      question: "How many games are in Lucy Arcade?",
      answer: "Lucy Arcade features 33 premium games across 5 categories: Strategy (Chess, Checkers, Go, etc.), Action (Racing, Platformer, Shooters), Puzzle (Tetris, Sudoku, 2048), Sports (Basketball, Golf, Bowling), and Cards (Poker, Blackjack, Solitaire). All games support AI opponents and many support PvP multiplayer."
    },
    {
      question: "What is Dev Studio?",
      answer: "Dev Studio is Lucy's AI-powered development workspace. You can create web projects from templates, edit code in a full IDE, see live previews, manage files, and track version history. It's perfect for building websites and apps with AI assistance."
    },
    {
      question: "Does Lucy support multiplayer gaming?",
      answer: "Yes! Many Lucy Arcade games support PvP multiplayer with invite codes and lobbies. You can challenge friends or join public games. The arcade also features global leaderboards and player profiles to track your progress."
    }
  ];

  return (
    <>
      <SEOHead 
        title="Features - Lucy AI | AI Tools, Lounges, Arcade & Dev Studio"
        description="Explore Lucy AI's powerful features: 5 AI tools, immersive lounges, 33 arcade games with AI/PvP, Dev Studio for building apps, and more. The ultimate AI platform."
        keywords="AI features, AI tools, Lucy lounges, Lucy arcade, Dev Studio, AI gaming, AI development, multimodal AI, AI assistant 2026"
        image="/og-features.png"
        url="https://thelucylounge.com/features"
        canonical="https://thelucylounge.com/features"
      />
      <FAQSchema faqs={featuresFAQs} />
      <BreadcrumbSchema 
        items={[
          { name: 'Home', url: 'https://thelucylounge.com' },
          { name: 'Features', url: 'https://thelucylounge.com/features' }
        ]}
      />
      
      <div className="min-h-screen-dvh relative overflow-hidden">
        <CosmicBackground />

        <div className="relative z-10">
          {/* Header */}
          <div className="container mx-auto px-4 py-8">
            <Button
              variant="ghost"
              className="text-foreground hover:bg-muted/20 border border-border/30"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Hero Section */}
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="flex justify-center mb-6">
              <LucyAvatar size="lg" state="focused" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-shadow-strong">
              Everything Lucy Can Do
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 text-shadow-soft">
              AI assistant, creative tools, immersive lounges, 33 games, and a full dev studio — all in one platform
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">5 AI Tools</Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">6 Lounges</Badge>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">33 Games</Badge>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Dev Studio</Badge>
            </div>
          </div>

          {/* New Feature Highlights */}
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8 text-shadow-strong">
              <Sparkles className="inline-block w-8 h-8 mr-2 text-yellow-400" />
              What's New
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {newFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="bg-white/5 border-white/10 hover:border-white/30 cursor-pointer transition-all hover:scale-105"
                    onClick={() => navigate(feature.link)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {feature.badge}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-white/70 mb-4">{feature.description}</p>
                      <div className="flex items-center text-sm text-primary">
                        Explore <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <FeaturesSection />

          {/* Detailed Feature Comparison */}
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center text-shadow-strong">
                Complete Feature List
              </h2>

              <div className="space-y-12">
                {detailedFeatures.map((category, index) => (
                  <motion.div 
                    key={index} 
                    className="glass-card-enhanced p-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-6">{category.category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                          <div>
                            <div className="font-semibold text-white">{item.name}</div>
                            <div className="text-sm text-white/70">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center mt-12 space-y-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/95 font-semibold text-lg px-8 py-6"
                  onClick={() => navigate('/auth')}
                >
                  Try Lucy AI Free
                </Button>
                <p className="text-white/60 text-sm">
                  No credit card required • Instant access
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <SEOFAQSection 
            title="Frequently Asked Questions About Lucy AI Features"
            faqs={featuresFAQs}
          />

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Features;
