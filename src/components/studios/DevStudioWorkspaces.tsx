import { Settings, Rocket, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const workspaces = [
  {
    icon: LayoutDashboard,
    title: "App Builder",
    description: "Generate fully functioning apps and dashboards.",
    status: "Coming Soon"
  },
  {
    icon: Rocket,
    title: "SaaS Generator",
    description: "Build entire SaaS products with auth + billing.",
    status: "Coming Soon"
  },
  {
    icon: Settings,
    title: "Automation Studio",
    description: "Create automated workflows and systems.",
    status: "Coming Soon"
  }
];

export const DevStudioWorkspaces = () => {
  return (
    <div className="max-w-6xl mx-auto mb-20">
      <h2 className="text-3xl font-bold text-white mb-10 text-center">
        Workspaces
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workspaces.map((ws, index) => (
          <div
            key={index}
            className="glass-card-enhanced p-8 text-center"
          >
            <ws.icon className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {ws.title}
            </h3>

            <p className="text-white/70 mb-4">
              {ws.description}
            </p>

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
