import {
  Headphones,
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
  Gamepad2,
} from "lucide-react";

export const LOUNGES = [
  { label: "Listening Mode", icon: Headphones, path: "/listening-mode" },
  { label: "Media Mode", icon: Film, path: "/media" },
  { label: "Neural Mode", icon: Brain, path: "/neural" },
  { label: "Dream Mode", icon: MoonStar, path: "/dream" },
  { label: "Vision Mode", icon: Eye, path: "/vision" },
  { label: "Silent Room", icon: Users, path: "/silent-room" },
  { label: "Memory Timeline", icon: History, path: "/timeline" },
  { label: "Quantum Mode", icon: Atom, path: "/quantum" },
  { label: "Presence Mode", icon: Sparkles, path: "/presence" },
  { label: "World Events", icon: Globe, path: "/events" },
  { label: "Command Center", icon: Command, path: "/command" },
  { label: "Lucy Arcade", icon: Gamepad2, path: "/arcade" },
] as const;
