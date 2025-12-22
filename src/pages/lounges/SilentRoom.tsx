import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VolumeX, Users, Heart, Coffee } from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SilentRoom = () => {
  const [presenceCount, setPresenceCount] = useState(3);

  // Simulate presence updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPresenceCount(prev => Math.max(1, Math.min(12, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CinematicWrapper loungeType="silent" particleCount={6}>
      <div className="container mx-auto px-4 py-12 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-500/20 mb-6">
            <VolumeX className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Silent Social
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Shared presence without forced conversation. Just be here, together.
          </p>
        </motion.div>

        {/* Presence Indicator */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-card/50 border border-border/30">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground font-medium">{presenceCount} others here</span>
            <div className="flex -space-x-2 ml-2">
              {[...Array(Math.min(presenceCount, 5))].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-background"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                />
              ))}
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
            <Card className="bg-card/50 border-gray-500/20 backdrop-blur-sm">
              <CardHeader>
                <VolumeX className="w-8 h-8 text-gray-400 mb-2" />
                <CardTitle className="text-lg">No Pressure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  No obligation to chat or respond. Just exist in shared space.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-card/50 border-gray-500/20 backdrop-blur-sm">
              <CardHeader>
                <Heart className="w-8 h-8 text-gray-400 mb-2" />
                <CardTitle className="text-lg">Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Feel the subtle presence of others. You're not alone.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-card/50 border-gray-500/20 backdrop-blur-sm">
              <CardHeader>
                <Coffee className="w-8 h-8 text-gray-400 mb-2" />
                <CardTitle className="text-lg">Comfort</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Like sitting in a quiet café. Peaceful coexistence.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Breathing indicator */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="w-32 h-32 rounded-full bg-gray-500/10 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="text-muted-foreground text-sm">Breathe</span>
          </motion.div>
        </motion.div>
      </div>
    </CinematicWrapper>
  );
};

export default SilentRoom;
