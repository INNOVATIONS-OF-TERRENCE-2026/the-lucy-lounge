import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BookMarked, TrendingUp, Star } from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MemoryTimeline = () => {
  // Sample timeline events
  const events = [
    { id: 1, title: 'First Conversation', date: 'Day 1', type: 'milestone' },
    { id: 2, title: 'Deep Focus Session', date: 'Week 2', type: 'session' },
    { id: 3, title: 'Creative Breakthrough', date: 'Month 1', type: 'achievement' },
    { id: 4, title: 'Vision Planning', date: 'Month 2', type: 'session' },
    { id: 5, title: 'Today', date: 'Now', type: 'current' }
  ];

  return (
    <CinematicWrapper loungeType="timeline">
      <div className="container mx-auto px-4 py-12 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-600/20 mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Memory Timeline
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your journey with Lucy. Every session, every insight, every growth moment.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-amber-500/30" />

          {events.map((event, index) => (
            <motion.div
              key={event.id}
              className={`flex items-center mb-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                <Card className={`bg-card/50 border-amber-500/20 backdrop-blur-sm inline-block ${event.type === 'current' ? 'border-amber-500' : ''}`}>
                  <CardContent className="p-4">
                    <p className="text-sm text-amber-500 font-medium">{event.date}</p>
                    <p className="text-foreground font-semibold">{event.title}</p>
                  </CardContent>
                </Card>
              </div>
              <div className="w-2/12 flex justify-center">
                <motion.div
                  className={`w-4 h-4 rounded-full ${event.type === 'current' ? 'bg-amber-500' : 'bg-amber-500/50'} border-4 border-background`}
                  animate={event.type === 'current' ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="w-5/12" />
            </motion.div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-card/50 border-amber-500/20 backdrop-blur-sm">
              <CardHeader>
                <BookMarked className="w-8 h-8 text-amber-500 mb-2" />
                <CardTitle className="text-lg">Session Replay</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Revisit past conversations and rediscover insights.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="bg-card/50 border-amber-500/20 backdrop-blur-sm">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-amber-500 mb-2" />
                <CardTitle className="text-lg">Growth Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  See how far you've come. Visualize your progress.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="bg-card/50 border-amber-500/20 backdrop-blur-sm">
              <CardHeader>
                <Star className="w-8 h-8 text-amber-500 mb-2" />
                <CardTitle className="text-lg">Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Celebrate achievements and breakthrough moments.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </CinematicWrapper>
  );
};

export default MemoryTimeline;
