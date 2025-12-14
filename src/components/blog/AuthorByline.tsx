import { Link } from 'react-router-dom';
import { Calendar, User, Clock } from 'lucide-react';

interface AuthorBylineProps {
  authorName?: string;
  authorTitle?: string;
  authorUrl?: string;
  publishDate: string;
  lastUpdated?: string;
  readTime?: string;
}

export const AuthorByline = ({
  authorName = 'Terrence Milliner Sr.',
  authorTitle = 'Software Engineer & AI Architect',
  authorUrl = '/about/terrence-milliner',
  publishDate,
  lastUpdated,
  readTime
}: AuthorBylineProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b border-border/30 pb-4 mb-6">
      {/* Author */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <Link 
            to={authorUrl}
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            {authorName}
          </Link>
          <p className="text-xs text-muted-foreground">{authorTitle}</p>
        </div>
      </div>

      <div className="hidden sm:block w-px h-8 bg-border/50" />

      {/* Dates */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Published: {formatDate(publishDate)}</span>
        </div>
        
        {lastUpdated && lastUpdated !== publishDate && (
          <div className="flex items-center gap-1.5 text-primary">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated: {formatDate(lastUpdated)}</span>
          </div>
        )}

        {readTime && (
          <>
            <span className="text-border">•</span>
            <span>{readTime}</span>
          </>
        )}
      </div>
    </div>
  );
};
