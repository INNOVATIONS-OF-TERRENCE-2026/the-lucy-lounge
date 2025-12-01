import { Button } from "@/components/ui/button";
import { Music2, FileAudio2, Settings2 } from "lucide-react";

const workspaces = [
  {
    icon: Music2,
    title: "Music Studio",
    description: "Compose, arrange, and generate new tracks.",
    status: "Coming Soon"
  },
  {
    icon: FileAudio2,
    title: "Audio Projects",
    description: "Manage your saved audio creations and files.",
    status: "Coming Soon"
  },
  {
    icon: Settings2,
    title: "Mastering / FX",
    description: "Effects, mixing, mastering, and transformation tools.",
    status: "Coming Soon"
  }
];

export const AudioStudioWorkspaces = () => {
  return (
    <div className="max-w-6xl mx-auto mb-20">
      <h2 className="text-3xl font-bold text-white mb-10 text-center">
        Workspaces
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workspaces.map((ws, index) => (
          <div key={index} className="glass-card-enhanced p-8 text-center">
            <ws.icon className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {ws.title}
            </h3>
            <p className="text-white/70 mb-4">{ws.description}</p>

            <Button
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white/10"
              disabled
            >
              {ws.status}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
