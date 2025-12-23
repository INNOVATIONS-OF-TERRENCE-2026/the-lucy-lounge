import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Headphones,
  Compass,
  Film,
  Brain,
  MoonStar,
  Eye,
  Users,
  History,
  Atom,
  Sparkles,
  Globe,
  Command,
  ChevronDown,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type LoungeItem = {
  label: string;
  path: string;
  icon: any;
  group: "LISTENING" | "LOUNGES" | "CORE";
};

export function LoungeSwitcher({
  className,
  buttonVariant = "outline",
  buttonSize = "sm",
}: {
  className?: string;
  buttonVariant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const items: LoungeItem[] = useMemo(
    () => [
      // CORE
      { label: "Home", icon: Home, path: "/", group: "CORE" },

      // LISTENING
      { label: "Listening Mode", icon: Headphones, path: "/listening-mode", group: "LISTENING" },
      { label: "Explore Mode", icon: Compass, path: "/listening/explore", group: "LISTENING" },
      { label: "Media Mode", icon: Film, path: "/media", group: "LISTENING" },

      // LOUNGES
      { label: "Neural Mode", icon: Brain, path: "/neural", group: "LOUNGES" },
      { label: "Dream Mode", icon: MoonStar, path: "/dream", group: "LOUNGES" },
      { label: "Vision Mode", icon: Eye, path: "/vision", group: "LOUNGES" },
      { label: "Silent Room", icon: Users, path: "/silent-room", group: "LOUNGES" },
      { label: "Memory Timeline", icon: History, path: "/timeline", group: "LOUNGES" },
      { label: "Quantum Mode", icon: Atom, path: "/quantum", group: "LOUNGES" },
      { label: "Presence Mode", icon: Sparkles, path: "/presence", group: "LOUNGES" },
      { label: "World Events", icon: Globe, path: "/events", group: "LOUNGES" },
      { label: "Command Center", icon: Command, path: "/command", group: "LOUNGES" },
    ],
    []
  );

  const activePath = location.pathname;

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setOpen((v) => !v)}
        className={cn("gap-2")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Lounges</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </Button>

      {open && (
        <>
          {/* click-away backdrop */}
          <button
            type="button"
            aria-label="Close lounge menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div
            className={cn(
              "absolute right-0 mt-2 z-50 w-[260px] rounded-xl border bg-background/95 backdrop-blur shadow-xl",
              "p-2"
            )}
            role="menu"
          >
            {(["CORE", "LISTENING", "LOUNGES"] as const).map((group) => {
              const groupItems = items.filter((i) => i.group === group);
              if (groupItems.length === 0) return null;

              return (
                <div key={group} className="mb-2 last:mb-0">
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground">
                    {group === "CORE" ? "CORE" : group === "LISTENING" ? "LISTENING" : "LOUNGES"}
                  </div>

                  <div className="space-y-1">
                    {groupItems.map((i) => {
                      const Icon = i.icon;
                      const active = activePath === i.path;

                      return (
                        <button
                          key={i.path}
                          type="button"
                          role="menuitem"
                          onClick={() => go(i.path)}
                          className={cn(
                            "w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                            "transition-colors",
                            active
                              ? "bg-primary/15 text-primary"
                              : "hover:bg-muted/60 text-foreground"
                          )}
                        >
                          <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                          <span className="flex-1 text-left">{i.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
