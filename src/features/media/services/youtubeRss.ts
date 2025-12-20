export type YoutubeRssItem = {
  provider: "youtube";
  id: string;
  title: string;
  channel: string;
  published?: string;
  sourceLabel: string;
};

async function fetchText(url: string, timeoutMs = 12000): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`RSS fetch failed ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function getTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function loadPlaylistRss(
  playlistId: string,
  label: string,
  maxItems = 50
): Promise<YoutubeRssItem[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`;
  const xml = await fetchText(url);

  const entries = xml.split("<entry>").slice(1).map((e) => e.split("</entry>")[0]);
  const items: YoutubeRssItem[] = [];

  for (const entry of entries) {
    if (items.length >= maxItems) break;

    const title = decodeHtml(getTag(entry, "title"));
    const videoId = getTag(entry, "yt:videoId");
    const authorBlock = entry.match(/<author>[\s\S]*?<\/author>/i)?.[0] || "";
    const channel = decodeHtml(getTag(authorBlock, "name"));
    const published = getTag(entry, "published");

    if (!videoId || !title) continue;

    items.push({
      provider: "youtube",
      id: videoId,
      title,
      channel: channel || "YouTube",
      published,
      sourceLabel: label,
    });
  }

  return items;
}
