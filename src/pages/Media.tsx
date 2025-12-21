import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

const PLAYLISTS = [{ title: "Free Movies & Shows", id: "PLX9_I-EOJPdHZJDzvjjRjpj86ClhZSsVm" }];

const MOVIES = ["1JOf7Gbn4Is", "jgHnkc2Hn-k", "q3m9nwWItVg", "EWLL8zHlaAM", "f9-DU9lwWqk", "q9i29JAjcIg"];

export default function Media() {
  const navigate = useNavigate();
  const [desktopLike, setDesktopLike] = useState(false);

  useEffect(() => {
    const check = () => setDesktopLike(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    document.body.classList.add("media-desktop-like");
    return () => {
      window.removeEventListener("resize", check);
      document.body.classList.remove("media-desktop-like");
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background border-b z-50">
        <div className="container flex items-center gap-4 p-4">
          <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-bold">Lucy Media</h1>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {PLAYLISTS.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/videoseries?list=${p.id}`}
                className="w-full h-full"
                allowFullScreen
              />
            </CardContent>
          </Card>
        ))}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOVIES.map((id) => (
            <Card key={id}>
              <CardContent className="aspect-video p-0">
                {desktopLike ? (
                  <iframe src={`https://www.youtube.com/embed/${id}`} className="w-full h-full" allowFullScreen />
                ) : (
                  <Button
                    className="w-full h-full"
                    onClick={() => window.open(`https://youtube.com/watch?v=${id}`, "_blank")}
                  >
                    ▶ Watch on YouTube
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Badge>YouTube • Free with ads</Badge>
        </div>
      </main>
    </div>
  );
}
