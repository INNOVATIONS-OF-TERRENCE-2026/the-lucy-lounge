import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListeningModeCard } from "@/components/listening/ListeningModeCard";

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
        <div className="max-w-3xl mx-auto space-y-8">
          {/* R&B Genre Card */}
          <ListeningModeCard
            title="R&B Vibes"
            subtitle="Curated R&B for smooth listening"
            playlistId="1kMyrcNKPws587cSAOjyDP"
          />
        </div>
      </main>
    </div>
  );
};

export default ListeningMode;
