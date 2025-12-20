import type { NextApiRequest, NextApiResponse } from "next";

const PLAYLISTS = [
  "PLO5YKt2FN8cqpJPAizSdLfp9rqo1SD-7F", // YouTube Movies Free
  "PLwwhtOnMyjuwxdfXib9vXwe5ZQQyQCsNi", // MGM Free Movies
  "PLw5hg4g6JdQffEFr9uQ09ow8hs3DTc9-_", // Public Domain
  "PL5TsM3EcuG2YGT1AjMcAsv76znZZiocCi", // Public Domain 2
];

async function loadPlaylist(id: string) {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${id}`
  );
  const xml = await res.text();

  return xml
    .split("<entry>")
    .slice(1)
    .map((entry) => {
      const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>(.*?)<\/title>/)?.[1];

      if (!videoId || !title) return null;

      return {
        id: videoId,
        title: title.replace(/&amp;/g, "&"),
        provider: "youtube",
        category: "youtube_free",
      };
    })
    .filter(Boolean);
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const all: any[] = [];

    for (const pid of PLAYLISTS) {
      const items = await loadPlaylist(pid);
      all.push(...items);
    }

    const unique = Array.from(
      new Map(all.map((x) => [x.id, x])).values()
    );

    res.status(200).json(unique);
  } catch (err) {
    console.error("[FREE_MOVIES_API_ERROR]", err);
    res.status(500).json({ error: "Failed to load free movies" });
  }
}
