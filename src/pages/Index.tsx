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
      if (data.session) navigate("/chat");
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <ThemeToggle className="absolute top-4 right-4" />

      <img src={lucyLogo} alt="Lucy AI" className="w-32 h-32 mb-6 rounded-full" />

      <h1 className="text-6xl font-bold mb-4">Lucy AI</h1>
      <p className="text-xl mb-8">Beyond Intelligence</p>

      <div className="flex gap-4 mb-10">
        <Button size="lg" onClick={() => navigate("/auth")}>
          <MessageSquare className="mr-2 h-5 w-5" />
          Start Chatting
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-3xl font-bold">9,700+</div>
          <div className="text-sm">Active Users</div>
        </div>
        <div>
          <div className="text-3xl font-bold">39,500+</div>
          <div className="text-sm">Conversions</div>
        </div>
        <div>
          <div className="text-3xl font-bold">4.9⭐️</div>
          <div className="text-sm">User Rating</div>
        </div>
      </div>
    </div>
  );
}
