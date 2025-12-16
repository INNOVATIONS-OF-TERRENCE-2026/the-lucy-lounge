import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, Heart, Music, Coffee, Waves, Mic, Gem, Disc3, Search, X, Clock, Sparkles, Brain, Zap, Moon, Star, CloudMoon, BookOpen, Sofa } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListeningModeCard } from "@/components/listening/ListeningModeCard";
import { useRecentlyPlayed, RecentlyPlayedItem } from "@/hooks/useRecentlyPlayed";
import { useFavorites, FavoriteItem } from "@/hooks/useFavorites";
import { useLucyRecommendations, getMoodTags, MoodType, ContentItem } from "@/hooks/useLucyRecommendations";

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

// R&B Content - SZA, Frank Ocean, Daniel Caesar
const rnbContent = [
  // SZA
  {
    title: "🌙 SZA — Ctrl",
    subtitle: "Vulnerable R&B for late night introspection",
    contentId: "76290XdXVF9rPzGdNRWdCh",
    contentType: "album" as const,
    icon: Heart,
    accentColor: "from-rose-500/20 to-pink-500/5"
  },
  {
    title: "✨ SZA — SOS",
    subtitle: "Evolution of modern R&B storytelling",
    contentId: "07w0rG5TETcyihsEIZR3qG",
    contentType: "album" as const,
    icon: Heart,
    accentColor: "from-fuchsia-500/20 to-purple-500/5"
  },
  // Frank Ocean
  {
    title: "🌊 Frank Ocean — Blonde",
    subtitle: "Ethereal R&B masterpiece for deep vibes",
    contentId: "3mH6qwIy9crq0I9YQbOuDf",
    contentType: "album" as const,
    icon: Waves,
    accentColor: "from-amber-500/20 to-yellow-500/5"
  },
  {
    title: "🍊 Frank Ocean — Channel Orange",
    subtitle: "Soulful storytelling and smooth production",
    contentId: "392p3shh2jkxUxY2VHvlH8",
    contentType: "album" as const,
    icon: Waves,
    accentColor: "from-orange-500/20 to-amber-500/5"
  },
  // Daniel Caesar
  {
    title: "🎤 Daniel Caesar — Freudian",
    subtitle: "Gospel-infused R&B for the soul",
    contentId: "3xybjP7r2VsWzwvDQipdM0",
    contentType: "album" as const,
    icon: Heart,
    accentColor: "from-indigo-500/20 to-blue-500/5"
  },
  {
    title: "💜 Daniel Caesar — Case Study 01",
    subtitle: "Experimental R&B with smooth melodies",
    contentId: "1mF5PyMXQiW4YXGP3OJpFN",
    contentType: "album" as const,
    icon: Heart,
    accentColor: "from-violet-500/20 to-indigo-500/5"
  },
  // Additional R&B artists
  {
    title: "🌹 Jhené Aiko — Chilombo",
    subtitle: "Healing frequencies and smooth R&B",
    contentId: "0r8HGNWZvujck1YsVREvPL",
    contentType: "album" as const,
    icon: Heart,
    accentColor: "from-teal-500/20 to-cyan-500/5"
  },
  {
    title: "🦋 Snoh Aalegra — Temporary Highs",
    subtitle: "Cinematic R&B for late night feels",
    contentId: "3w3SrcCrHjJFPyVxn2AKDS",
    contentType: "album" as const,
    icon: Heart,
    accentColor: "from-sky-500/20 to-blue-500/5"
  }
];

