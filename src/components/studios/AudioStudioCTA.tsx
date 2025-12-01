import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const AudioStudioCTA = () => {
  return (
    <div className="max-w-4xl mx-auto text-center mb-24">
      <h2 className="text-3xl font-bold text-white mb-6">
        The Next Generation of Sound
      </h2>

      <p className="text-white/80 mb-8 max-w-2xl mx-auto">
        Express Audio Power is being fully integrated into Lucy Studios.
        Music and audio creation, transformation, and production—coming soon.
      </p>

      <Button
        size="lg"
        variant="outline"
        className="border-white text-white hover:bg-white/10"
        disabled
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Launch Audio Studio (Coming Soon)
      </Button>
    </div>
  );
};
