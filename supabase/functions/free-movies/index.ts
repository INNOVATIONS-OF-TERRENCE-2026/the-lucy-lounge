import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const PLAYLISTS = [
  "PLO5YKt2FN8cqpJPAizSdLfp9rqo1SD-7F", // YouTube Movies Free
  "PLwwhtOnMyjuwxdfXib9vXwe5ZQQyQCsNi", // MGM Free Movies
  "PLw5hg4g6JdQffEFr9uQ09ow8hs3DTc9-_", // Public Domain
  "PL5TsM3EcuG2YGT1AjMcAsv76znZZiocCi"  // Public Domain 2
];

async function loadPlaylist(id: string) {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${id}`
  );
  const xml = await res.text();

  const entries = xml.split("<entry>").slice(1);
  return entries.map(e => {
    const vid = e.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
    const title = e.match(/<title>(.*?)<\/title>/)?.[1];
    if (!vid || !title) return null;
    return {
      id: vid,
      title: title.replace(/&amp;/g, "&"),
      provider: "youtube",
      category: "youtube_free"
    };
  }).filter(Boolean);
}

serve(async () => {
  const all = [];
  for (const pid of PLAYLISTS) {
    const items = await loadPlaylist(pid);
    all.push(...items);
  }

  const unique = Array.from(
    new Map(all.map(x => [x.id, x])).values()
  );

  return new Response(JSON.stringify(unique), {
    headers: { "Content-Type": "application/json" }
  });
});
