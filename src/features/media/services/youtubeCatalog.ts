import { loadPlaylistRss, YoutubeRssItem } from "./youtubeRss";

export type FreeMediaCategory = "youtube_free" | "public_domain" | "trailers" | "vimeo";

export type FreeMediaItem = {
  id: string;
  title: string;
  provider: "youtube" | "vimeo";
  channel?: string;
  sourceLabel?: string;
  category: FreeMediaCategory;
  published?: string;
};

const PLAYLISTS = [
  {
    id: "PLO5YKt2FN8cqpJPAizSdLfp9rqo1SD-7F",
    label: "YouTube Movies (Free With Ads)",
    category: "youtube_free" as const,
    max: 60,
  },
  {
    id: "PLwwhtOnMyjuwxdfXib9vXwe5ZQQyQCsNi",
    label: "MGM — Full Movies Free With Ads",
    category: "youtube_free" as const,
    max: 60,
  },
  {
    id: "PLw5hg4g6JdQffEFr9uQ09ow8hs3DTc9-_",
    label: "Public Domain Full Movies",
    category: "public_domain" as const,
    max: 80,
  },
  {
    id: "PL5TsM3EcuG2YGT1AjMcAsv76znZZiocCi",
    label: "Public Domain Movies",
    category: "public_domain" as const,
    max: 80,
  },
];

function uniqById(items: FreeMediaItem[]): FreeMediaItem[] {
  const seen = new Set<string>();
  const out: FreeMediaItem[] = [];
  for (const it of items) {
    const k = `${it.provider}:${it.id}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

export const youtubeCatalog = {
  async loadTopFree(target = 120): Promise<FreeMediaItem[]> {
    const all: FreeMediaItem[] = [];

    const results = await Promise.allSettled(
      PLAYLISTS.map(async (p) => {
        try {
          const rssItems: YoutubeRssItem[] = await loadPlaylistRss(p.id, p.label, p.max);
          return rssItems.map((x) => ({
            id: x.id,
            title: x.title,
            provider: "youtube" as const,
            channel: x.channel,
            sourceLabel: x.sourceLabel,
            category: p.category,
            published: x.published,
          }));
        } catch (err) {
          console.warn("[YOUTUBE_RSS_FAIL]", p.label, err);
          return [];
        }
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") all.push(...r.value);
    }

    const unique = uniqById(all);
    return unique.slice(0, Math.max(100, target));
  },

  getFallbackCurated(): FreeMediaItem[] {
    // Fallback curated list if RSS fails completely
    return [
      { id: "dQw4w9WgXcQ", title: "Sample Free Movie", provider: "youtube", category: "youtube_free", channel: "YouTube" },
      { id: "jNQXAC9IVRw", title: "Classic Public Domain", provider: "youtube", category: "public_domain", channel: "Archive" },
    ];
  },
};
