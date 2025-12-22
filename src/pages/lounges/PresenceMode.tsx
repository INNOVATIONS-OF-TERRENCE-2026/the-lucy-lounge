import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Wind, Leaf, Heart } from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';

const PresenceMode = () => {
  return (
    <CinematicWrapper loungeType="presence" particleCount={8}>
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        {/* Central breathing element */}
        <motion.div
          className="relative mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Outer glow rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-foreground/10"
              style={{
                inset: -20 * (i + 1),
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{
                duration: 4,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Central orb */}
          <motion.div
            className="w-40 h-40 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center"
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 60px rgba(255,255,255,0.1)',
                '0 0 80px rgba(255,255,255,0.2)',
                '0 0 60px rgba(255,255,255,0.1)'
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sun className="w-16 h-16 text-foreground/40" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          className="text-center max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-4xl font-light text-foreground mb-4">
            Just Be
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            No tasks. No goals. No expectations.<br />
            Simply exist in this moment.
          </p>
        </motion.div>

        {/* Subtle indicators */}
        <motion.div
          className="flex gap-12 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[
            { icon: Wind, label: 'Breathe' },
            { icon: Leaf, label: 'Ground' },
            { icon: Heart, label: 'Feel' }
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="text-center"
              animate={{
                y: [0, -5, 0],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 4,
                delay: i * 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <item.icon className="w-8 h-8 text-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                {item.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Time indicator (very subtle) */}
        <motion.p
          className="absolute bottom-8 text-xs text-muted-foreground/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          You've been present for a moment
        </motion.p>
      </div>
    </CinematicWrapper>
  );
};

export default PresenceMode;
