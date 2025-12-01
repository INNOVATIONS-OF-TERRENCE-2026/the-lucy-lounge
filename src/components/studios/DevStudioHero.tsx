export const DevStudioHero = () => {
  return (
    <div className="text-center mb-16 max-w-5xl mx-auto">
      <div className="mb-8 flex justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-glow-violet">
          <span className="text-4xl text-white font-bold">Dev</span>
        </div>
      </div>

      <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white text-shadow-strong">
        Dev Studio
      </h1>

      <p className="text-xl md:text-2xl text-white/90 mb-8 text-shadow-soft">
        Express Development — inside Lucy.
      </p>

      <p className="text-lg text-white/80 max-w-3xl mx-auto">
        Build websites, apps, automation, and SaaS tools with an AI-enhanced
        development environment.
      </p>
    </div>
  );
};
