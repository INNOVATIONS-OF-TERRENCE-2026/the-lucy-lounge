import { SEOHead } from '@/components/seo/SEOHead';
import { PersonSchema } from '@/components/seo/PersonSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Code, Brain, Briefcase, Award, BookOpen, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';

const AuthorPage = () => {
  const navigate = useNavigate();

  const expertise = [
    { icon: Brain, title: 'AI Architecture', description: 'Designing intelligent systems with advanced reasoning capabilities' },
    { icon: Code, title: 'Software Engineering', description: 'Full-stack development with modern frameworks and best practices' },
    { icon: Briefcase, title: 'Business Credit', description: 'Deep expertise in credit repair, SBA loans, and business funding' },
    { icon: Award, title: 'System Design', description: 'Building scalable, reliable platforms for enterprise applications' },
  ];

  const credentials = [
    'Software Engineer with 10+ years experience',
    'AI/ML system architect and designer',
    'Business credit and funding specialist',
    'Creator of Lucy AI platform',
    'Published technical author',
  ];

  const articles = [
    { title: 'Complete Business Credit Repair Guide', url: '/guides/business-credit-repair' },
    { title: 'SBA Loan Complete Guide 2025', url: '/guides/sba-loan-complete-guide' },
    { title: 'Funding for Women Entrepreneurs', url: '/guides/funding-for-women-entrepreneurs' },
    { title: 'Metro 2 Credit Reporting Explained', url: '/blog/metro-2-credit-reporting-explained' },
    { title: 'SBA 7(a) vs 504 Loans', url: '/blog/sba-7a-vs-504-loans' },
  ];

  return (
    <>
      <SEOHead 
        title="Terrence Milliner Sr. | Software Engineer & AI Architect | Lucy AI"
        description="Meet Terrence Milliner Sr., the Software Engineer and AI Architect behind Lucy AI. Expert in AI systems, business credit, and SBA loan guidance."
        keywords="Terrence Milliner Sr, Lucy AI creator, software engineer, AI architect, business credit expert, SBA loan specialist"
        image="/og-default.png"
        url="https://lucylounge.org/about/terrence-milliner"
        canonical="https://lucylounge.org/about/terrence-milliner"
      />
      <PersonSchema
        name="Terrence Milliner Sr."
        jobTitle="Software Engineer & AI Architect"
        description="Creator of Lucy AI. Expert in AI systems architecture, business credit strategies, and SBA loan guidance. Helping entrepreneurs build stronger businesses through technology and financial knowledge."
        url="/about/terrence-milliner"
        image="/lucy-og-image.png"
        sameAs={[
          'https://lucylounge.org/about/terrence-milliner'
        ]}
        worksFor={{
          name: 'Lucy AI',
          url: 'https://lucylounge.org'
        }}
        knowsAbout={[
          'Artificial Intelligence',
          'Machine Learning',
          'Software Engineering',
          'Business Credit',
          'SBA Loans',
          'Small Business Funding',
          'Credit Repair',
          'System Architecture'
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
          { name: 'Terrence Milliner Sr.', url: '/about/terrence-milliner' }
        ]}
      />
      
      <div className="min-h-screen relative overflow-hidden">
        <CosmicBackground />

        <div className="relative z-10">
          {/* Header */}
          <div className="container mx-auto px-4 py-8">
            <Button
              variant="ghost"
              className="text-foreground hover:bg-muted/20 border border-border/30"
              onClick={() => navigate('/about')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to About
            </Button>
          </div>

          {/* Hero Section */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="glass-card-enhanced p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Avatar */}
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0 shadow-glow-violet">
                    <span className="text-4xl font-bold text-foreground">TM</span>
                  </div>

                  {/* Bio */}
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      Terrence Milliner Sr.
                    </h1>
                    <p className="text-xl text-primary mb-4">
                      Software Engineer & AI Architect
                    </p>
                    <p className="text-foreground/80 leading-relaxed mb-6">
                      Creator of Lucy AI, I'm passionate about building intelligent systems that help 
                      entrepreneurs succeed. With expertise spanning AI architecture, software engineering, 
                      and business finance, I've dedicated my career to making complex topics accessible 
                      and actionable for small business owners.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">AI/ML</span>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">Business Credit</span>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">SBA Loans</span>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">Full-Stack Dev</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Expertise Grid */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Areas of Expertise</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {expertise.map((item, index) => (
                  <Card key={index} className="glass-card p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Credentials */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Credentials & Experience</h2>
              <div className="glass-card-enhanced p-8">
                <ul className="space-y-4">
                  {credentials.map((credential, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-foreground/90">{credential}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Published Articles */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2">
                <BookOpen className="w-6 h-6" />
                Published Guides & Articles
              </h2>
              <div className="space-y-4">
                {articles.map((article, index) => (
                  <Link key={index} to={article.url}>
                    <Card className="glass-card p-4 hover:bg-muted/20 transition-colors group">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground group-hover:text-primary transition-colors">
                          {article.title}
                        </span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto glass-card-enhanced p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Experience Lucy AI
              </h2>
              <p className="text-foreground/80 mb-6">
                Try the AI assistant I built to help entrepreneurs with credit repair, 
                SBA loans, and business growth strategies.
              </p>
              <Button
                size="lg"
                className="bg-gradient-button text-white hover:shadow-glow-magenta transition-all"
                onClick={() => navigate('/auth')}
              >
                Get Started Free
              </Button>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default AuthorPage;
