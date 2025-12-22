import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Target, Lightbulb } from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NeuralMode = () => {
  return (
    <CinematicWrapper loungeType="neural">
      <div className="container mx-auto px-4 py-12 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-6">
            <Brain className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Neural Mode
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter deep cognition. Focus your mind. Let Lucy guide your thoughts with calm, rhythmic pulses.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <Zap className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-lg">Deep Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Eliminate distractions. Enter a state of pure concentration with neural-optimized ambiance.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <Target className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-lg">Task Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Break down complex problems. Lucy helps you navigate cognitive challenges.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <Lightbulb className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-lg">Clarity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Find mental clarity through minimal neural visuals and calming pulses.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Neural Activity Visualization */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="relative w-64 h-64">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-blue-500/30"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.1, 0.5]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-16 h-16 text-blue-400" />
            </div>
          </div>
        </motion.div>
      </div>
    </CinematicWrapper>
  );
};

export default NeuralMode;
