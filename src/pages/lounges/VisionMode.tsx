import React from 'react';
import { motion } from 'framer-motion';
import { Eye, TrendingUp, Map, Compass } from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VisionMode = () => {
  return (
    <CinematicWrapper loungeType="vision">
      <div className="container mx-auto px-4 py-12 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-6">
            <Eye className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Vision Mode
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See beyond the present. Simulate futures. Plan your life and business with strategic foresight.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 border-amber-500/20 backdrop-blur-sm">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-amber-400 mb-2" />
                <CardTitle className="text-lg">Simulate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Run mental simulations. Explore different paths before committing.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 border-amber-500/20 backdrop-blur-sm">
              <CardHeader>
                <Map className="w-8 h-8 text-amber-400 mb-2" />
                <CardTitle className="text-lg">Map</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Visualize your goals as a timeline. See the journey ahead clearly.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/50 border-amber-500/20 backdrop-blur-sm">
              <CardHeader>
                <Compass className="w-8 h-8 text-amber-400 mb-2" />
                <CardTitle className="text-lg">Navigate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Strategic guidance from Lucy to help you reach your destination.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Vision Timeline */}
        <motion.div
          className="mt-16 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="relative h-2 bg-amber-500/20 rounded-full overflow-hidden">
            <motion.div
              className="absolute h-full bg-gradient-to-r from-amber-500 to-amber-300"
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 2, delay: 0.8 }}
            />
          </div>
          <div className="flex justify-between mt-4 text-sm text-muted-foreground">
            <span>Now</span>
            <span>1 Year</span>
            <span>5 Years</span>
            <span>Vision</span>
          </div>
        </motion.div>
      </div>
    </CinematicWrapper>
  );
};

export default VisionMode;
