import { motion } from "framer-motion";
import {
  Palette,
  Sun,
  Cloud,
  Music,
  Film,
  ArrowRight,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Palette,
    title: "Theme Colors",
    description: "Customize your experience with vibrant theme colors.",
    howTo: "Open Chat → Sidebar → Color Theme Selector",
  },
  {
    icon: Sun,
    title: "Light / Dark Mode",
    description: "Switch between light and dark themes instantly.",
    howTo: "Click the Sun/Moon toggle in the sidebar",
  },
  {
    icon: Cloud,
    title: "Weather & Seasons",
    description: "Set ambient weather effects and seasonal themes.",
    howTo: "Open Chat → Sidebar → Weather & Seasons",
  },
  {
    icon: Music,
    title: "Spotify Music Vibes",
    description: "Play music that persists across all pages.",
    howTo: "Use the mini player in the bottom corner",
  },
  {
    icon: Film,
    title: "Lucy Media",
    description: "Watch free movies and shows in Lucy Media.",
    howTo: "Navigate to /media or click Explore Media",
  },
  {
    icon: Gamepad2,
    title: "Lucy Arcade",
    description:
      "Play premium AI-powered games with leaderboards and achievements.",
    howTo: "Open Chat → Lounges → Arcade Mode",
  },
];

export const WhatsNewSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="mr-2">🔥</span>
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              What’s New in Lucy Lounge
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            New realms, smarter intelligence, and premium interactive
            experiences.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Glow border */}
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 blur transition duration-500" />

                <div className="relative bg-card/80 backdrop-blur-xl rounded-xl p-6 border border-border/50 h-full">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4">
                    {feature.description}
                  </p>

                  <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      How to use:
                    </span>{" "}
                    {feature.howTo}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button size="lg" onClick={() => navigate("/media")} className="gap-2">
            <Film className="w-5 h-5" />
            Explore Media
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/arcade")}
            className="gap-2"
          >
            <Gamepad2 className="w-5 h-5" />
            Open Lucy Arcade
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
