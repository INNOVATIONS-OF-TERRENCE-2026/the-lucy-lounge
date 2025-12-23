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

  { group: "Admin", label: "Command Center", icon: Command, path: "/command" },
];

const GROUP_ORDER: LoungeGroup[] = ["Listening", "Media", "Lounges", "Admin"];

function normalizePath(pathname: string) {
  // keep exact matching, but treat nested routes as active for parent (optional)
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

    for (const item of LOUNGES) {
      map[item.group].push(item);
    }

    return map;
  }, []);

  const activeItem = useMemo(() => {
    // exact match first
    const exact = LOUNGES.find((x) => normalizePath(x.path) === activePath);
    if (exact) return exact;

    // fallback: if route is nested under a lounge path, treat it as active
    const nested = LOUNGES.find((x) => activePath.startsWith(normalizePath(x.path) + "/"));
    return nested || null;
  }, [activePath]);

  const handleGo = (path: string) => {
    // Safe: prevent navigating to the same route (avoids unnecessary rerenders)
    const next = normalizePath(path);
    if (next === activePath) return;
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
            "hover:shadow-glow-violet",
            "transition-all",
          )}
          aria-label="Open Lounges"
          title="Lounges"
        >
          {/* Cosmic portal glow */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.35),transparent_55%)]",
              "opacity-80",
            )}
          />
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full blur-md",
              "bg-[conic-gradient(from_180deg,hsl(var(--primary)/0.35),hsl(var(--primary)/0.08),transparent)]",
              "animate-[spin_6s_linear_infinite]",
              "opacity-70",
            )}
          />

          {/* Icon */}
          <span className="relative flex items-center justify-center">
            <Orbit className="w-4 h-4" />
          </span>

          {/* Active dot indicator */}
          <span
            aria-hidden
            className={cn(
              "absolute right-1 top-1 h-2 w-2 rounded-full",
              activeItem ? "bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" : "bg-transparent",
            )}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-border/60 bg-background/80 backdrop-blur">
          <DropdownMenuLabel className="p-0 text-sm font-semibold flex items-center gap-2">
            <Orbit className="w-4 h-4 text-primary" />
            Lounges
          </DropdownMenuLabel>

          <div className="mt-1 text-[11px] text-muted-foreground">
            {activeItem ? (
              <>
                Currently in <span className="text-foreground/90 font-medium">{activeItem.label}</span>
              </>
            ) : (
              <>Select a mode</>
            )}
          </div>
        </div>

        <div className="p-2">
          {GROUP_ORDER.map((group, gi) => {
            const items = grouped[group] || [];
            if (!items.length) return null;

            return (
              <div key={group} className={cn(gi > 0 && "mt-2")}>
                {gi > 0 && <DropdownMenuSeparator className="my-2" />}

                <DropdownMenuLabel className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {group}
                </DropdownMenuLabel>

                <div className="space-y-1">
                  {items.map((item) => {
                    const isActive =
                      normalizePath(item.path) === activePath || activePath.startsWith(normalizePath(item.path) + "/");

                    const Icon = item.icon;

                    return (
                      <DropdownMenuItem
                        key={item.path}
                        onSelect={() => handleGo(item.path)}
                        className={cn("cursor-pointer rounded-lg mx-1", "focus:bg-muted/70", isActive && "bg-muted/70")}
                      >
                        <span
                          className={cn(
                            "mr-2 inline-flex h-7 w-7 items-center justify-center rounded-md",
                            isActive ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground",
                          )}
                        >
                          <Icon className="w-4 h-4 opacity-90" />
                        </span>

                        <span className={cn("truncate text-sm", isActive && "font-medium")}>{item.label}</span>

                        {isActive && (
                          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                            Active
                          </span>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-2 border-t border-border/60 text-[11px] text-muted-foreground bg-background/80 backdrop-blur">
          Tip: Use Lounges to jump into powerful modes instantly.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
