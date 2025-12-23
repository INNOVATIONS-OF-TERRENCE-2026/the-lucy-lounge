import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Headphones,
  Compass,
  Film,
  Brain,
  MoonStar,
  Eye,
  Users,
  History,
  Command,
  Atom,
  Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type LoungeItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  group: "Listening" | "Media" | "Lounges" | "Admin";
};

const LOUNGES: LoungeItem[] = [
  { group: "Listening", label: "Listening Mode", icon: Headphones, path: "/listening-mode" },
  { group: "Listening", label: "Explore Mode", icon: Compass, path: "/listening/explore" },

  { group: "Media", label: "Media Mode", icon: Film, path: "/media" },

  { group: "Lounges", label: "Neural Mode", icon: Brain, path: "/neural" },
  { group: "Lounges", label: "Dream Mode", icon: MoonStar, path: "/dream" },
  { group: "Lounges", label: "Vision Mode", icon: Eye, path: "/vision" },
  { group: "Lounges", label: "Silent Room", icon: Users, path: "/silent-room" },
  { group: "Lounges", label: "Memory Timeline", icon: History, path: "/timeline" },
  { group: "Lounges", label: "Quantum Mode", icon: Atom, path: "/quantum" },
  { group: "Lounges", label: "World Events", icon: Globe, path: "/events" },

  { group: "Admin", label: "Command Center", icon: Command, path: "/command" },
];

export function LoungeSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();

  const grouped = useMemo(() => {
    const map: Record<string, LoungeItem[]> = {};
    for (const item of LOUNGES) {
      map[item.group] = map[item.group] || [];
      map[item.group].push(item);
    }
    return map;
  }, []);

  const activePath = location.pathname;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("glass-card border-primary/30 h-8 w-8", "hover:shadow-glow-violet")}
          aria-label="Open Lounges"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Lounges</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(["Listening", "Media", "Lounges", "Admin"] as const).map((group, gi) => {
          const items = grouped[group] || [];
          if (!items.length) return null;

          return (
            <div key={group}>
              {gi > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="text-xs text-muted-foreground">{group}</DropdownMenuLabel>

              {items.map((item) => {
                const isActive = activePath === item.path;
                const Icon = item.icon;

                return (
                  <DropdownMenuItem
                    key={item.path}
                    onSelect={() => navigate(item.path)}
                    className={cn(
                      "cursor-pointer",
                      isActive && "bg-muted/70"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2 opacity-90" />
                    <span className="truncate">{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
