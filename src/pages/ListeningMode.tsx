import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, Heart, Music, Coffee, Waves, Mic, Gem, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListeningModeCard } from "@/components/listening/ListeningModeCard";

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

const ListeningMode = () => {
  const navigate = useNavigate();

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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Vibes Section */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Vibes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {genres.map((genre) => (
                <ListeningModeCard
                  key={genre.contentId}
                  title={genre.title}
                  subtitle={genre.subtitle}
                  contentId={genre.contentId}
                  contentType={genre.contentType}
                  icon={genre.icon}
                  accentColor={genre.accentColor}
                />
              ))}
            </div>
          </section>

          {/* RAP Section */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              RAP
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rapPlaylists.map((playlist) => (
                <ListeningModeCard
                  key={playlist.contentId}
                  title={playlist.title}
                  subtitle={playlist.subtitle}
                  contentId={playlist.contentId}
                  contentType={playlist.contentType}
                  icon={playlist.icon}
                  accentColor={playlist.accentColor}
                />
              ))}
            </div>
          </section>

          {/* SMOOTH RAP Section */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Gem className="w-5 h-5 text-primary" />
              Smooth Rap
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {smoothRapContent.map((item) => (
                <ListeningModeCard
                  key={item.contentId}
                  title={item.title}
                  subtitle={item.subtitle}
                  contentId={item.contentId}
                  contentType={item.contentType}
                  icon={item.icon}
                  accentColor={item.accentColor}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ListeningMode;
