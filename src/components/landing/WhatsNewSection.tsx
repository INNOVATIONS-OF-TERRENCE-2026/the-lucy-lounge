import { motion } from "framer-motion";
import {
  Wrench,
  Brain,
  Code,
  Music,
  Film,
  ArrowRight,
  Gamepad2,
  Sparkles,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Sparkles,
    title: "Lucy Studios Hub",
    description: "Your command center for all AI tools, lounges, and creative spaces.",
    howTo: "Login → Auto-redirects to /studios",
    badge: "NEW",
    route: "/studios",
  },
  {
    icon: Wrench,
    title: "AI Tools Suite",
    description: "Website summarizer, image captioning, math calculator, code executor, and more.",
    howTo: "Studios → AI Tools",
    badge: "5 TOOLS",
    route: "/tools",
  },
  {
    icon: Brain,
    title: "Lucy Lounges",
    description: "Neural Mode, Dream Mode, Silent Room, Memory Timeline - immersive AI spaces.",
    howTo: "Studios → Lounges",
    badge: "9 LOUNGES",
    route: "/lounges",
  },
  {
    icon: Gamepad2,
    title: "Lucy Arcade",
    description: "12 playable games with AI opponents, tutorials, and leaderboards.",
    howTo: "Studios → Arcade",
    badge: "12 GAMES",
    route: "/arcade",
  },
  {
    icon: Code,
    title: "Dev Studio",
    description: "Build websites and apps with AI assistance, templates, and live preview.",
    howTo: "Studios → Dev Studio",
    badge: "NEW",
    route: "/studios/dev",
  },
  {
    icon: Headphones,
    title: "Listening Mode",
    description: "Personalized music recommendations with For You, Trending, and mood-based discovery.",
    howTo: "Studios → Listening Mode",
    badge: "ENHANCED",
    route: "/listening",
  },
  {
    icon: Film,
    title: "Media Mode",
    description: "Free movies, TV shows, and video content with personalized recommendations.",
    howTo: "Studios → Media Mode",
    badge: "FREE",
    route: "/media",
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
                className="group relative cursor-pointer"
                onClick={() => feature.route && navigate(feature.route)}
              >
                {/* Glow border */}
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 blur transition duration-500" />

                <div className="relative bg-card/80 backdrop-blur-xl rounded-xl p-6 border border-border/50 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {feature.badge && (
                      <span className="px-2 py-1 text-xs font-bold bg-primary/20 text-primary rounded-full">
                        {feature.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4">
                    {feature.description}
                  </p>

                  <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      How to access:
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
          <Button size="lg" onClick={() => navigate("/studios")} className="gap-2">
            <Sparkles className="w-5 h-5" />
            Enter Lucy Studios
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
