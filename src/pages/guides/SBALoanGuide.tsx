import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { SEOFAQSection } from '@/components/blog/SEOFAQSection';
import { YMYLDisclaimer } from '@/components/blog/YMYLDisclaimer';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Clock, Calendar, CheckCircle2, ArrowRight, BookOpen, DollarSign } from 'lucide-react';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';
import { sbaLoanGuide, getRelatedPosts } from '@/data/blogPosts';

const SBALoanGuide = () => {
  const navigate = useNavigate();
  const post = sbaLoanGuide;
  const relatedPosts = getRelatedPosts(post.slug);

  const faqs = [
    {
      question: 'How long does SBA loan approval take?',
      answer: 'SBA loan approval typically takes 30-90 days depending on the loan type. SBA Express loans can be approved in 36 hours to 2 weeks. Standard 7(a) loans take 30-90 days. 504 loans for real estate take 60-90 days. Preparation and complete documentation can speed up the process.'
    },
    {
      question: 'What credit score do I need for an SBA loan?',
      answer: 'While there is no official SBA minimum credit score, most lenders prefer 680+ for excellent approval odds, 650-679 for good odds, and 620-649 is challenging but possible. Below 620, consider credit repair or alternative funding options before applying.'
    },
    {
      question: 'Can I get an SBA loan with bad credit?',
      answer: 'It is difficult but possible with scores between 620-649. You may need a larger down payment, collateral, or a co-signer. SBA Microloans through CDFIs have more flexible requirements. Consider credit repair while exploring Community Advantage lenders who specialize in underserved markets.'
    },
    {
      question: 'What is the difference between SBA 7(a) and 504 loans?',
      answer: 'SBA 7(a) loans are versatile and can be used for working capital, equipment, inventory, and debt refinancing with amounts up to $5 million. SBA 504 loans are specifically for major fixed assets like commercial real estate and heavy equipment, with amounts up to $5.5 million and lower down payments (10%).'
    },
    {
      question: 'What documents do I need for an SBA loan application?',
      answer: 'You will need: business plan, 3 years of business tax returns, year-to-date financial statements, business licenses, personal tax returns, personal financial statement, and proof of collateral. Complete documentation significantly improves approval speed and odds.'
    }
  ];

  const tableOfContents = [
    { id: 'what-is-sba', title: 'What Is an SBA Loan?' },
    { id: 'loan-types', title: 'Types of SBA Loans' },
    { id: 'requirements', title: 'SBA Loan Requirements Checklist' },
    { id: 'timeline', title: 'How Long Does Approval Take?' },
    { id: 'improving-odds', title: 'Improving Your Approval Odds' },
    { id: 'denied', title: 'What If Your Loan Gets Denied?' }
  ];

  return (
    <>
      <SEOHead 
        title={post.title}
        description={post.metaDescription}
        keywords={post.tags.join(', ')}
        image={post.image}
        url="https://lucylounge.org/guides/sba-loan-complete-guide"
        canonical="https://lucylounge.org/guides/sba-loan-complete-guide"
      />
      <ArticleSchema
        title={post.title}
        description={post.metaDescription}
        image={post.image}
        datePublished={post.date}
        dateModified={post.modifiedDate}
        authorName={post.author}
        url="https://lucylounge.org/guides/sba-loan-complete-guide"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: 'SBA Loan Guide', url: '/guides/sba-loan-complete-guide' }
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
              onClick={() => navigate('/blog')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>

          {/* Hero Section */}
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
                {post.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {post.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Up to $5M Funding
                </span>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6 bg-card/50 backdrop-blur-lg border-border/20">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Table of Contents
                </h2>
                <nav className="space-y-2">
                  {tableOfContents.map((item, index) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      <span className="text-primary font-mono text-sm">{index + 1}.</span>
                      {item.title}
                    </a>
                  ))}
                </nav>
              </Card>
            </div>
          </div>

          {/* YMYL Disclaimer */}
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <YMYLDisclaimer type="sba" />
            </div>
          </div>

          {/* Main Content */}
          <article className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
              
              {/* What Is SBA */}
              <section id="what-is-sba" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">What Is an SBA Loan?</h2>
                <p className="text-muted-foreground mb-6">
                  SBA loans are not direct loans from the government. Instead, the SBA guarantees a portion of loans made by approved lenders, reducing lender risk and enabling:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold text-green-400">Lower Interest Rates</div>
                    <div className="text-muted-foreground text-sm">Than conventional business loans</div>
                  </Card>
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold text-green-400">Longer Terms</div>
                    <div className="text-muted-foreground text-sm">Up to 25 years for real estate</div>
                  </Card>
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold text-green-400">Lower Down Payments</div>
                    <div className="text-muted-foreground text-sm">As low as 10%</div>
                  </Card>
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold text-green-400">Broader Access</div>
                    <div className="text-muted-foreground text-sm">For businesses that might not qualify otherwise</div>
                  </Card>
                </div>
              </section>

              {/* Loan Types */}
              <section id="loan-types" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Types of SBA Loans</h2>
                
                <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
                  <h3 className="text-xl font-bold mb-4">SBA 7(a) Loan Program</h3>
                  <p className="text-muted-foreground mb-4">The most popular SBA loan type for working capital, equipment, and debt refinancing.</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Maximum:</strong> $5 million</li>
                    <li>• <strong>Terms:</strong> 10-25 years</li>
                    <li>• <strong>Rates:</strong> Prime + 2.25% to 4.75%</li>
                  </ul>
                </Card>

                <Card className="p-6 mb-6 bg-green-500/5 border-green-500/20">
                  <h3 className="text-xl font-bold mb-4">SBA 504 Loan Program</h3>
                  <p className="text-muted-foreground mb-4">Designed for commercial real estate and heavy equipment purchases.</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Maximum:</strong> $5.5 million</li>
                    <li>• <strong>Terms:</strong> 10-25 years</li>
                    <li>• <strong>Down Payment:</strong> 10-20%</li>
                  </ul>
                </Card>

                <Card className="p-6 bg-blue-500/5 border-blue-500/20">
                  <h3 className="text-xl font-bold mb-4">SBA Microloan Program</h3>
                  <p className="text-muted-foreground mb-4">For startups and small businesses needing smaller amounts.</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Maximum:</strong> $50,000</li>
                    <li>• <strong>Average Loan:</strong> $13,000</li>
                    <li>• <strong>Best For:</strong> New businesses, working capital</li>
                  </ul>
                </Card>
              </section>

              {/* Requirements */}
              <section id="requirements" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">SBA Loan Requirements Checklist</h2>
                
                <h3 className="text-xl font-semibold mb-4">Basic Eligibility</h3>
                <ul className="space-y-3 mb-6">
                  {[
                    'For-profit business operating in the U.S.',
                    'Meet SBA size standards for "small business"',
                    'Demonstrated need for loan proceeds',
                    'No outstanding federal debt or delinquent payments',
                    'Owner with at least 20% stake must personally guarantee'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-semibold mb-4">Required Documentation</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold mb-2">Business Documents</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Business plan with projections</li>
                      <li>• Business licenses</li>
                      <li>• 3 years tax returns</li>
                      <li>• Financial statements</li>
                    </ul>
                  </Card>
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold mb-2">Personal Documents</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 3 years personal tax returns</li>
                      <li>• Personal financial statement</li>
                      <li>• Resume/experience proof</li>
                      <li>• Credit authorization</li>
                    </ul>
                  </Card>
                </div>
              </section>

              {/* Timeline */}
              <section id="timeline" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">How Long Does SBA Loan Approval Take?</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-card/50 rounded-lg overflow-hidden">
                    <thead className="bg-primary/10">
                      <tr>
                        <th className="text-left p-4 font-semibold">Loan Type</th>
                        <th className="text-left p-4 font-semibold">Typical Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border/20">
                        <td className="p-4">SBA Express</td>
                        <td className="p-4 text-green-400">36 hours to 2 weeks</td>
                      </tr>
                      <tr className="border-t border-border/20">
                        <td className="p-4">SBA 7(a)</td>
                        <td className="p-4">30-90 days</td>
                      </tr>
                      <tr className="border-t border-border/20">
                        <td className="p-4">SBA 504</td>
                        <td className="p-4">60-90 days</td>
                      </tr>
                      <tr className="border-t border-border/20">
                        <td className="p-4">SBA Microloan</td>
                        <td className="p-4">30-60 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Improving Odds */}
              <section id="improving-odds" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Improving Your Approval Odds</h2>
                
                <h3 className="text-xl font-semibold mb-4">Credit Score Requirements</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="p-4 bg-green-500/10 border-green-500/20">
                    <div className="font-semibold">680+</div>
                    <div className="text-sm text-green-400">Excellent odds</div>
                  </Card>
                  <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
                    <div className="font-semibold">650-679</div>
                    <div className="text-sm text-yellow-400">Good odds</div>
                  </Card>
                  <Card className="p-4 bg-orange-500/10 border-orange-500/20">
                    <div className="font-semibold">620-649</div>
                    <div className="text-sm text-orange-400">Challenging</div>
                  </Card>
                  <Card className="p-4 bg-red-500/10 border-red-500/20">
                    <div className="font-semibold">&lt;620</div>
                    <div className="text-sm text-red-400">Difficult</div>
                  </Card>
                </div>
              </section>

              {/* Denied */}
              <section id="denied" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">What If Your SBA Loan Gets Denied?</h2>
                <p className="text-muted-foreground mb-6">Don't give up. Here's what to do:</p>
                <ol className="space-y-4 list-decimal list-inside">
                  <li className="text-muted-foreground"><strong>Ask for specific reasons</strong> for the denial</li>
                  <li className="text-muted-foreground"><strong>Address the issues</strong> (credit repair, additional documentation)</li>
                  <li className="text-muted-foreground"><strong>Consider alternative SBA programs</strong> (Microloans, Community Advantage)</li>
                  <li className="text-muted-foreground"><strong>Work with an SBA-approved lender</strong> who specializes in your industry</li>
                  <li className="text-muted-foreground"><strong>Reapply after 6 months</strong> with improvements</li>
                </ol>
              </section>

              {/* CTA */}
              <section className="mb-12">
                <Card className="p-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30 text-center">
                  <h2 className="text-2xl font-bold mb-4">Get Help With Your SBA Loan Application</h2>
                  <p className="text-muted-foreground mb-6">
                    Lucy AI can help you assess eligibility, prepare documentation, and understand your options.
                  </p>
                  <Button size="lg" onClick={() => navigate('/auth')}>
                    Try Lucy AI Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </section>
            </div>
          </article>

          {/* FAQ Section */}
          <SEOFAQSection
            title="SBA Loan FAQ"
            subtitle="Common questions about SBA loans answered"
            faqs={faqs}
          />

          <Footer />
        </div>
      </div>
    </>
  );
};

export default SBALoanGuide;
