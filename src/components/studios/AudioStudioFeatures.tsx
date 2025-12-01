import { Music, Mic, Volume2, SlidersHorizontal } from "lucide-react";

const features = [
  {
    icon: Music,
    title: "Music Creation",
    description: "Generate original melodies, beats, and soundscapes.",
  },
  {
    icon: Mic,
    title: "Voice Studio",
    description: "Record, enhance, and transform voice audio.",
  },
  {
    icon: Volume2,
    title: "Sound Enhancer",
    description: "Boost clarity, EQ, reverb, and mastering effects.",
  },
  {
    icon: SlidersHorizontal,
    title: "Audio Filters",
    description: "Apply advanced filters and shaping tools.",
  },
];

export const AudioStudioFeatures = () => {
  return (
    <div className="max-w-6xl mx-auto mb-20">
      <h2 className="text-3xl font-bold text-white mb-10 text-center">Powerful Audio Capabilities</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="glass-card-enhanced p-8 hover:scale-105 transition-transform">
            <feature.icon className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-white/70">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
