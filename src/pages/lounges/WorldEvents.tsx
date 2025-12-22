import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Radio, Users, Zap } from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WorldEvents = () => {
  // Mock live events
  const events = [
    { id: 1, title: 'Global Focus Session', participants: 1247, status: 'live' },
    { id: 2, title: 'Creative Workshop', participants: 856, status: 'live' },
    { id: 3, title: 'Midnight Meditation', participants: 0, status: 'upcoming' }
  ];

  return (
    <CinematicWrapper loungeType="events" particleCount={15}>
      <div className="container mx-auto px-4 py-12 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
            <Globe className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            World Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Global shared moments. Live sessions. Join thousands experiencing Lucy together.
          </p>
        </motion.div>

        {/* Live indicator */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/30">
            <motion.div
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-red-400 font-medium">2 Live Events</span>
          </div>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className={`bg-card/50 backdrop-blur-sm ${event.status === 'live' ? 'border-red-500/40' : 'border-border/30'}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    {event.status === 'live' ? (
                      <motion.div
                        className="flex items-center gap-1 text-red-400 text-xs"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Radio className="w-3 h-3" />
                        LIVE
                      </motion.div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Upcoming</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {event.status === 'live' ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{event.participants.toLocaleString()} joined</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Starting soon...</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-card/50 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <Radio className="w-8 h-8 text-red-400 mb-2" />
                <CardTitle className="text-lg">Live Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Join real-time experiences with the global Lucy community.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-card/50 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <Users className="w-8 h-8 text-red-400 mb-2" />
                <CardTitle className="text-lg">Shared Energy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Feel the collective presence of thousands focused together.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-card/50 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <Zap className="w-8 h-8 text-red-400 mb-2" />
                <CardTitle className="text-lg">Massive Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Experience cinematic energy at a global scale.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Global visualization */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="relative">
            <motion.div
              className="w-48 h-48 rounded-full border-2 border-red-500/30 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 30px rgba(239, 68, 68, 0.1)',
                  '0 0 60px rgba(239, 68, 68, 0.3)',
                  '0 0 30px rgba(239, 68, 68, 0.1)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Globe className="w-24 h-24 text-red-400/50" />
            </motion.div>
            {/* Ping indicators */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-red-500"
                style={{
                  left: `${50 + Math.cos(i * Math.PI * 2 / 5) * 45}%`,
                  top: `${50 + Math.sin(i * Math.PI * 2 / 5) * 45}%`
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </CinematicWrapper>
  );
};

export default WorldEvents;
