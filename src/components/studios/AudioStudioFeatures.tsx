import { Sparkles, Mic, Wand2 } from "lucide-react";

export const AudioStudioFeatures = () => {
  const features = [
    { icon: Mic, title: "Audio Recording", desc: "Record and enhance voice." },
    { icon: Wand2, title: "Sound Tools", desc: "Equalizers and processors." },
    { icon: Sparkles, title: "AI Audio", desc: "Generate audio and music." },
  ];

  return (
    <div className="max-w-5xl mx-auto mb-16">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Features</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i} className="glass-card-enhanced p-6 text-center">
            <f.icon className="w-10 h-10 text-white mb-3" />
            <h3 className="text-lg font-semibold text-white">{f.title}</h3>
            <p className="text-white/70 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
