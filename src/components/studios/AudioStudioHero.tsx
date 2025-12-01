import { Music } from "lucide-react";

export const AudioStudioHero = () => {
  return (
    <div className="text-center mb-16 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-glow-violet">
          <Music className="w-12 h-12 text-white" />
        </div>
      </div>

      <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-shadow-strong">Audio Studio</h1>

      <p className="text-xl md:text-2xl text-white/90 mb-8">Express Audio Power</p>

      <p className="text-lg text-white/80">Audio creation, sound intelligence, and tools inside Lucy.</p>
    </div>
  );
};
