import { LucideIcon } from "lucide-react";
import { SpotifyEmbed } from "./SpotifyEmbed";

interface ListeningModeCardProps {
  title: string;
  subtitle: string;
  playlistId: string;
  icon?: LucideIcon;
  accentColor?: string;
}

export const ListeningModeCard = ({ 
  title, 
  subtitle, 
  playlistId,
  icon: Icon,
  accentColor = "from-primary/20 to-primary/5"
}: ListeningModeCardProps) => {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${accentColor} backdrop-blur-sm border border-border/50 p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="mb-4 flex items-center gap-3">
        {Icon && <Icon className="w-6 h-6 text-primary" />}
        <div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>
      <SpotifyEmbed playlistId={playlistId} title={title} />
    </div>
  );
};
