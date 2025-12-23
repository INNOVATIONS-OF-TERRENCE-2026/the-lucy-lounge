import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLucyWorlds, LucyWorld } from '@/contexts/LucyWorldsContext';

// GPU-optimized world renderers
const CelestialCore = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Star field */}
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270,30%,5%)] via-[hsl(260,40%,8%)] to-[hsl(280,35%,6%)]" />
    {/* Nebula glow */}
    <motion.div
      className="absolute inset-0 opacity-30"
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, hsl(270 60% 30% / 0.4) 0%, transparent 50%)',
      }}
      animate={{ opacity: [0.2, 0.35, 0.2] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute inset-0 opacity-20"
      style={{
        background: 'radial-gradient(ellipse at 70% 80%, hsl(220 70% 40% / 0.3) 0%, transparent 50%)',
      }}
      animate={{ opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    {/* Stars */}
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: 0.3 + Math.random() * 0.5,
        }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
      />
    ))}
  </div>
));

const NeonNexus = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(260,30%,5%)] via-[hsl(280,25%,8%)] to-[hsl(250,35%,6%)]" />
    {/* Neon grid lines */}
    <div className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: `
          linear-gradient(90deg, hsl(180 100% 50% / 0.1) 1px, transparent 1px),
          linear-gradient(180deg, hsl(320 100% 60% / 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
    {/* Holographic scan line */}
    <motion.div
      className="absolute left-0 right-0 h-[2px]"
      style={{ background: 'linear-gradient(90deg, transparent, hsl(180 100% 50% / 0.5), transparent)' }}
      animate={{ top: ['-2px', '100%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    />
    {/* Neon glow spots */}
    <motion.div
      className="absolute w-64 h-64 rounded-full blur-3xl"
      style={{ background: 'hsl(180 100% 50% / 0.15)', left: '10%', top: '20%' }}
      animate={{ opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <motion.div
      className="absolute w-48 h-48 rounded-full blur-3xl"
      style={{ background: 'hsl(320 100% 60% / 0.15)', right: '15%', bottom: '30%' }}
      animate={{ opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
    />
  </div>
));

const NeuralDeep = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(200,30%,5%)] via-[hsl(220,35%,8%)] to-[hsl(240,30%,6%)]" />
    {/* Neural network nodes */}
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-3 h-3 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(200 80% 55%) 0%, hsl(280 70% 60% / 0.5) 100%)',
          left: `${15 + (i % 4) * 25}%`,
          top: `${20 + Math.floor(i / 4) * 30}%`,
          boxShadow: '0 0 20px hsl(200 80% 55% / 0.5)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
    {/* Synapse connections */}
    <svg className="absolute inset-0 w-full h-full opacity-20">
      <motion.path
        d="M15% 20% Q 50% 35%, 65% 50%"
        stroke="url(#neuralGradient)"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <defs>
        <linearGradient id="neuralGradient">
          <stop offset="0%" stopColor="hsl(200 80% 55%)" />
          <stop offset="100%" stopColor="hsl(280 70% 60%)" />
        </linearGradient>
      </defs>
    </svg>
  </div>
));

const Dreamveil = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(260,25%,8%)] via-[hsl(280,30%,10%)] to-[hsl(270,20%,6%)]" />
    {/* Dreamy particles */}
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full blur-sm"
        style={{
          background: `hsl(${260 + i * 5} 50% 70% / 0.4)`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, Math.random() * 20 - 10, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
      />
    ))}
    {/* Aurora shimmer */}
    <motion.div
      className="absolute inset-0 opacity-20"
      style={{
        background: 'linear-gradient(135deg, hsl(260 50% 60% / 0.2) 0%, hsl(300 40% 70% / 0.2) 50%, hsl(280 45% 55% / 0.2) 100%)',
      }}
      animate={{ opacity: [0.1, 0.25, 0.1] }}
      transition={{ duration: 8, repeat: Infinity }}
    />
  </div>
));

const SilentVoid = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[hsl(0,0%,4%)]" />
    {/* Single subtle light source */}
    <motion.div
      className="absolute w-96 h-96 rounded-full"
      style={{
        background: 'radial-gradient(circle, hsl(0 0% 15% / 0.3) 0%, transparent 70%)',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
      animate={{ opacity: [0.2, 0.35, 0.2] }}
      transition={{ duration: 10, repeat: Infinity }}
    />
  </div>
));

const QuantumRift = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(180,20%,5%)] via-[hsl(260,25%,8%)] to-[hsl(320,20%,6%)]" />
    {/* Quantum fluctuations */}
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          width: 100 + i * 30,
          height: 100 + i * 30,
          border: '1px solid hsl(180 70% 50% / 0.2)',
          borderRadius: '50%',
          left: `${30 + i * 5}%`,
          top: `${25 + i * 5}%`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 6 + i, repeat: Infinity, ease: 'linear' }}
      />
    ))}
    {/* Temporal distortion */}
    <motion.div
      className="absolute w-full h-full"
      style={{
        background: 'conic-gradient(from 0deg at 50% 50%, hsl(180 70% 50% / 0.1) 0deg, hsl(320 60% 55% / 0.1) 180deg, hsl(180 70% 50% / 0.1) 360deg)',
      }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
    />
  </div>
));

const CommandBridge = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(210,30%,6%)] via-[hsl(220,35%,8%)] to-[hsl(200,25%,5%)]" />
    {/* HUD grid */}
    <div className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `
          linear-gradient(90deg, hsl(210 80% 45%) 1px, transparent 1px),
          linear-gradient(180deg, hsl(210 80% 45%) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    />
    {/* Status indicators */}
    {Array.from({ length: 6 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-1 rounded-full"
        style={{
          width: 60 + i * 20,
          background: i % 2 === 0 ? 'hsl(210 80% 45%)' : 'hsl(30 90% 50%)',
          left: `${10 + i * 12}%`,
          bottom: '10%',
          opacity: 0.6,
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
    {/* Corner brackets */}
    <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/30" />
    <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary/30" />
    <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary/30" />
    <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/30" />
  </div>
));

const Codefall = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(120,20%,4%)] via-[hsl(140,25%,6%)] to-[hsl(130,20%,3%)]" />
    {/* Digital rain columns */}
    {Array.from({ length: 15 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-px opacity-30"
        style={{
          height: 100 + Math.random() * 200,
          background: 'linear-gradient(180deg, transparent, hsl(120 80% 45%), transparent)',
          left: `${5 + i * 6.5}%`,
        }}
        animate={{ y: ['-100%', '100vh'] }}
        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2, ease: 'linear' }}
      />
    ))}
    {/* Code glyphs */}
    {['0', '1', '{', '}', '<', '>', '/'].map((char, i) => (
      <motion.div
        key={i}
        className="absolute text-xs font-mono text-green-500/40"
        style={{ left: `${10 + i * 12}%`, top: `${20 + i * 8}%` }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
      >
        {char}
      </motion.div>
    ))}
  </div>
));

