import { SEOHead } from '@/components/seo/SEOHead';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, FileCheck, RefreshCw, Shield, BookOpen, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';

const EditorialStandards = () => {
  const navigate = useNavigate();

  const principles = [
    {
      icon: CheckCircle,
      title: 'Accuracy First',
      description: 'Every claim is verified against authoritative sources. We cite government agencies (SBA.gov, CFPB.gov), official regulations, and peer-reviewed research.'
    },
    {
      icon: RefreshCw,
      title: 'Regular Updates',
      description: 'Content is reviewed quarterly and updated when regulations change. Every article displays its last update date prominently.'
    },
    {
      icon: Shield,
      title: 'Transparency',
      description: 'We clearly disclose our methodology, potential conflicts of interest, and the limitations of AI-assisted content.'
    },
    {
      icon: BookOpen,
      title: 'Expert Review',
      description: 'All financial and technical content is reviewed by subject matter experts before publication.'
    }
  ];

  const factCheckProcess = [
    'Identify all factual claims in the content',
    'Trace each claim to a primary source (government sites, official publications)',
    'Cross-reference with at least two authoritative sources when possible',
    'Document all sources with links for reader verification',
    'Flag outdated information for immediate update',
    'Add "Last Updated" date to all published content'
  ];

  const citationTiers = [
    { tier: 'Tier 1 (Primary)', sources: 'SBA.gov, CFPB.gov, IRS.gov, FTC.gov, Federal Reserve', priority: 'Always preferred' },
    { tier: 'Tier 2 (Authoritative)', sources: 'State agencies, SCORE, established financial institutions', priority: 'Use when Tier 1 unavailable' },
    { tier: 'Tier 3 (Supporting)', sources: 'Forbes, Wall Street Journal, industry publications', priority: 'For context and trends' },
    { tier: 'Tier 4 (Avoid)', sources: 'Unverified blogs, outdated content, anonymous sources', priority: 'Never cite' }
  ];

  return (
    <>
      <SEOHead 
        title="Editorial Standards | Lucy AI Content Guidelines"
        description="Learn about Lucy AI's commitment to accuracy, transparency, and quality. Our editorial standards ensure reliable, well-researched content for business owners."
        keywords="editorial standards, content guidelines, fact-checking, accuracy standards, Lucy AI quality"
        image="/og-default.png"
        url="https://lucylounge.org/editorial-standards"
        canonical="https://lucylounge.org/editorial-standards"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Editorial Standards', url: '/editorial-standards' }
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
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Hero */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Editorial Standards
              </h1>
              <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
                Our commitment to accuracy, transparency, and quality in everything we publish.
              </p>
            </div>
          </section>

          {/* Core Principles */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Core Principles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {principles.map((principle, index) => (
                  <Card key={index} className="glass-card p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <principle.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{principle.title}</h3>
                        <p className="text-sm text-muted-foreground">{principle.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Fact-Checking Process */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2">
                <FileCheck className="w-6 h-6" />
                Fact-Checking Process
              </h2>
              <div className="glass-card-enhanced p-8">
                <ol className="space-y-4">
                  {factCheckProcess.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-semibold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-foreground/90 pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* Citation Framework */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Citation Framework</h2>
              <div className="space-y-4">
                {citationTiers.map((tier, index) => (
                  <Card key={index} className="glass-card p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="md:w-1/4">
                        <span className={`font-semibold ${index === 3 ? 'text-destructive' : 'text-primary'}`}>
                          {tier.tier}
                        </span>
                      </div>
                      <div className="md:w-1/2">
                        <p className="text-foreground/80 text-sm">{tier.sources}</p>
                      </div>
                      <div className="md:w-1/4 text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          index === 3 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                        }`}>
                          {tier.priority}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* AI Disclosure */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <Card className="glass-card-enhanced p-8 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">AI-Assisted Content Disclosure</h3>
                    <p className="text-foreground/80 text-sm mb-4">
                      Lucy AI uses artificial intelligence to help generate and organize content. However, 
                      all AI-generated content undergoes human review for accuracy, relevance, and quality 
                      before publication.
                    </p>
                    <p className="text-foreground/80 text-sm">
                      AI is a tool to enhance our content creation process, not replace human expertise 
                      and judgment. Our editorial team makes final decisions on all published content.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* YMYL Disclaimer */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Financial Content Disclaimer</h2>
              <div className="glass-card p-8">
                <p className="text-foreground/80 mb-4">
                  Content related to business credit, loans, and funding is provided for educational 
                  purposes only. Lucy AI is not a licensed financial advisor, and our content should 
                  not be considered professional financial advice.
                </p>
                <p className="text-foreground/80 mb-4">
                  Before making financial decisions, we recommend consulting with qualified professionals 
                  such as certified accountants, licensed financial advisors, or SBA-approved lenders.
                </p>
                <p className="text-foreground/80">
                  Regulations and requirements change frequently. While we strive to keep content current, 
                  always verify information with official sources before taking action.
                </p>
              </div>
            </div>
          </section>

          {/* Contact for Corrections */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto glass-card-enhanced p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Report an Error
              </h2>
              <p className="text-foreground/80 mb-6">
                Found inaccurate information? We appreciate corrections and update content promptly.
              </p>
              <Button
                size="lg"
                className="bg-gradient-button text-white hover:shadow-glow-magenta transition-all"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default EditorialStandards;
