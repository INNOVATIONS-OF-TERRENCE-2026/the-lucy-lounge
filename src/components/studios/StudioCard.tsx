import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface StudioCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  gradient: string;
}

export const StudioCard = ({ title, description, icon: Icon, route, gradient }: StudioCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card-enhanced p-8 hover:scale-105 transition-all duration-300 group">
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">
        {title}
      </h3>
      <p className="text-white/80 mb-6 min-h-[60px]">
        {description}
      </p>
      <Button
        className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white`}
        onClick={() => navigate(route)}
      >
        Open {title}
      </Button>
    </div>
  );
};
