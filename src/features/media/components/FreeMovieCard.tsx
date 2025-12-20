import { Play, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FreeMediaItem } from "../services/youtubeCatalog";

interface FreeMovieCardProps {
  item: FreeMediaItem;
  onPlay: (item: FreeMediaItem) => void;
}

export function FreeMovieCard({ item, onPlay }: FreeMovieCardProps) {
  const thumbnailUrl =
    item.provider === "youtube"
      ? `https://img.youtube.com/vi/${item.id}/mqdefault.jpg`
      : "/placeholder.svg";

  return (
    <Card className="group overflow-hidden bg-card/50 hover:bg-card/80 transition-all duration-300 border-border/50">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            size="lg"
            onClick={() => onPlay(item)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Play className="h-5 w-5 fill-current" />
            Play
          </Button>
        </div>
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 text-xs bg-black/60 text-white"
        >
          {item.provider === "youtube" ? "YouTube" : "Vimeo"}
        </Badge>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 text-foreground mb-1">
          {item.title}
        </h3>
        {item.channel && (
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <Film className="h-3 w-3" />
            {item.channel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
