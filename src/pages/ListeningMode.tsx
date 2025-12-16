import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, Heart, Music, Coffee, Waves, Mic, Gem, Disc3, Search, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListeningModeCard } from "@/components/listening/ListeningModeCard";
import { useRecentlyPlayed, RecentlyPlayedItem } from "@/hooks/useRecentlyPlayed";

const genres = [
  {
    title: "R&B Vibes",
    subtitle: "Curated R&B for smooth listening",
    contentId: "1kMyrcNKPws587cSAOjyDP",
    contentType: "playlist" as const,
    icon: Heart,
    accentColor: "from-pink-500/20 to-rose-500/5"
  },
  {
    title: "Jazz Vibes",
    subtitle: "Smooth jazz for focus and relaxation",
    contentId: "37i9dQZF1DXbITWG1ZJKYt",
    contentType: "playlist" as const,
    icon: Music,
    accentColor: "from-amber-500/20 to-orange-500/5"
  },
  {
    title: "Lo-Fi Vibes",
    subtitle: "Chill beats to study and relax",
    contentId: "37i9dQZF1DWWQRwui0ExPn",
    contentType: "playlist" as const,
    icon: Coffee,
    accentColor: "from-violet-500/20 to-purple-500/5"
  },
  {
    title: "Ambient Vibes",
    subtitle: "Atmospheric sounds for deep focus",
    contentId: "37i9dQZF1DX3Ogo9pFvBkY",
    contentType: "playlist" as const,
    icon: Waves,
    accentColor: "from-cyan-500/20 to-teal-500/5"
  }
];

const rapPlaylists = [
  {
    title: "🔥 Best of Jeezy",
    subtitle: "Street anthems and trap classics",
    contentId: "62FBSHL4fu93EYWT18tgL7",
    contentType: "playlist" as const,
    icon: Mic,
    accentColor: "from-red-500/20 to-orange-500/5"
  },
  {
    title: "🏁 Best of Nipsey Hussle",
    subtitle: "Marathon energy, West Coast legacy",
    contentId: "1SIx1DgtH8YrQoiq4Wx4L2",
    contentType: "playlist" as const,
    icon: Mic,
    accentColor: "from-blue-500/20 to-indigo-500/5"
  },
  {
    title: "🐬 Best of Young Dolph",
    subtitle: "Memphis hustle, boss motivation",
    contentId: "5TkM6OUHeFujrujopXrzua",
    contentType: "playlist" as const,
    icon: Mic,
    accentColor: "from-emerald-500/20 to-teal-500/5"
  }
];

const smoothRapContent = [
  {
    title: "💎 Larry June — Smooth Hustle Vibes",
    subtitle: "Game-spitting, boss-level smooth rap",
    contentId: "37i9dQZF1DZ06evO0GIXLs",
    contentType: "playlist" as const,
    icon: Gem,
    accentColor: "from-yellow-500/20 to-amber-500/5"
  },
  {
    title: "🖤 AJ Snow — God Don't Like Ugly",
    subtitle: "Real talk, raw ambition, no gimmicks",
    contentId: "0b4eJvHZmX2g23UrJA8hea",
    contentType: "album" as const,
    icon: Disc3,
    accentColor: "from-slate-500/20 to-gray-500/5"
  },
  {
    title: "🧠 AJ Snow — I'm What the Game Been Missing",
    subtitle: "Confidence, clarity, and street wisdom",
    contentId: "7Mq1WcLkCmSjOjFtq3s8K6",
    contentType: "album" as const,
    icon: Disc3,
    accentColor: "from-purple-500/20 to-violet-500/5"
  },
  {
    title: "🥩 AJ Snow — Tomorrow We Eat Steak",
    subtitle: "Hustler motivation with smooth delivery",
    contentId: "0IqPormqtxnLk2y43fYVbv",
    contentType: "album" as const,
    icon: Disc3,
    accentColor: "from-orange-500/20 to-red-500/5"
  },
  {
    title: "🎯 AJ Snow — The Game Don't Deserve Me",
    subtitle: "Underrated excellence and grit",
    contentId: "4sRCBUhUn4TkZKokvvMgUr",
    contentType: "album" as const,
    icon: Disc3,
    accentColor: "from-rose-500/20 to-pink-500/5"
  },
  {
    title: "💰 AJ Snow — Let's Get Rich",
    subtitle: "Money mindset, smooth grind music",
    contentId: "28mylz9K7R22xtZ4E9f0ox",
    contentType: "album" as const,
    icon: Disc3,
    accentColor: "from-green-500/20 to-emerald-500/5"
  },
  {
    title: "🏆 AJ Snow — No Awards",
    subtitle: "Independent grind, no validation needed",
    contentId: "5J1WoK2MSsaakqPREPwPaE",
    contentType: "album" as const,
    icon: Disc3,
    accentColor: "from-amber-500/20 to-yellow-500/5"
  }
];

