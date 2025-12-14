import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, TrendingUp, ArrowRight } from 'lucide-react';

interface RelatedLink {
  title: string;
  url: string;
  type: 'pillar' | 'cluster' | 'popular';
  description?: string;
}

interface RelatedGuidesProps {
  links: RelatedLink[];
  currentPath: string;
}

const popularResources = [
  { title: '90-Day Credit Building', url: '/blog/build-business-credit-90-days', type: 'popular' as const },
  { title: 'SBA 7(a) vs 504 Loans', url: '/blog/sba-7a-vs-504-loans', type: 'popular' as const },
  { title: 'Black Women Grants', url: '/blog/black-women-entrepreneur-grants', type: 'popular' as const },
  { title: 'Metro 2 Explained', url: '/blog/metro-2-credit-reporting-explained', type: 'popular' as const },
];

export const RelatedGuides = ({ links, currentPath }: RelatedGuidesProps) => {
  const filteredLinks = links.filter(link => link.url !== currentPath);
  const filteredPopular = popularResources.filter(link => link.url !== currentPath);

  const getIcon = (type: string) => {
    switch (type) {
      case 'pillar':
        return <BookOpen className="w-4 h-4 text-primary" />;
      case 'cluster':
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      case 'popular':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Related Guides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Related Guides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredLinks.map((link, index) => (
            <Link
              key={index}
              to={link.url}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                {getIcon(link.type)}
                <div>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {link.title}
                  </p>
                  {link.description && (
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  )}
                </div>
              </div>
              {link.type === 'pillar' && (
                <Badge variant="secondary" className="text-xs">Guide</Badge>
              )}
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Popular Resources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Popular Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredPopular.slice(0, 4).map((link, index) => (
            <Link
              key={index}
              to={link.url}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors group"
            >
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm group-hover:text-primary transition-colors">
                {link.title}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* CTA Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-bold mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ask Lucy AI for personalized guidance on credit, loans, and business strategy.
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Chat with Lucy <ArrowRight className="w-4 h-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
