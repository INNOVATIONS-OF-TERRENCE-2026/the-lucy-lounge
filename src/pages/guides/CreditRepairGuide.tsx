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
import { ArrowLeft, Clock, Calendar, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';
import { creditRepairGuide, getRelatedPosts } from '@/data/blogPosts';

const CreditRepairGuide = () => {
  const navigate = useNavigate();
  const post = creditRepairGuide;
  const relatedPosts = getRelatedPosts(post.slug);

  const faqs = [
    {
      question: 'How long does credit repair take for business owners?',
      answer: 'Credit repair typically takes 3-12 months depending on the complexity of issues. Simple errors may be resolved in 30-60 days, while rebuilding after serious delinquencies can take 12-24 months. Consistent effort and proper documentation accelerate the process.'
    },
    {
      question: 'What is Metro 2 and why does it matter for credit repair?',
      answer: 'Metro 2 is the standardized data format credit bureaus use to report consumer credit information. Understanding Metro 2 helps identify technical errors and formatting violations that create valid dispute grounds, potentially leading to removal of negative items.'
    },
    {
      question: 'Can I repair my credit while building business credit?',
      answer: 'Yes, and you should! Personal and business credit are separate but related. While repairing personal credit, open business credit accounts that report to business bureaus (D&B, Experian Business). This builds your business credit profile independently.'
    },
    {
      question: 'What credit score do I need for an SBA loan?',
      answer: 'While there is no official minimum, most SBA lenders prefer a personal credit score of 650+ for best approval odds. Scores between 620-649 are possible but challenging. Below 620, consider credit repair before applying or explore alternative funding.'
    },
    {
      question: 'Should I pay off collections or dispute them first?',
      answer: 'Dispute first, especially if the debt is old or you are unsure of its validity. Paying a collection resets the "date of last activity" which can extend how long it affects your score. If you do pay, negotiate a "pay for delete" agreement in writing first.'
    }
  ];

  const tableOfContents = [
    { id: 'what-is-metro-2', title: 'What Is Metro 2 Credit Reporting?' },
    { id: 'step-1-get-reports', title: 'Step 1: Get Your Credit Reports' },
    { id: 'step-2-identify-disputes', title: 'Step 2: Identify Disputable Items' },
    { id: 'step-3-dispute-letters', title: 'Step 3: Write Effective Dispute Letters' },
    { id: 'building-business-credit', title: 'Building Business Credit' },
    { id: 'timeline', title: 'Credit Repair Timeline' }
  ];

  return (
    <>
      <SEOHead 
        title={post.title}
        description={post.metaDescription}
        keywords={post.tags.join(', ')}
        image={post.image}
        url={`https://lucylounge.org/guides/business-credit-repair`}
        canonical="https://lucylounge.org/guides/business-credit-repair"
      />
      <ArticleSchema
        title={post.title}
        description={post.metaDescription}
        image={post.image}
        datePublished={post.date}
        dateModified={post.modifiedDate}
        authorName={post.author}
        url="https://lucylounge.org/guides/business-credit-repair"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: 'Credit Repair Guide', url: '/guides/business-credit-repair' }
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
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
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
                  <BookOpen className="w-4 h-4" />
                  Comprehensive Guide
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
              <YMYLDisclaimer type="credit" />
            </div>
          </div>

          {/* Main Content */}
          <article className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
              
              {/* What Is Metro 2 */}
              <section id="what-is-metro-2" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">What Is Metro 2 Credit Reporting?</h2>
                <p className="text-muted-foreground mb-6">
                  Metro 2 is the standardized data format that credit bureaus (Experian, Equifax, TransUnion) use to report consumer credit information. Understanding Metro 2 is crucial because:
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Compliance codes matter:</strong> Each account has specific status codes that determine how it affects your score</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Reporting accuracy:</strong> Errors in Metro 2 formatting can create disputable inaccuracies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Timeline requirements:</strong> Creditors must follow strict reporting timelines</span>
                  </li>
                </ul>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-card/50 rounded-lg overflow-hidden">
                    <thead className="bg-primary/10">
                      <tr>
                        <th className="text-left p-4 font-semibold">Code</th>
                        <th className="text-left p-4 font-semibold">Meaning</th>
                        <th className="text-left p-4 font-semibold">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border/20">
                        <td className="p-4 font-mono">11</td>
                        <td className="p-4">Current</td>
                        <td className="p-4 text-green-500">Positive</td>
                      </tr>
                      <tr className="border-t border-border/20">
                        <td className="p-4 font-mono">71</td>
                        <td className="p-4">30 days late</td>
                        <td className="p-4 text-yellow-500">Negative</td>
                      </tr>
                      <tr className="border-t border-border/20">
                        <td className="p-4 font-mono">78</td>
                        <td className="p-4">60 days late</td>
                        <td className="p-4 text-orange-500">Severe Negative</td>
                      </tr>
                      <tr className="border-t border-border/20">
                        <td className="p-4 font-mono">80</td>
                        <td className="p-4">90 days late</td>
                        <td className="p-4 text-red-500">Severe Negative</td>
                      </tr>
                      <tr className="border-t border-border/20">
                        <td className="p-4 font-mono">97</td>
                        <td className="p-4">Charge-off</td>
                        <td className="p-4 text-red-500">Severe Negative</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Step 1 */}
              <section id="step-1-get-reports" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Step 1: Get Your Credit Reports</h2>
                <p className="text-muted-foreground mb-6">
                  Before you can repair your credit, you need to know exactly what's on it.
                </p>
                <ol className="space-y-4 list-decimal list-inside">
                  <li className="text-muted-foreground">Visit AnnualCreditReport.com for free reports from all three bureaus</li>
                  <li className="text-muted-foreground">Review each report line by line</li>
                  <li className="text-muted-foreground">Document any errors, outdated information, or unverified accounts</li>
                  <li className="text-muted-foreground">Note the "date of first delinquency" for negative items</li>
                </ol>
              </section>

              {/* Step 2 */}
              <section id="step-2-identify-disputes" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Step 2: Identify Disputable Items</h2>
                <p className="text-muted-foreground mb-6">
                  Not everything negative can be disputed, but many items contain errors:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Incorrect account information</strong> (wrong balance, payment history)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Outdated negative items</strong> (older than 7 years)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Accounts that aren't yours</strong> (identity theft or mixed files)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Duplicate entries</strong> (same debt reported multiple times)</span>
                  </li>
                </ul>
              </section>

              {/* Step 3 */}
              <section id="step-3-dispute-letters" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Step 3: Write Effective Dispute Letters</h2>
                <p className="text-muted-foreground mb-6">
                  The key to successful disputes is specificity. Generic letters get generic responses.
                </p>
                <Card className="p-6 bg-primary/5 border-primary/20 mb-6">
                  <h3 className="font-semibold mb-4">What to Include in Your Dispute Letter:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Your full legal name and current address</li>
                    <li>• The specific item being disputed</li>
                    <li>• The exact reason for the dispute</li>
                    <li>• Supporting documentation</li>
                    <li>• A clear request for investigation and removal</li>
                  </ul>
                </Card>
              </section>

              {/* Building Business Credit */}
              <section id="building-business-credit" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Building Business Credit Separately</h2>
                <p className="text-muted-foreground mb-6">
                  While repairing personal credit, start building business credit:
                </p>
                <ol className="space-y-4 list-decimal list-inside">
                  <li className="text-muted-foreground"><strong>Get an EIN</strong> from the IRS</li>
                  <li className="text-muted-foreground"><strong>Register your business</strong> with Dun & Bradstreet</li>
                  <li className="text-muted-foreground"><strong>Open business credit accounts</strong> that report to business bureaus</li>
                  <li className="text-muted-foreground"><strong>Pay on time</strong> or early to build positive history</li>
                </ol>
              </section>

              {/* Timeline */}
              <section id="timeline" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">How Long Does Credit Repair Take?</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold text-primary">30-60 days</div>
                    <div className="text-muted-foreground">Initial dispute results</div>
                  </Card>
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold text-primary">3-6 months</div>
                    <div className="text-muted-foreground">Noticeable score improvement</div>
                  </Card>
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold text-primary">6-12 months</div>
                    <div className="text-muted-foreground">Significant credit rebuilding</div>
                  </Card>
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold text-primary">12-24 months</div>
                    <div className="text-muted-foreground">Excellent credit restoration</div>
                  </Card>
                </div>
              </section>

              {/* CTA */}
              <section className="mb-12">
                <Card className="p-8 bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30 text-center">
                  <h2 className="text-2xl font-bold mb-4">Get Expert Credit Repair Guidance</h2>
                  <p className="text-muted-foreground mb-6">
                    Lucy AI can analyze your credit situation and provide personalized recommendations.
                  </p>
                  <Button size="lg" onClick={() => navigate('/auth')}>
                    Try Lucy AI Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </section>
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="container mx-auto px-4 py-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Card 
                      key={relatedPost.slug}
                      className="p-6 bg-card/50 cursor-pointer hover:bg-card/70 transition-colors"
                      onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                    >
                      <Badge className="mb-3">{relatedPost.category}</Badge>
                      <h3 className="font-semibold mb-2">{relatedPost.title}</h3>
                      <p className="text-sm text-muted-foreground">{relatedPost.excerpt}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* FAQ Section */}
          <SEOFAQSection
            title="Credit Repair FAQ for Business Owners"
            subtitle="Answers to common questions about improving your credit"
            faqs={faqs}
          />

          <Footer />
        </div>
      </div>
    </>
  );
};

export default CreditRepairGuide;
