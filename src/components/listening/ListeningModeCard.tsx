import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { SpotifyEmbed } from "./SpotifyEmbed";

interface ListeningModeCardProps {
  title: string;
  subtitle: string;
  contentId: string;
  contentType?: 'playlist' | 'album';
  icon?: LucideIcon;
  accentColor?: string;
  index?: number;
}

export const ListeningModeCard = ({ 
  title, 
  subtitle, 
  contentId,
  contentType = 'playlist',
  icon: Icon,
  accentColor = "from-primary/20 to-primary/5",
  index = 0
}: ListeningModeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`rounded-xl bg-gradient-to-br ${accentColor} backdrop-blur-sm border border-border/50 p-6 shadow-lg hover:shadow-xl transition-shadow`}
    >
      <div className="mb-4 flex items-center gap-3">
        {Icon && <Icon className="w-6 h-6 text-primary" />}
        <div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>
      <SpotifyEmbed contentId={contentId} type={contentType} title={title} />
    </motion.div>
  );
};
