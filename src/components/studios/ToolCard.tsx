import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  route: string;
  category: string;
  badge?: string;
}

export const ToolCard = ({ title, description, route, category, badge }: ToolCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card-enhanced p-6 hover:scale-105 transition-all duration-300 group relative">
      {badge && (
        <div className="absolute top-4 right-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            badge === "Admin Only" 
              ? "bg-red-500/20 text-red-300" 
              : badge === "Beta"
              ? "bg-yellow-500/20 text-yellow-300"
              : "bg-blue-500/20 text-blue-300"
          }`}>
            {badge}
          </span>
        </div>
      )}
      
      <div className="mb-3">
        <span className="text-xs font-semibold text-primary/80 uppercase tracking-wide">
          {category}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-white/70 text-sm mb-4 min-h-[40px]">
        {description}
      </p>
      
      <Button
        variant="outline"
        size="sm"
        className="w-full border-white/30 text-white hover:bg-white/10"
        onClick={() => navigate(route)}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Open Tool
      </Button>
    </div>
  );
};
