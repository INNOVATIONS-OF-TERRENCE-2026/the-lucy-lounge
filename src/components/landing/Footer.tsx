import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { LucyAvatar } from '@/components/avatar/LucyAvatar';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-black/60 border-t border-border/30 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <LucyAvatar size="sm" />
            <span className="text-xl font-bold text-white">Lucy AI</span>
          </div>
          <p className="text-white/80 max-w-md mb-4">
            Beyond Intelligence. A next-generation AI companion engineered by
            Software Engineer Terrence Milliner Sr.
          </p>
          <div className="flex gap-4">
            <a href="https://twitter.com/lucyai"><Twitter className="w-5 h-5 text-white/80" /></a>
            <a href="https://github.com/lucyai"><Github className="w-5 h-5 text-white/80" /></a>
            <a href="https://linkedin.com/company/lucyai"><Linkedin className="w-5 h-5 text-white/80" /></a>
            <a href="mailto:hello@lucylounge.org"><Mail className="w-5 h-5 text-white/80" /></a>
          </div>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-white/80">
            <li><Link to="/studios">Studios</Link></li>
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/tools">Tools</Link></li>
            <li><Link to="/creator-studio">Creator Studio</Link></li>
            <li><Link to="/chat">Try Free</Link></li>
            <li><Link to="/analytics">Analytics</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-white/80">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/about/terrence-milliner">Our Team</Link></li>
            <li><Link to="/launch">Launch</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/testimonials">Testimonials</Link></li>
            <li><Link to="/press">Press</Link></li>
            <li><Link to="/editorial-standards">Editorial Standards</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 pt-6 border-t border-white/20 text-center text-white/70 text-sm">
        © {year} Lucy AI. All rights reserved.
      </div>
    </footer>
  );
};
