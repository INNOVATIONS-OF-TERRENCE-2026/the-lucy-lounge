import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [readProgress, setReadProgress] = useState(0);

  // Find the blog post by slug
  const post = blogPosts.find(p => p.slug === slug) || {
    slug: slug || '',
    title: 'Introducing Lucy AI: Beyond Intelligence',
    excerpt: 'Meet Lucy AI, your advanced AI assistant with reasoning, vision, memory, and creativity.',
    date: '2024-01-20',
    readTime: '5 min read',
    category: 'Product',
    image: '/lucy-og-image.png',
    author: 'Lucy AI Team',
    content: `Lucy AI represents a breakthrough in artificial intelligence assistants. Unlike traditional chatbots, Lucy combines multiple cutting-edge AI capabilities into a single, seamless experience.`
  };

  const articleUrl = `https://lucylounge.org/blog/${slug}`;

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <SEOHead 
        title={`${post.title} - Lucy AI Blog`}
        description={post.excerpt}
        keywords={`Lucy AI, ${post.category}, AI assistant, artificial intelligence`}
        canonical={articleUrl}
        url={articleUrl}
      />
      <ArticleSchema 
        title={post.title}
        description={post.excerpt}
        image={post.image}
        datePublished={post.date}
        authorName={post.author || 'Lucy AI Team'}
        url={articleUrl}
      />
      <BreadcrumbSchema 
        items={[
          { name: 'Home', url: 'https://lucylounge.org' },
          { name: 'Blog', url: 'https://lucylounge.org/blog' },
          { name: post.title, url: articleUrl }
        ]}
      />

      {/* Reading Progress Bar */}
      <Progress value={readProgress} className="fixed top-0 left-0 right-0 z-50 h-1 rounded-none" />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Article Header */}
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <Badge className="mb-4">{post.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground mb-8">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>

          {/* Featured Image */}
          <img 
            src={post.image}
            alt={post.title}
            className="w-full h-auto rounded-lg mb-12"
          />

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
          </div>

          {/* Article Footer */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigate('/blog')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                More Articles
              </Button>
              <Button onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Article
              </Button>
            </div>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
