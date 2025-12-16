import { SpotifyEmbed } from "./SpotifyEmbed";

interface ListeningModeCardProps {
  title: string;
  subtitle: string;
  playlistId: string;
}

export const ListeningModeCard = ({ title, subtitle, playlistId }: ListeningModeCardProps) => {
  return (
    <div className="rounded-xl bg-card/60 backdrop-blur-sm border border-border/50 p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <SpotifyEmbed playlistId={playlistId} title={title} />
    </div>
  );
};
