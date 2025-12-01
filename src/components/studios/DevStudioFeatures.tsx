import { Globe, Code, GitMerge, Layers, Database } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "AI Code Generation",
    description: "Convert ideas into production-ready code."
  },
  {
    icon: Globe,
    title: "Web App Builder",
    description: "Generate full-stack web apps instantly."
  },
  {
    icon: Database,
    title: "Database Designer",
    description: "Build schema + backend logic automatically."
  },
  {
    icon: Layers,
    title: "Component Library",
    description: "Reusable UI blocks and design patterns."
  },
  {
    icon: GitMerge,
    title: "Version Control",
    description: "Git workflow and code collaboration built-in."
  }
];

export const DevStudioFeatures = () => {
  return (
    <div className="max-w-6xl mx-auto mb-20">
      <h2 className="text-3xl font-bold text-white mb-10 text-center">
        Development Capabilities
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="glass-card-enhanced p-6 hover:scale-105 transition-transform"
          >
            <feature.icon className="w-10 h-10 text-white mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-white/80 text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
