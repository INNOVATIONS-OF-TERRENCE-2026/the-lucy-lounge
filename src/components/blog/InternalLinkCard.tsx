import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FileText, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InternalLinkCardProps {
  title: string;
  description: string;
  url: string;
  type?: 'guide' | 'article' | 'tip';
  category?: string;
}

export const InternalLinkCard = ({ 
  title, 
  description, 
  url, 
  type = 'article',
  category 
}: InternalLinkCardProps) => {
  const icons = {
    guide: BookOpen,
    article: FileText,
    tip: Lightbulb
  };
  
  const Icon = icons[type];
  
  const labels = {
    guide: 'Comprehensive Guide',
    article: 'Related Article',
    tip: 'Pro Tip'
  };

  return (
    <Card className="my-6 p-4 bg-primary/5 border-primary/20 hover:border-primary/40 transition-colors">
      <Link to={url} className="flex items-start gap-4 group">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">{labels[type]}</Badge>
            {category && <Badge variant="outline" className="text-xs">{category}</Badge>}
          </div>
          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
      </Link>
    </Card>
  );
};

interface InternalLinkInlineProps {
  text: string;
  url: string;
}

export const InternalLinkInline = ({ text, url }: InternalLinkInlineProps) => {
  return (
    <Link 
      to={url} 
      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
    >
      {text}
      <ArrowRight className="w-3 h-3" />
    </Link>
  );
};

interface RelatedReadingProps {
  articles: Array<{
    title: string;
    url: string;
    type?: 'guide' | 'article' | 'tip';
  }>;
}

export const RelatedReading = ({ articles }: RelatedReadingProps) => {
  if (articles.length === 0) return null;

  return (
    <div className="my-8 p-6 rounded-lg bg-muted/50 border border-border/50">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        Continue Reading
      </h4>
      <ul className="space-y-3">
        {articles.map((article, index) => (
          <li key={index}>
            <Link 
              to={article.url}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
              <span>{article.title}</span>
              {article.type === 'guide' && (
                <Badge variant="outline" className="text-xs ml-auto">Guide</Badge>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
