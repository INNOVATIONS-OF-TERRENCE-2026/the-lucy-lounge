import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Shield, Activity, Zap } from 'lucide-react';
import { CinematicWrapper } from '@/components/cinematic/CinematicWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CommandCenter = () => {
  // Mock system stats
  const stats = [
    { label: 'Active Users', value: '2,847', change: '+12%' },
    { label: 'Sessions Today', value: '14,523', change: '+8%' },
    { label: 'System Health', value: '99.9%', change: 'Stable' },
    { label: 'API Response', value: '45ms', change: 'Fast' }
  ];

  return (
    <CinematicWrapper loungeType="command" particleCount={8}>
      <div className="container mx-auto px-4 py-12 min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-500/20 mb-6">
            <Terminal className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Command Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Admin control panel. Monitor, manage, and orchestrate Lucy Lounge.
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/30">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Admin Only</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="bg-card/50 border-slate-500/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-green-400 mt-1">{stat.change}</p>
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
            <Card className="bg-card/50 border-slate-500/20 backdrop-blur-sm">
              <CardHeader>
                <Activity className="w-8 h-8 text-slate-400 mb-2" />
                <CardTitle className="text-lg">Platform Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Real-time insights into system performance and user activity.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-card/50 border-slate-500/20 backdrop-blur-sm">
              <CardHeader>
                <Shield className="w-8 h-8 text-slate-400 mb-2" />
                <CardTitle className="text-lg">Access Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Manage user roles, permissions, and security settings.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-card/50 border-slate-500/20 backdrop-blur-sm">
              <CardHeader>
                <Zap className="w-8 h-8 text-slate-400 mb-2" />
                <CardTitle className="text-lg">Event Triggers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Initiate global events, announcements, and system updates.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Console-style activity log */}
        <motion.div
          className="mt-12 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4 font-mono text-sm">
              <p className="text-green-400">{">"} System initialized...</p>
              <p className="text-slate-400">{">"} All services operational</p>
              <p className="text-blue-400">{">"} Lucy Lounge Command Center active</p>
              <p className="text-slate-500">{">"} Awaiting admin commands...</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </CinematicWrapper>
  );
};

export default CommandCenter;
