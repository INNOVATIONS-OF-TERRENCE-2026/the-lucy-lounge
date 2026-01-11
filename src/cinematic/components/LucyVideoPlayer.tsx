import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Film } from "lucide-react";

interface Props {
  videoUrl: string | null;
  title?: string;
}

export const LucyVideoPlayer: React.FC<Props> = ({ videoUrl, title }) => {
  if (!videoUrl) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Film className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-sm">No video generated yet</p>
          <p className="text-xs mt-1">Enter a prompt and click Generate</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {title && (
          <div className="p-3 border-b bg-muted/30">
            <p className="text-sm font-medium">{title}</p>
          </div>
        )}
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          className="w-full aspect-video bg-black"
        />
      </CardContent>
    </Card>
  );
};
