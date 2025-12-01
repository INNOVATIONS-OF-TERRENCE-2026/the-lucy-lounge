import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export const DevStudioCTA = () => {
  return (
    <div className="max-w-4xl mx-auto text-center mb-24">
      <h2 className="text-3xl font-bold text-white mb-6">
        Build With Express Development
      </h2>

      <p className="text-white/80 mb-8 max-w-2xl mx-auto">
        Full development features are being integrated into Lucy Studios.
        Website, app, and SaaS building tools coming soon.
      </p>

      <Button
        size="lg"
        variant="outline"
        className="border-white text-white hover:bg-white/10"
        disabled
      >
        <Rocket className="w-5 h-5 mr-2" />
        Launch Dev Studio (Coming Soon)
      </Button>
    </div>
  );
};