// LO-FI Content - Curated Artists
const lofiContent = [
  // Steven Beddall
  {
    title: "🌌 Steven Beddall — Ambient Textures",
    subtitle: "Ambient lo-fi textures for focus and clarity",
    contentId: "1MkWXjIV9V2NprI20SsbC1",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-indigo-500/20 to-slate-500/5"
  },
  {
    title: "🌙 Steven Beddall — Late Night Atmospheres",
    subtitle: "Late-night lo-fi atmospheres and calm vibes",
    contentId: "4E7CSAcCmqSH00SYVSNvFz",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-slate-500/20 to-indigo-500/5"
  },
  // Jinsang
  {
    title: "🎧 Jinsang — Life",
    subtitle: "Classic lo-fi hip-hop for deep focus",
    contentId: "3Kv1xSxuNeMFvdXVb7tEXe",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-teal-500/20 to-cyan-500/5"
  },
  {
    title: "🌸 Jinsang — Solitude",
    subtitle: "Melancholic beats for introspective moments",
    contentId: "6bEwlXAYCTYl3vfvZ9hG8T",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-pink-500/20 to-rose-500/5"
  },
  // Idealism
  {
    title: "✨ Idealism — From Within",
    subtitle: "Soulful lo-fi instrumentals for clarity",
    contentId: "1Q8s0GK4mOeTHdCpmj9vLC",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-amber-500/20 to-orange-500/5"
  },
  {
    title: "🌿 Idealism — Raindrop",
    subtitle: "Organic textures and peaceful vibes",
    contentId: "0P3XzGD2iKYCpFhSqVHdVA",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-emerald-500/20 to-green-500/5"
  },
  // Tomppabeats
  {
    title: "⛵ Tomppabeats — Harbor",
    subtitle: "Nostalgic lo-fi beats for late nights",
    contentId: "5FzKsN2CqpnSMXpX6JWJkr",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-blue-500/20 to-sky-500/5"
  },
  {
    title: "🌅 Tomppabeats — Overseas",
    subtitle: "Dreamy soundscapes for wandering minds",
    contentId: "4aJpwcLuFpWE5iJ9HvRUqH",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-violet-500/20 to-purple-500/5"
  },
  // Kupla
  {
    title: "🦉 Kupla — Owls",
    subtitle: "Nordic lo-fi with organic textures",
    contentId: "5RjXxlQJd5hQaQ3g2dQhaM",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-stone-500/20 to-neutral-500/5"
  },
  {
    title: "🌲 Kupla — Distant Islands",
    subtitle: "Nature-inspired beats for focus sessions",
    contentId: "1xCk3pLjfuQqsT4G3LGbX5",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-lime-500/20 to-green-500/5"
  },
  // J'san
  {
    title: "☕ J'san — Coffee Break",
    subtitle: "Warm lo-fi for productive mornings",
    contentId: "7tZqH9jKGxFQeN2PxMcFwm",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-yellow-500/20 to-amber-500/5"
  },
  // Birocratic
  {
    title: "🎹 Birocratic — Beets 4",
    subtitle: "Jazzy lo-fi with playful energy",
    contentId: "5Y0p2XCgRRIjna91AQC29d",
    contentType: "album" as const,
    icon: CloudMoon,
    accentColor: "from-fuchsia-500/20 to-pink-500/5"
  }
];

// Build all content with genres for recommendations
const allContent: ContentItem[] = [
  ...genres.map(g => ({ id: g.contentId, title: g.title, subtitle: g.subtitle, genre: 'vibes', contentType: g.contentType })),
  ...rapPlaylists.map(r => ({ id: r.contentId, title: r.title, subtitle: r.subtitle, genre: 'rap', contentType: r.contentType })),
  ...smoothRapContent.map(s => ({ id: s.contentId, title: s.title, subtitle: s.subtitle, genre: 'smooth-rap', contentType: s.contentType })),
  ...lofiContent.map(l => ({ id: l.contentId, title: l.title, subtitle: l.subtitle, genre: 'lofi', contentType: l.contentType })),
  ...rnbContent.map(r => ({ id: r.contentId, title: r.title, subtitle: r.subtitle, genre: 'rnb', contentType: r.contentType })),
];

type GenreTab = 'vibes' | 'rap' | 'smooth-rap' | 'lofi' | 'rnb' | 'favorites';

const tabs: { id: GenreTab; label: string; icon: typeof Music }[] = [
  { id: 'vibes', label: 'Vibes', icon: Music },
  { id: 'rnb', label: 'R&B', icon: Heart },
  { id: 'rap', label: 'RAP', icon: Mic },
  { id: 'smooth-rap', label: 'Smooth Rap', icon: Gem },
  { id: 'lofi', label: 'LO-FI', icon: CloudMoon },
];

const moodTabs: { id: MoodType; label: string; icon: typeof Brain }[] = [
  { id: 'all', label: 'All Moods', icon: Sparkles },
  { id: 'focus', label: 'Focus', icon: Brain },
  { id: 'study', label: 'Study', icon: BookOpen },
  { id: 'chill', label: 'Chill', icon: Sofa },
  { id: 'hustle', label: 'Hustle', icon: Zap },
  { id: 'late-night', label: 'Late Night', icon: Moon },
];

