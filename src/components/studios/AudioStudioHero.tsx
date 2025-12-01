import { LucyAvatar } from "@/components/avatar/LucyAvatar";

export const AudioStudioHero = () => {
  return (
    <div className="text-center mb-16 max-w-5xl mx-auto">
      <div className="mb-8 flex justify-center">
        <LucyAvatar size="lg" state="talking" className="drop-shadow-2xl" />
      </div>

      <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-shadow-strong">Audio Studio</h1>

      <p className="text-xl md:text-2xl text-white/90 mb-8 text-shadow-soft">Express Audio Power — inside Lucy.</p>

      <p className="text-lg text-white/80 max-w-3xl mx-auto">
        Create, transform, and explore audio with the next-generation AI-powered sound workstation.
      </p>
    </div>
  );
};
