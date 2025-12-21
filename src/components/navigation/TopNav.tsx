import { Link, NavLink } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const TopNav = () => {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors hover:text-primary',
      isActive ? 'text-primary' : 'text-foreground/80'
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          Lucy AI
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/features" className={linkClass}>Features</NavLink>
          <NavLink to="/pricing" className={linkClass}>Pricing</NavLink>
          <NavLink to="/tools" className={linkClass}>Tools</NavLink>

          {/* Studios */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary">
              Studios <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute left-0 mt-2 w-48 rounded-md border border-border bg-background shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
              <NavLink to="/studios/ai" className="block px-4 py-2 hover:bg-muted">AI Studio</NavLink>
              <NavLink to="/studios/audio" className="block px-4 py-2 hover:bg-muted">Audio Studio</NavLink>
              <NavLink to="/studios/dev" className="block px-4 py-2 hover:bg-muted">Dev Studio</NavLink>
            </div>
          </div>

          {/* Guides */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary">
              Guides <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute left-0 mt-2 w-72 rounded-md border border-border bg-background shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
              <NavLink to="/guides/business-credit-repair" className="block px-4 py-2 hover:bg-muted">
                Business Credit Repair
              </NavLink>
              <NavLink to="/guides/sba-loan-complete-guide" className="block px-4 py-2 hover:bg-muted">
                SBA Loan Complete Guide
              </NavLink>
              <NavLink to="/guides/funding-for-women-entrepreneurs" className="block px-4 py-2 hover:bg-muted">
                Funding for Women Entrepreneurs
              </NavLink>
            </div>
          </div>

          <NavLink to="/about" className={linkClass}>About</NavLink>
          <NavLink to="/blog" className={linkClass}>Blog</NavLink>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex gap-3">
          <Button asChild variant="outline">
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/chat">Try Free</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          <Menu />
        </Button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <NavLink to="/features" onClick={() => setOpen(false)}>Features</NavLink>
          <NavLink to="/pricing" onClick={() => setOpen(false)}>Pricing</NavLink>
          <NavLink to="/tools" onClick={() => setOpen(false)}>Tools</NavLink>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Studios</p>
            <NavLink to="/studios/ai" onClick={() => setOpen(false)}>AI Studio</NavLink>
            <NavLink to="/studios/audio" onClick={() => setOpen(false)}>Audio Studio</NavLink>
            <NavLink to="/studios/dev" onClick={() => setOpen(false)}>Dev Studio</NavLink>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Guides</p>
            <NavLink to="/guides/business-credit-repair" onClick={() => setOpen(false)}>Business Credit</NavLink>
            <NavLink to="/guides/sba-loan-complete-guide" onClick={() => setOpen(false)}>SBA Loans</NavLink>
            <NavLink to="/guides/funding-for-women-entrepreneurs" onClick={() => setOpen(false)}>Women Funding</NavLink>
          </div>

          <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
          <NavLink to="/blog" onClick={() => setOpen(false)}>Blog</NavLink>
          <NavLink to="/auth" onClick={() => setOpen(false)}>Sign In</NavLink>
        </div>
      )}
    </header>
  );
};
