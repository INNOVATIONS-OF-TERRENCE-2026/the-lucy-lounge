import { Badge } from "@/components/ui/badge";
import { PERSONAS } from "@/lib/lucyPersonas";

interface PersonaIndicatorProps {
  personaId?: string;
  className?: string;
  showIcon?: boolean;
}

export function PersonaIndicator({ 
  personaId = 'default', 
  className = '',
  showIcon = true
}: PersonaIndicatorProps) {
  const persona = PERSONAS[personaId as keyof typeof PERSONAS] || PERSONAS.default;
  
  if (personaId === 'default') return null;
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs bg-primary/10 border-primary/30 ${className}`}
    >
      {showIcon && persona.emoji} {persona.name}
    </Badge>
  );
}
