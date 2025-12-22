import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOUNGES } from "@/config/lounges";

export function LoungesDropdown() {
  const navigate = useNavigate();
  const location = useLocation();

  const active =
    LOUNGES.find((l) => location.pathname.startsWith(l.path)) ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="glass-card border-primary/30 flex items-center gap-2"
        >
          {active && <active.icon className="w-4 h-4" />}
          <span className="hidden sm:inline">
            {active ? active.label : "Lounges"}
          </span>
          <ChevronDown className="w-4 h-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-56 backdrop-blur-xl bg-background/80 border-primary/20"
      >
        {LOUNGES.map((l) => (
          <DropdownMenuItem
            key={l.path}
            onClick={() => navigate(l.path)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <l.icon className="w-4 h-4" />
            <span>{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