type GenreTab = 'vibes' | 'rap' | 'smooth-rap';

const tabs: { id: GenreTab; label: string; icon: typeof Music }[] = [
  { id: 'vibes', label: 'Vibes', icon: Music },
  { id: 'rap', label: 'RAP', icon: Mic },
  { id: 'smooth-rap', label: 'Smooth Rap', icon: Gem },
];

const ListeningMode = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<GenreTab>('vibes');
  const [searchQuery, setSearchQuery] = useState('');
  const { recentlyPlayed, addRecentlyPlayed } = useRecentlyPlayed();

  const handleCardInteraction = (item: RecentlyPlayedItem) => {
    addRecentlyPlayed(item);
  };

  const filterItems = <T extends { title: string; subtitle: string }>(items: T[]) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      item => item.title.toLowerCase().includes(query) || item.subtitle.toLowerCase().includes(query)
    );
  };

  const filteredGenres = useMemo(() => filterItems(genres), [searchQuery]);
  const filteredRap = useMemo(() => filterItems(rapPlaylists), [searchQuery]);
  const filteredSmoothRap = useMemo(() => filterItems(smoothRapContent), [searchQuery]);

  const renderContent = () => {
    switch (activeTab) {
      case 'vibes':
        return filteredGenres.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGenres.map((genre, index) => (
              <ListeningModeCard
                key={genre.contentId}
                title={genre.title}
                subtitle={genre.subtitle}
                contentId={genre.contentId}
                contentType={genre.contentType}
                icon={genre.icon}
                accentColor={genre.accentColor}
                index={index}
                onInteraction={() => handleCardInteraction({
                  id: genre.contentId,
                  title: genre.title,
                  subtitle: genre.subtitle,
                  genre: 'vibes',
                  contentType: genre.contentType
                })}
              />
            ))}
          </div>
        ) : (
          <EmptySearchState query={searchQuery} />
        );
      case 'rap':
        return filteredRap.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRap.map((playlist, index) => (
              <ListeningModeCard
                key={playlist.contentId}
                title={playlist.title}
                subtitle={playlist.subtitle}
                contentId={playlist.contentId}
                contentType={playlist.contentType}
                icon={playlist.icon}
                accentColor={playlist.accentColor}
                index={index}
                onInteraction={() => handleCardInteraction({
                  id: playlist.contentId,
                  title: playlist.title,
                  subtitle: playlist.subtitle,
                  genre: 'rap',
                  contentType: playlist.contentType
                })}
              />
            ))}
          </div>
        ) : (
          <EmptySearchState query={searchQuery} />
        );
      case 'smooth-rap':
        return filteredSmoothRap.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSmoothRap.map((item, index) => (
              <ListeningModeCard
                key={item.contentId}
                title={item.title}
                subtitle={item.subtitle}
                contentId={item.contentId}
                contentType={item.contentType}
                icon={item.icon}
                accentColor={item.accentColor}
                index={index}
                onInteraction={() => handleCardInteraction({
                  id: item.contentId,
                  title: item.title,
                  subtitle: item.subtitle,
                  genre: 'smooth-rap',
                  contentType: item.contentType
                })}
              />
            ))}
          </div>
        ) : (
          <EmptySearchState query={searchQuery} />
        );
    }
  };

  const EmptySearchState = ({ query }: { query: string }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
      <p className="text-muted-foreground">No results for "{query}"</p>
      <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Headphones className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Listening Mode</h1>
              <p className="text-sm text-muted-foreground">
                Music discovery, vibes & inspiration
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Genre Tabs + Search */}
      <div className="sticky top-[73px] z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 sm:max-w-xs ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search vibes, artists, or albums…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-muted/50 border-border/50 focus:bg-background transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recently Played Section */}
      <AnimatePresence>
        {recentlyPlayed.length > 0 && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border/50 bg-muted/20"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Recently Played</h2>
                    <p className="text-xs text-muted-foreground">Your latest vibes</p>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {recentlyPlayed.map((item, index) => (
                    <ListeningModeCard
                      key={item.id}
                      title={item.title}
                      subtitle={item.subtitle}
                      contentId={item.id}
                      contentType={item.contentType}
                      accentColor="from-primary/20 to-primary/5"
                      index={index}
                      compact
                      onInteraction={() => handleCardInteraction(item)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ListeningMode;
