import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { LucyAvatar } from "@/components/avatar/LucyAvatar";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const TopNav = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <LucyAvatar size="sm" />
            <span className="text-xl font-bold text-foreground">Lucy AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Studios Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors font-medium">
                Studios
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/studios/ai")}>
                  AI Studio
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/studios/audio")}>
                  Audio Studio
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/studios/dev")}>
                  Dev Studio
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/features" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
              Features
            </Link>
            <Link to="/pricing" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
              Pricing
            </Link>
            <Link to="/tools" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
              Tools
            </Link>
            <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors font-medium">
              About
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              variant="gradient"
              onClick={() => navigate("/auth")}
            >
              Start Free
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/20 pt-4">
            <div className="flex flex-col gap-4">
              {/* Studios Section */}
              <div className="border-b border-border/20 pb-3">
                <div className="text-foreground/60 text-sm font-semibold mb-2">Studios</div>
                <Link
                  to="/studios/ai"
                  className="block py-2 text-foreground/80 hover:text-foreground transition-colors pl-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Studio
                </Link>
                <Link
                  to="/studios/audio"
                  className="block py-2 text-foreground/80 hover:text-foreground transition-colors pl-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Audio Studio
                </Link>
                <Link
                  to="/studios/dev"
                  className="block py-2 text-foreground/80 hover:text-foreground transition-colors pl-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dev Studio
                </Link>
              </div>

              <Link
                to="/features"
                className="text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/tools"
                className="text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tools
              </Link>
              <Link
                to="/about"
                className="text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              {/* Mobile CTA */}
              <div className="flex flex-col gap-2 pt-3 border-t border-border/20">
                <div className="flex items-center justify-between py-2">
                  <span className="text-foreground/80">Theme</span>
                  <ThemeToggle />
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/auth");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => {
                    navigate("/auth");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Start Free
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
