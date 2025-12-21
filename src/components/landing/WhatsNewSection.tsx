import { motion } from 'framer-motion';
import { Palette, Sun, Cloud, Music, Film, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: Palette,
    title: 'Theme Colors',
    description: 'Customize your experience with vibrant theme colors.',
    howTo: 'Open Chat → Sidebar → Color Theme Selector',
  },
  {
    icon: Sun,
    title: 'Light / Dark Mode',
    description: 'Switch between light and dark themes instantly.',
    howTo: 'Click the Sun/Moon toggle in the sidebar',
  },
  {
    icon: Cloud,
    title: 'Weather & Seasons',
    description: 'Set ambient weather effects and seasonal themes.',
    howTo: 'Open Chat → Sidebar → Weather & Seasons',
  },
  {
    icon: Music,
    title: 'Spotify Music Vibes',
    description: 'Play music that persists across all pages.',
    howTo: 'Use the mini player in the bottom corner',
  },
  {
    icon: Film,
    title: 'New Media Section',
    description: 'Watch free movies and shows in Lucy Media.',
    howTo: 'Navigate to /media or click Explore Media',
  },
];

export const WhatsNewSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Animated glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="mr-2">🔥</span>
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              What's New in Lucy Lounge
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover the latest features designed to enhance your AI experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Glow border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
                
                <div className="relative bg-card/80 backdrop-blur-xl rounded-xl p-6 border border-border/50 h-full">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">How to use:</span>{' '}
                    {feature.howTo}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/media')}
            className="group gap-2"
          >
            <Film className="w-5 h-5" />
            Explore Media
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/chat')}
            className="gap-2"
          >
            <Music className="w-5 h-5" />
            Open Chat
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