const ListeningMode = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<GenreTab>('vibes');
  const [activeMood, setActiveMood] = useState<MoodType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { recentlyPlayed, addRecentlyPlayed } = useRecentlyPlayed();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  
  const { recommendations } = useLucyRecommendations({
    allContent,
    recentlyPlayed,
    favorites,
    activeMood
  });

  const handleCardInteraction = (item: RecentlyPlayedItem) => {
    addRecentlyPlayed(item);
  };

  const handleToggleFavorite = (item: FavoriteItem) => {
    toggleFavorite(item);
  };

  const filterByMood = <T extends { title: string; subtitle?: string; genre?: string }>(items: T[], genre: string) => {
    if (activeMood === 'all') return items;
    return items.filter(item => {
      const moods = getMoodTags(genre, item.title);
      return moods.includes(activeMood);
    });
  };

  const filterItems = <T extends { title: string; subtitle: string }>(items: T[]) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      item => item.title.toLowerCase().includes(query) || item.subtitle.toLowerCase().includes(query)
    );
  };

  const filteredGenres = useMemo(() => filterItems(filterByMood(genres, 'vibes')), [searchQuery, activeMood]);
  const filteredRap = useMemo(() => filterItems(filterByMood(rapPlaylists, 'rap')), [searchQuery, activeMood]);
  const filteredSmoothRap = useMemo(() => filterItems(filterByMood(smoothRapContent, 'smooth-rap')), [searchQuery, activeMood]);
  const filteredLofi = useMemo(() => filterItems(filterByMood(lofiContent, 'lofi')), [searchQuery, activeMood]);
  const filteredRnb = useMemo(() => filterItems(filterByMood(rnbContent, 'rnb')), [searchQuery, activeMood]);
  const filteredFavorites = useMemo(() => {
    let filtered = favorites;
    if (activeMood !== 'all') {
      filtered = favorites.filter(f => {
        const moods = getMoodTags(f.genre, f.title);
        return moods.includes(activeMood);
      });
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        f => f.title.toLowerCase().includes(query) || (f.subtitle?.toLowerCase().includes(query) ?? false)
      );
    }
    return filtered;
  }, [favorites, searchQuery, activeMood]);

  // Dynamic tabs including favorites if user has any
  const dynamicTabs = useMemo(() => {
    if (favorites.length > 0) {
      return [...tabs, { id: 'favorites' as GenreTab, label: 'Favorites', icon: Star }];
    }
    return tabs;
  }, [favorites.length]);

  const getIconForContent = (contentId: string) => {
    const all = [...genres, ...rapPlaylists, ...smoothRapContent, ...lofiContent, ...rnbContent];
    const found = all.find(c => c.contentId === contentId);
    return found?.icon;
  };

  const getAccentForContent = (contentId: string) => {
    const all = [...genres, ...rapPlaylists, ...smoothRapContent, ...lofiContent, ...rnbContent];
    const found = all.find(c => c.contentId === contentId);
    return found?.accentColor || 'from-primary/20 to-primary/5';
  };

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
                isFavorite={isFavorite(genre.contentId)}
                onToggleFavorite={() => handleToggleFavorite({
                  id: genre.contentId,
                  title: genre.title,
                  subtitle: genre.subtitle,
                  genre: 'vibes',
                  contentType: genre.contentType
                })}
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
          <EmptySearchState query={searchQuery} mood={activeMood} />
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
                isFavorite={isFavorite(playlist.contentId)}
                onToggleFavorite={() => handleToggleFavorite({
                  id: playlist.contentId,
                  title: playlist.title,
                  subtitle: playlist.subtitle,
                  genre: 'rap',
                  contentType: playlist.contentType
                })}
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
          <EmptySearchState query={searchQuery} mood={activeMood} />
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
                isFavorite={isFavorite(item.contentId)}
                onToggleFavorite={() => handleToggleFavorite({
                  id: item.contentId,
                  title: item.title,
                  subtitle: item.subtitle,
                  genre: 'smooth-rap',
                  contentType: item.contentType
                })}
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
          <EmptySearchState query={searchQuery} mood={activeMood} />
        );
      case 'rnb':
        return filteredRnb.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRnb.map((item, index) => (
              <ListeningModeCard
                key={item.contentId}
                title={item.title}
                subtitle={item.subtitle}
                contentId={item.contentId}
                contentType={item.contentType}
                icon={item.icon}
                accentColor={item.accentColor}
                index={index}
                isFavorite={isFavorite(item.contentId)}
                onToggleFavorite={() => handleToggleFavorite({
                  id: item.contentId,
                  title: item.title,
                  subtitle: item.subtitle,
                  genre: 'rnb',
                  contentType: item.contentType
                })}
                onInteraction={() => handleCardInteraction({
                  id: item.contentId,
                  title: item.title,
                  subtitle: item.subtitle,
                  genre: 'rnb',
                  contentType: item.contentType
                })}
              />
            ))}
          </div>
        ) : (
          <EmptySearchState query={searchQuery} mood={activeMood} />
        );
      case 'lofi':
        return filteredLofi.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLofi.map((item, index) => (
              <ListeningModeCard
                key={item.contentId}
                title={item.title}
                subtitle={item.subtitle}
                contentId={item.contentId}
                contentType={item.contentType}
                icon={item.icon}
                accentColor={item.accentColor}
                index={index}
                isFavorite={isFavorite(item.contentId)}
                onToggleFavorite={() => handleToggleFavorite({
                  id: item.contentId,
                  title: item.title,
                  subtitle: item.subtitle,
                  genre: 'lofi',
                  contentType: item.contentType
                })}
                onInteraction={() => handleCardInteraction({
                  id: item.contentId,
                  title: item.title,
                  subtitle: item.subtitle,
                  genre: 'lofi',
                  contentType: item.contentType
                })}
              />
            ))}
          </div>
        ) : (
          <EmptySearchState query={searchQuery} mood={activeMood} />
        );
      case 'favorites':
        return filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((item, index) => (
              <ListeningModeCard
                key={item.id}
                title={item.title}
                subtitle={item.subtitle || ''}
                contentId={item.id}
                contentType={item.contentType}
                icon={getIconForContent(item.id)}
                accentColor={getAccentForContent(item.id)}
                index={index}
                isFavorite={true}
                onToggleFavorite={() => handleToggleFavorite(item)}
                onInteraction={() => handleCardInteraction({
                  id: item.id,
                  title: item.title,
                  subtitle: item.subtitle || '',
                  genre: item.genre,
                  contentType: item.contentType
                })}
              />
            ))}
          </div>
        ) : (
          <EmptyFavoritesState />
        );
    }
  };

  const EmptySearchState = ({ query, mood }: { query: string; mood: MoodType }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
      {query ? (
        <>
          <p className="text-muted-foreground">No results for "{query}"</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
        </>
      ) : mood === 'study' ? (
        <>
          <p className="text-muted-foreground">Lucy is building your perfect study vibe</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Try the LO-FI or Vibes genre</p>
        </>
      ) : mood === 'chill' ? (
        <>
          <p className="text-muted-foreground">Lucy is curating your chill zone</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Try R&B, Smooth Rap, or LO-FI genres</p>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">No matches for {mood} mood</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Try a different mood filter</p>
        </>
      )}
    </motion.div>
  );

  const EmptyFavoritesState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <Star className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
      <p className="text-muted-foreground">Save playlists you love</p>
      <p className="text-sm text-muted-foreground/70 mt-1">Lucy will remember your favorites</p>
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

      {/* Lucy Recommends Section */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border/50 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-pink-500/5"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Lucy Recommends</h2>
                    <p className="text-xs text-muted-foreground">Based on your vibe</p>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {recommendations.map((item, index) => (
                    <ListeningModeCard
                      key={item.id}
                      title={item.title}
                      subtitle={item.subtitle}
                      contentId={item.id}
                      contentType={item.contentType}
                      icon={getIconForContent(item.id)}
                      accentColor={getAccentForContent(item.id)}
                      index={index}
                      compact
                      isFavorite={isFavorite(item.id)}
                      onToggleFavorite={() => handleToggleFavorite({
                        id: item.id,
                        title: item.title,
                        subtitle: item.subtitle,
                        genre: item.genre,
                        contentType: item.contentType
                      })}
                      onInteraction={() => handleCardInteraction({
                        id: item.id,
                        title: item.title,
                        subtitle: item.subtitle,
                        genre: item.genre,
                        contentType: item.contentType
                      })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

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
                      icon={getIconForContent(item.id)}
                      accentColor={getAccentForContent(item.id)}
                      index={index}
                      compact
                      isFavorite={isFavorite(item.id)}
                      onToggleFavorite={() => handleToggleFavorite({
                        id: item.id,
                        title: item.title,
                        subtitle: item.subtitle,
                        genre: item.genre,
                        contentType: item.contentType
                      })}
                      onInteraction={() => handleCardInteraction(item)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Mood Tabs */}
      <div className="border-b border-border/50 bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {moodTabs.map((mood) => {
              const Icon = mood.icon;
              const isActive = activeMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setActiveMood(mood.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {mood.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Genre Tabs + Search */}
      <div className="sticky top-[73px] z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {dynamicTabs.map((tab) => {
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
                    {tab.id === 'favorites' && favorites.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                        {favorites.length}
                      </span>
                    )}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${activeMood}`}
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
