import React from 'react';
import { motion } from 'framer-motion';
import { Atom, Infinity, Layers, Sparkles } from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const QuantumMode = () => {
  return (
    <CinematicWrapper loungeType="quantum" particleCount={25}>
      <div className="container mx-auto px-4 py-12 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/20 mb-6">
            <Atom className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Quantum Mode
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Non-linear thinking. Fractal exploration. Ideas that exist in superposition.
          </p>
        </motion.div>

        {/* Fractal Visualization */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative w-64 h-64">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border border-cyan-500/30 rounded-lg"
                style={{
                  transform: `rotate(${i * 22.5}deg)`
                }}
                animate={{
                  rotate: [i * 22.5, i * 22.5 + 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 20 + i * 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
                }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <Atom className="w-12 h-12 text-cyan-400" />
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/50 border-cyan-500/20 backdrop-blur-sm">
              <CardHeader>
                <Layers className="w-8 h-8 text-cyan-400 mb-2" />
                <CardTitle className="text-lg">Layered Thinking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Explore ideas across multiple dimensions simultaneously.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-card/50 border-cyan-500/20 backdrop-blur-sm">
              <CardHeader>
                <Infinity className="w-8 h-8 text-cyan-400 mb-2" />
                <CardTitle className="text-lg">Infinite Paths</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Every decision branches into infinite possibilities.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-card/50 border-cyan-500/20 backdrop-blur-sm">
              <CardHeader>
                <Sparkles className="w-8 h-8 text-cyan-400 mb-2" />
                <CardTitle className="text-lg">Idea Collapse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Observe your thoughts and watch possibilities collapse into reality.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quantum state visualization */}
        <motion.div
          className="mt-16 flex justify-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {['Superposition', 'Entanglement', 'Observation'].map((state, i) => (
            <motion.div
              key={state}
              className="text-center"
              animate={{
                opacity: [0.5, 1, 0.5],
                y: [0, -5, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Number.POSITIVE_INFINITY
              }}
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">∿</span>
              </div>
              <p className="text-sm text-muted-foreground">{state}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </CinematicWrapper>
  );
};

export default QuantumMode;
