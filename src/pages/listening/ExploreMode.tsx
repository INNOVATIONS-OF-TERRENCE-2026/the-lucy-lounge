// =========================================================
// 🎧 EXPLORE MODE — FULL PAGE (NON-DESTRUCTIVE)
// File: src/pages/listening/ExploreMode.tsx
// =========================================================

import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Flame,
  Music2,
  Headphones,
  MapPin,
  Sparkles,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import {
  explorePlaylists,
  ExplorePlaylist,
} from "@/data/explorePlaylists";

// =========================================================
// 🧭 SECTION CONFIG
// =========================================================

type SectionKey =
  | "hipHopEditorial"
  | "trapPlaylists"
  | "dallasDrill"
  | "newDallas"
  | "rnb90s"
  | "rnb80s"
  | "rnb70s"
  | "lofiChill";

const SECTION_META: Record<
  SectionKey,
  { title: string; subtitle: string; icon: React.ElementType }
> = {
  hipHopEditorial: {
    title: "Hip-Hop Editorial",
    subtitle: "Full-song playlists, curated",
    icon: Flame,
  },
  trapPlaylists: {
    title: "Trap",
    subtitle: "Hard-hitting trap energy",
    icon: Music2,
  },
  dallasDrill: {
    title: "Dallas Drill",
    subtitle: "DFW underground & drill",
    icon: MapPin,
  },
  newDallas: {
    title: "New Dallas",
    subtitle: "Next wave of Dallas artists",
    icon: Sparkles,
  },
  rnb90s: {
    title: "90s R&B Slow Jams",
    subtitle: "Classic love & soul",
    icon: Headphones,
  },
  rnb80s: {
    title: "80s R&B",
    subtitle: "Golden era grooves",
    icon: Clock,
  },
  rnb70s: {
    title: "70s Soul",
    subtitle: "Timeless soul & R&B",
    icon: Clock,
  },
  lofiChill: {
    title: "Lo-Fi / Chill / Focus",
    subtitle: "Study, relax, lock in",
    icon: Headphones,
  },
};

// =========================================================
// 🧠 COMPONENT
// =========================================================

const ExploreMode = () => {
  const navigate = useNavigate();

  // Section refs for tile → scroll
  const sectionRefs: Record<SectionKey, React.RefObject<HTMLDivElement>> = {
    hipHopEditorial: useRef(null),
    trapPlaylists: useRef(null),
    dallasDrill: useRef(null),
    newDallas: useRef(null),
    rnb90s: useRef(null),
    rnb80s: useRef(null),
    rnb70s: useRef(null),
    lofiChill: useRef(null),
  };

  const scrollToSection = (key: SectionKey) => {
    sectionRefs[key]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const renderRail = (items: ExplorePlaylist[]) => (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {items.map((pl, index) => (
        <motion.div
          key={pl.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="min-w-[320px] max-w-[320px] rounded-xl overflow-hidden bg-black shadow-lg"
        >
          <iframe
            title={pl.title}
            src={pl.spotifyEmbedUrl}
            width="100%"
            height="380"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
          <div className="p-3 bg-background">
            <h4 className="font-semibold text-sm">{pl.title}</h4>
            <p className="text-xs text-muted-foreground">{pl.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/listening-mode")}>
            <ArrowLeft />
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold">Explore</h1>
            <p className="text-xs text-muted-foreground">
              Discover playlists & editorial picks
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <Home className="mr-2 w-4 h-4" />
            Home
          </Button>
        </div>
      </header>

      {/* ===================================================== */}
      {/* GENRE TILES */}
      {/* ===================================================== */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(Object.keys(SECTION_META) as SectionKey[]).map((key) => {
            const Icon = SECTION_META[key].icon;
            return (
              <button
                key={key}
                onClick={() => scrollToSection(key)}
                className="flex flex-col items-center justify-center rounded-xl border bg-muted/40 hover:bg-muted/70 transition p-4"
              >
                <Icon className="w-6 h-6 mb-2 text-primary" />
                <span className="text-sm font-semibold text-center">
                  {SECTION_META[key].title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===================================================== */}
      {/* EDITORIAL SECTIONS */}
      {/* ===================================================== */}
      <main className="space-y-12 pb-16">
        {(Object.keys(SECTION_META) as SectionKey[]).map((key) => {
          const meta = SECTION_META[key];
          const items = explorePlaylists[key];

          if (!items || items.length === 0) return null;

          return (
            <section
              key={key}
              ref={sectionRefs[key]}
              className="container mx-auto px-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <meta.icon className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">{meta.title}</h2>
                  <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
                </div>
              </div>

              {renderRail(items)}
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default ExploreMode;
