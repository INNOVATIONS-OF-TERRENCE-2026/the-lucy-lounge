import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import lucyLogo from "@/assets/lucy-logo.png";
import { ThemeToggle } from "@/components/settings/ThemeToggle";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/chat");
      }
    });
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Theme Toggle (wrapped safely — no props passed) */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg mx-auto">
          <img src={lucyLogo} alt="Lucy AI" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-6xl md:text-7xl font-bold mb-4">Lucy AI</h1>
      <p className="text-xl md:text-2xl mb-8 text-muted-foreground">Beyond Intelligence</p>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Button size="lg" className="gap-2" onClick={() => navigate("/auth")}>
          <MessageSquare className="w-5 h-5" />
          Start Chatting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl w-full">
        <div className="rounded-xl border p-6 bg-background/60 backdrop-blur">
          <div className="text-3xl font-bold">9,700+</div>
          <div className="text-sm text-muted-foreground">Active Users</div>
        </div>
        <div className="rounded-xl border p-6 bg-background/60 backdrop-blur">
          <div className="text-3xl font-bold">39,500+</div>
          <div className="text-sm text-muted-foreground">Conversions</div>
        </div>
        <div className="rounded-xl border p-6 bg-background/60 backdrop-blur">
          <div className="text-3xl font-bold">4.9⭐️</div>
          <div className="text-sm text-muted-foreground">User Rating</div>
        </div>
      </div>
    </div>
  );
}
