import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, Heart, Music, Coffee, Waves, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListeningModeCard } from "@/components/listening/ListeningModeCard";

const genres = [
  {
    title: "R&B Vibes",
    subtitle: "Curated R&B for smooth listening",
    playlistId: "1kMyrcNKPws587cSAOjyDP",
    icon: Heart,
    accentColor: "from-pink-500/20 to-rose-500/5"
  },
  {
    title: "Jazz Vibes",
    subtitle: "Smooth jazz for focus and relaxation",
    playlistId: "37i9dQZF1DXbITWG1ZJKYt",
    icon: Music,
    accentColor: "from-amber-500/20 to-orange-500/5"
  },
  {
    title: "Lo-Fi Vibes",
    subtitle: "Chill beats to study and relax",
    playlistId: "37i9dQZF1DWWQRwui0ExPn",
    icon: Coffee,
    accentColor: "from-violet-500/20 to-purple-500/5"
  },
  {
    title: "Ambient Vibes",
    subtitle: "Atmospheric sounds for deep focus",
    playlistId: "37i9dQZF1DX3Ogo9pFvBkY",
    icon: Waves,
    accentColor: "from-cyan-500/20 to-teal-500/5"
  }
];

const rapPlaylists = [
  {
    title: "🔥 Best of Jeezy",
    subtitle: "Street anthems and trap classics",
    playlistId: "62FBSHL4fu93EYWT18tgL7",
    icon: Mic,
    accentColor: "from-red-500/20 to-orange-500/5"
  },
  {
    title: "🏁 Best of Nipsey Hussle",
    subtitle: "Marathon energy, West Coast legacy",
    playlistId: "1SIx1DgtH8YrQoiq4Wx4L2",
    icon: Mic,
    accentColor: "from-blue-500/20 to-indigo-500/5"
  },
  {
    title: "🐬 Best of Young Dolph",
    subtitle: "Memphis hustle, boss motivation",
    playlistId: "5TkM6OUHeFujrujopXrzua",
    icon: Mic,
    accentColor: "from-emerald-500/20 to-teal-500/5"
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
                  key={genre.playlistId}
                  title={genre.title}
                  subtitle={genre.subtitle}
                  playlistId={genre.playlistId}
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
                  key={playlist.playlistId}
                  title={playlist.title}
                  subtitle={playlist.subtitle}
                  playlistId={playlist.playlistId}
                  icon={playlist.icon}
                  accentColor={playlist.accentColor}
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
