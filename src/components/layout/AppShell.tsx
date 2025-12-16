import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Headphones, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LucyLogo } from "@/components/branding/LucyLogo";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

/**
 * Global App Shell - Provides consistent header with Home button across all protected pages
 * Does NOT affect Spotify playback - GlobalSpotifyAudioHost is mounted at App root level
 */
export function AppShell({ children, showHeader = true }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen w-full flex flex-col">
      {showHeader && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4">
            {/* Left: Logo + Home */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <LucyLogo size="sm" showGlow={false} />
                <span className="font-semibold text-foreground hidden sm:inline">Lucy</span>
              </Link>
              
              <nav className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className={cn(
                    "gap-2 text-muted-foreground hover:text-foreground",
                    isActive("/") && "text-foreground bg-muted"
                  )}
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/chat")}
                  className={cn(
                    "gap-2 text-muted-foreground hover:text-foreground",
                    isActive("/chat") && "text-foreground bg-muted"
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/listening-mode")}
                  className={cn(
                    "gap-2 text-muted-foreground hover:text-foreground",
                    isActive("/listening-mode") && "text-foreground bg-muted"
                  )}
                >
                  <Headphones className="w-4 h-4" />
                  <span className="hidden sm:inline">Listen</span>
                </Button>
              </nav>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
