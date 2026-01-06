import { SEOHead } from "./SEOHead";
import { CANONICAL_DOMAIN } from "@/lib/seoConfig";

interface StudiosSEOProps {
  studio?: "ai" | "audio" | "dev";
}

export const StudiosSEO = ({ studio }: StudiosSEOProps) => {
  const seoData = {
    ai: {
      title: "AI Studio | Lucy Core Intelligence",
      description: "Chat, reason, and automate with Lucy's core AI Studio.",
      url: `${CANONICAL_DOMAIN}/studios/ai`
    },
    audio: {
      title: "Audio Studio | Express Audio Power inside Lucy",
      description: "Create, shape, and manage audio with Express Audio Power, fully integrated into Lucy.",
      url: `${CANONICAL_DOMAIN}/studios/audio`
    },
    dev: {
      title: "Dev Studio | Express Development inside Lucy",
      description: "Generate and manage websites, apps, and automation workflows from one Dev Studio.",
      url: `${CANONICAL_DOMAIN}/studios/dev`
    },
    default: {
      title: "Lucy Studios | Multi-Workspace Platform",
      description: "Access AI, Audio, and Dev Studios in one unified Lucy OS workspace.",
      url: `${CANONICAL_DOMAIN}/studios`
    }
  };

  const data = studio ? seoData[studio] : seoData.default;

  return (
    <SEOHead
      title={data.title}
      description={data.description}
      url={data.url}
      canonical={data.url}
    />
  );
};
