import { LucyAvatar } from '@/components/avatar/LucyAvatar';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-12 px-4 border-t border-border/20 bg-gradient-to-b from-transparent to-black/30">
      {/* Subtle gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <LucyAvatar size="sm" />
              <span className="text-2xl font-bold text-foreground">Lucy AI</span>
            </div>
            <p className="text-foreground/80 mb-4 max-w-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              Beyond Intelligence. An advanced AI assistant system designed and architected by Software Engineer Terrence Milliner Sr., powered by state-of-the-art AI models.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/lucyai" className="text-foreground/70 hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com/lucyai" className="text-foreground/70 hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/lucyai" className="text-foreground/70 hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:hello@lucy-ai.app" className="text-foreground/70 hover:text-foreground transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/studios" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Studios</Link></li>
              <li><Link to="/features" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Features</Link></li>
              <li><Link to="/pricing" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Pricing</Link></li>
              <li><Link to="/tools" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Tools</Link></li>
              <li><Link to="/creator-studio" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Creator Studio</Link></li>
              <li><Link to="/chat" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Try Free</Link></li>
              <li><Link to="/analytics" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Analytics</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">About</Link></li>
              <li><Link to="/launch" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Launch</Link></li>
              <li><Link to="/blog" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Blog</Link></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Careers</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <p className="text-foreground/75 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              © {currentYear} Lucy AI. Designed and architected by Software Engineer Terrence Milliner Sr. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-foreground/75 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Privacy Policy</a>
              <a href="#" className="text-foreground/75 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Terms of Service</a>
              <a href="#" className="text-foreground/75 hover:text-foreground transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Cookie Policy</a>
            </div>
          </div>
          
          {/* Short About Section */}
          <div className="pt-6 border-t border-border/20">
            <div className="max-w-3xl mx-auto text-center">
              <h4 className="text-foreground font-semibold mb-3">About Lucy AI</h4>
              <p className="text-foreground/80 text-sm leading-relaxed mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                Lucy AI is a next-generation digital companion engineered by Software Engineer 
                Terrence Milliner Sr. — designed to feel personal, helpful, and alive.
              </p>
              <Link 
                to="/about" 
                className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
              >
                Learn more about Lucy →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
