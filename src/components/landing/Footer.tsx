import { LucyAvatar } from '@/components/avatar/LucyAvatar';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-12 px-4 border-t border-border/20 bg-gradient-to-b from-black/40 to-black/60">
      {/* Stronger gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <LucyAvatar size="sm" />
              <span className="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Lucy AI</span>
            </div>
            <p className="text-white/90 mb-4 max-w-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Beyond Intelligence. An advanced AI assistant system designed and architected by Software Engineer Terrence Milliner Sr., powered by state-of-the-art AI models.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/lucyai" className="text-white/80 hover:text-white transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com/lucyai" className="text-white/80 hover:text-white transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/lucyai" className="text-white/80 hover:text-white transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:hello@lucy-ai.app" className="text-white/80 hover:text-white transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/studios" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Studios</Link></li>
              <li><Link to="/features" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Features</Link></li>
              <li><Link to="/pricing" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Pricing</Link></li>
              <li><Link to="/tools" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Tools</Link></li>
              <li><Link to="/creator-studio" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Creator Studio</Link></li>
              <li><Link to="/chat" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Try Free</Link></li>
              <li><Link to="/analytics" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Analytics</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">About</Link></li>
              <li><Link to="/about/terrence-milliner" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Our Team</Link></li>
              <li><Link to="/launch" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Launch</Link></li>
              <li><Link to="/blog" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Blog</Link></li>
              <li><Link to="/press" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Press</Link></li>
              <li><Link to="/editorial-standards" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Editorial Standards</Link></li>
              <li><Link to="/contact" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <p className="text-white/90 text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              © {currentYear} Lucy AI. Designed and architected by Software Engineer Terrence Milliner Sr. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Privacy Policy</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Terms of Service</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">Cookie Policy</a>
            </div>
          </div>
          
          {/* Short About Section */}
          <div className="pt-6 border-t border-white/20">
            <div className="max-w-3xl mx-auto text-center">
              <h4 className="text-white font-semibold mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">About Lucy AI</h4>
              <p className="text-white/90 text-sm leading-relaxed mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Lucy AI is a next-generation digital companion engineered by Software Engineer 
                Terrence Milliner Sr. — designed to feel personal, helpful, and alive.
              </p>
              <Link 
                to="/about" 
                className="text-sm text-accent hover:text-accent/80 transition-colors font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
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
