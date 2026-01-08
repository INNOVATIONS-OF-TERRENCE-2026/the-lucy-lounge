import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Orbit,
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
  Gamepad2,
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

type LoungeGroup = "Listening" | "Media" | "Lounges" | "Admin";

type LoungeItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  group: LoungeGroup;
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

  // 🎮 ARCADE
  { group: "Lounges", label: "Arcade Mode", icon: Gamepad2, path: "/arcade" },

  { group: "Admin", label: "Command Center", icon: Command, path: "/command" },
];

const GROUP_ORDER: LoungeGroup[] = ["Listening", "Media", "Lounges", "Admin"];

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function LoungeSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();

  const activePath = normalizePath(location.pathname);

  const grouped = useMemo(() => {
    const map: Record<LoungeGroup, LoungeItem[]> = {
      Listening: [],
      Media: [],
      Lounges: [],
      Admin: [],
    };
    for (const item of LOUNGES) map[item.group].push(item);
    return map;
  }, []);

  const activeItem = useMemo(() => {
    const exact = LOUNGES.find((x) => normalizePath(x.path) === activePath);
    if (exact) return exact;
    return LOUNGES.find((x) =>
      activePath.startsWith(normalizePath(x.path) + "/"),
    );
  }, [activePath]);

  const handleGo = (path: string) => {
    if (normalizePath(path) === activePath) return;
    navigate(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-8 w-8 overflow-hidden",
            "glass-card border-primary/30",
            "hover:shadow-glow-violet transition-all",
          )}
          aria-label="Open Lounges"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.35),transparent_55%)] opacity-80"
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full blur-md bg-[conic-gradient(from_180deg,hsl(var(--primary)/0.35),hsl(var(--primary)/0.08),transparent)] animate-[spin_6s_linear_infinite] opacity-70"
          />
          <span className="relative">
            <Orbit className="w-4 h-4" />
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="
          w-64 p-0
          max-h-[70vh]
          overflow-y-auto
          overscroll-contain
          scrollbar-thin
          scrollbar-thumb-border
          scrollbar-track-transparent
        "
      >
        <div className="px-3 py-2 border-b bg-background/80 backdrop-blur">
          <DropdownMenuLabel className="p-0 text-sm font-semibold flex gap-2">
            <Orbit className="w-4 h-4 text-primary" />
            Lounges
          </DropdownMenuLabel>
          <div className="text-[11px] text-muted-foreground mt-1">
            {activeItem
              ? `Currently in ${activeItem.label}`
              : "Select a mode"}
          </div>
        </div>

        <div className="p-2">
          {GROUP_ORDER.map((group, gi) => {
            const items = grouped[group];
            if (!items.length) return null;

            return (
              <div key={group} className={cn(gi > 0 && "mt-2")}>
                {gi > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {group}
                </DropdownMenuLabel>

                {items.map((item) => {
                  const isActive =
                    normalizePath(item.path) === activePath ||
                    activePath.startsWith(normalizePath(item.path) + "/");
                  const Icon = item.icon;

                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onSelect={() => handleGo(item.path)}
                      className={cn(
                        "cursor-pointer rounded-lg mx-1",
                        isActive && "bg-muted/70",
                      )}
                    >
                      <span
                        className={cn(
                          "mr-2 h-7 w-7 rounded-md flex items-center justify-center",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-muted/40 text-muted-foreground",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className={cn(isActive && "font-medium")}>
                        {item.label}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
