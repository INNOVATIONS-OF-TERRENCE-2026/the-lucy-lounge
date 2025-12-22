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
} from "lucide-react";

export interface LoungeItem {
  label: string;
  path: string;
  icon: any;
}

export const LOUNGES: LoungeItem[] = [
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
];
