import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Cloud, Sparkles, BookOpen } from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DreamMode = () => {
  return (
    <CinematicWrapper loungeType="dream" particleCount={20}>
      <div className="container mx-auto px-4 py-12 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-6">
            <Moon className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Dream Mode
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Drift into creative exploration. Let your imagination wander through ambient soundscapes.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <Cloud className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-lg">Drift</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Let your thoughts flow freely. No structure, just pure creative exploration.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <Sparkles className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-lg">Inspire</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Ambient visuals and soundscapes designed to spark your imagination.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-lg">Journal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Capture fleeting thoughts and dream fragments before they fade away.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Dreamy Orbs */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="relative w-80 h-80">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-16 h-16 rounded-full bg-purple-500/20 blur-xl"
                style={{
                  left: `${30 + Math.cos(i * Math.PI / 3) * 40}%`,
                  top: `${30 + Math.sin(i * Math.PI / 3) * 40}%`
                }}
                animate={{
                  x: [0, 20, -10, 0],
                  y: [0, -15, 10, 0],
                  scale: [1, 1.2, 0.9, 1]
                }}
                transition={{
                  duration: 8 + i,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <Moon className="w-16 h-16 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>
    </CinematicWrapper>
  );
};

export default DreamMode;
