import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EmbeddedPlayerModalProps {
  open: boolean;
  onClose: () => void;
  provider: "youtube" | "vimeo";
  id: string;
  title: string;
}

export function EmbeddedPlayerModal({
  open,
  onClose,
  provider,
  id,
  title,
}: EmbeddedPlayerModalProps) {
  if (!open || !id) return null;

  const src =
    provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`
      : `https://player.vimeo.com/video/${encodeURIComponent(id)}?autoplay=1`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white truncate max-w-[80%]">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={src}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