const AstralArchive = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(40,20%,6%)] via-[hsl(35,25%,8%)] to-[hsl(45,15%,5%)]" />
    {/* Floating glyphs/books */}
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-4 h-6 rounded-sm"
        style={{
          background: `linear-gradient(135deg, hsl(45 80% 55% / 0.3), hsl(30 60% 45% / 0.2))`,
          left: `${15 + i * 10}%`,
          top: `${25 + (i % 3) * 20}%`,
          boxShadow: '0 0 15px hsl(45 80% 55% / 0.3)',
        }}
        animate={{
          y: [0, -10, 0],
          rotate: [-5, 5, -5],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
      />
    ))}
    {/* Wisdom dust */}
    <motion.div
      className="absolute inset-0 opacity-20"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, hsl(45 80% 55% / 0.2) 0%, transparent 60%)',
      }}
      animate={{ opacity: [0.1, 0.25, 0.1] }}
      transition={{ duration: 6, repeat: Infinity }}
    />
  </div>
));

const LivingCore = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(15,25%,6%)] via-[hsl(350,30%,8%)] to-[hsl(20,20%,5%)]" />
    {/* Pulsing core */}
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 200,
        height: 200,
        background: 'radial-gradient(circle, hsl(15 90% 55% / 0.4) 0%, hsl(350 80% 50% / 0.2) 50%, transparent 70%)',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(30px)',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.4, 0.7, 0.4],
      }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    {/* Heartbeat rings */}
    {Array.from({ length: 3 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border"
        style={{
          width: 100 + i * 80,
          height: 100 + i * 80,
          borderColor: 'hsl(15 90% 55% / 0.2)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.5],
          opacity: [0.3, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
      />
    ))}
  </div>
));

const worldComponents: Record<LucyWorld, React.ComponentType | null> = {
  'celestial-core': CelestialCore,
  'neon-nexus': NeonNexus,
  'neural-deep': NeuralDeep,
  'dreamveil': Dreamveil,
  'silent-void': SilentVoid,
  'quantum-rift': QuantumRift,
  'command-bridge': CommandBridge,
  'codefall': Codefall,
  'astral-archive': AstralArchive,
  'living-core': LivingCore,
  'none': null,
};

CelestialCore.displayName = 'CelestialCore';
NeonNexus.displayName = 'NeonNexus';
NeuralDeep.displayName = 'NeuralDeep';
Dreamveil.displayName = 'Dreamveil';
SilentVoid.displayName = 'SilentVoid';
QuantumRift.displayName = 'QuantumRift';
CommandBridge.displayName = 'CommandBridge';
Codefall.displayName = 'Codefall';
AstralArchive.displayName = 'AstralArchive';
LivingCore.displayName = 'LivingCore';

export const LucyWorldsOverlay = memo(function LucyWorldsOverlay() {
  const { activeWorld, transitionState } = useLucyWorlds();
  
  const WorldComponent = useMemo(() => worldComponents[activeWorld], [activeWorld]);

  if (!WorldComponent) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeWorld}
        className="fixed inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: transitionState === 'transitioning' ? 0.5 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <WorldComponent />
      </motion.div>
    </AnimatePresence>
  );
});
