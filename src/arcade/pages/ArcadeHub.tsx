/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — ARCADE HUB                                               │
 * │                                                                             │
 * │ 33 games with AI opponents, PvP support, and controller compatibility      │
 * │                                                                             │
 * │ Lucy's arcade - where fun meets competition.                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Trophy, Sparkles, Grid3X3, Filter, Users, Bot, Search, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '../components/GameCard';
import { PlayerStatsPanel } from '../components/PlayerStatsPanel';
import { LeaderboardPanel } from '../components/LeaderboardPanel';
import { ARCADE_GAMES, getGamesByCategory, searchGames, getGamesWithAI, getGamesWithMultiplayer } from '../data/games';
import type { GameCategory } from '../types/game.types';

export default function ArcadeHub() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<GameCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIOnly, setShowAIOnly] = useState(false);
  const [showMultiplayerOnly, setShowMultiplayerOnly] = useState(false);
  
  let filteredGames = activeCategory === 'all' 
    ? ARCADE_GAMES 
    : getGamesByCategory(activeCategory);
  
  // Apply search filter
  if (searchQuery) {
    filteredGames = searchGames(searchQuery).filter(g => 
      activeCategory === 'all' || g.category === activeCategory
    );
  }
  
  // Apply AI filter
  if (showAIOnly) {
    filteredGames = filteredGames.filter(g => g.hasAI);
  }
  
  // Apply multiplayer filter
  if (showMultiplayerOnly) {
    filteredGames = filteredGames.filter(g => g.hasMultiplayer);
  }

  const categories: { value: GameCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Games', icon: '🎮' },
    { value: 'strategy', label: 'Strategy', icon: '♟️' },
    { value: 'action', label: 'Action', icon: '⚡' },
    { value: 'sports', label: 'Sports', icon: '🏀' },
    { value: 'puzzle', label: 'Puzzle', icon: '🧩' },
    { value: 'social', label: 'Cards', icon: '🃏' },
  ];
  
  const aiGamesCount = getGamesWithAI().length;
  const multiplayerGamesCount = getGamesWithMultiplayer().length;

  return (
    <div className="min-h-screen-dvh bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden border-b border-border/50"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
        
        <div className="relative container mx-auto px-4 py-12">
          {/* Back to Home */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg shadow-primary/25"
            >
              <Gamepad2 className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Lucy Arcade
              </h1>
              <p className="text-muted-foreground">Premium gaming experience powered by AI</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm">
              <Grid3X3 className="w-4 h-4 text-primary" />
              <span className="text-sm">{ARCADE_GAMES.length} Games</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm">
              <Bot className="w-4 h-4 text-purple-500" />
              <span className="text-sm">{aiGamesCount} with AI</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{multiplayerGamesCount} Multiplayer</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Global Leaderboards</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Games Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-border/50"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 overflow-x-auto pb-2 flex-1">
                <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as GameCategory | 'all')}>
                  <TabsList className="bg-card/50 border border-border/50">
                    {categories.map(cat => (
                      <TabsTrigger key={cat.value} value={cat.value} className="gap-2">
                        <span>{cat.icon}</span>
                        <span className="hidden sm:inline">{cat.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Quick Filters */}
              <div className="flex gap-2">
                <Button
                  variant={showAIOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowAIOnly(!showAIOnly)}
                >
                  <Bot className="w-4 h-4 mr-1" />
                  AI
                </Button>
                <Button
                  variant={showMultiplayerOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowMultiplayerOnly(!showMultiplayerOnly)}
                >
                  <Users className="w-4 h-4 mr-1" />
                  PvP
                </Button>
              </div>
            </div>

            {/* Games Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredGames.map((game, index) => (
                  <GameCard key={game.id} game={game} index={index} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredGames.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No games in this category yet.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PlayerStatsPanel />
            <LeaderboardPanel gameId="chess" title="Chess Rankings" />
          </div>
        </div>
      </div>
    </div>
  );
}
