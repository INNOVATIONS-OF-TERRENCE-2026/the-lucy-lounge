export function YouTubePlaylistEmbed({
  playlistId,
  title,
}: {
  playlistId: string;
  title: string;
}) {
  return (
    <div className="w-full space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="aspect-video w-full rounded-xl overflow-hidden border">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}`}
          title={title}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
