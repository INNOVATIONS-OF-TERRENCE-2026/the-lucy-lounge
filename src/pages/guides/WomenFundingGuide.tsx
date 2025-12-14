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
import { ArrowLeft, Clock, Calendar, CheckCircle2, ArrowRight, BookOpen, Star, Award } from 'lucide-react';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';
import { womenFundingGuide, getRelatedPosts } from '@/data/blogPosts';

const WomenFundingGuide = () => {
  const navigate = useNavigate();
  const post = womenFundingGuide;
  const relatedPosts = getRelatedPosts(post.slug);

  const faqs = [
    {
      question: 'What grants are available specifically for women-owned businesses?',
      answer: 'Key grants include the Amber Grant ($10,000 monthly + $25,000 annual), Cartier Women\'s Initiative ($100,000), IFundWomen coaching grants, SBIR/STTR federal grants for technology companies, and various state-specific programs. Competition is high but these are free money that doesn\'t require repayment.'
    },
    {
      question: 'How do I get WOSB (Women-Owned Small Business) certification?',
      answer: 'WOSB certification requires your business to be 51% or more owned and controlled by women, with women making day-to-day management decisions. Apply through the SBA\'s free certification process or through an approved third-party certifier. The process takes 2-6 weeks with proper documentation.'
    },
    {
      question: 'What is the difference between WOSB and WBENC certification?',
      answer: 'WOSB is a federal certification that opens access to government contracts set aside for women-owned businesses. WBENC is a national certification recognized by Fortune 500 companies for supplier diversity programs. Many businesses get both for maximum opportunity access.'
    },
    {
      question: 'Why do women entrepreneurs receive less venture capital?',
      answer: 'Women-founded companies receive only about 2.3% of venture capital due to network effects, unconscious bias, and underrepresentation in VC firms. However, data shows women-led companies generate 10% more revenue per dollar invested, and many women-focused VC firms are actively working to close this gap.'
    },
    {
      question: 'What are the best funding alternatives if I can\'t get traditional loans?',
      answer: 'Alternatives include revenue-based financing (repay as percentage of sales), CDFIs (community development financial institutions with flexible terms), crowdfunding platforms like IFundWomen, angel investor networks like Golden Seeds, and business grants specifically for women entrepreneurs.'
    }
  ];

  const tableOfContents = [
    { id: 'funding-landscape', title: 'The Current Funding Landscape' },
    { id: 'grants', title: 'Grants for Women-Owned Businesses' },
    { id: 'certifications', title: 'Certifications That Open Doors' },
    { id: 'venture-capital', title: 'Venture Capital for Women Founders' },
    { id: 'alternatives', title: 'Alternative Funding Strategies' },
    { id: 'building-strategy', title: 'Building Your Funding Strategy' }
  ];

  return (
    <>
      <SEOHead 
        title={post.title}
        description={post.metaDescription}
        keywords={post.tags.join(', ')}
        image={post.image}
        url="https://lucylounge.org/guides/funding-for-women-entrepreneurs"
        canonical="https://lucylounge.org/guides/funding-for-women-entrepreneurs"
      />
      <ArticleSchema
        title={post.title}
        description={post.metaDescription}
        image={post.image}
        datePublished={post.date}
        dateModified={post.modifiedDate}
        authorName={post.author}
        url="https://lucylounge.org/guides/funding-for-women-entrepreneurs"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: 'Women Funding Guide', url: '/guides/funding-for-women-entrepreneurs' }
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
              <Badge className="mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30">
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
                  <Award className="w-4 h-4" />
                  Expert Guide
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
              <YMYLDisclaimer type="funding" />
            </div>
          </div>

          {/* Main Content */}
          <article className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
              
              {/* Funding Landscape */}
              <section id="funding-landscape" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">The Current Funding Landscape for Women</h2>
                <p className="text-muted-foreground mb-6">
                  Women-owned businesses represent one of the fastest-growing segments of the economy, yet still face significant funding gaps:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 bg-red-500/10 border-red-500/20">
                    <div className="text-2xl font-bold text-red-400">2.3%</div>
                    <div className="text-muted-foreground text-sm">of VC funding goes to women founders</div>
                  </Card>
                  <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-400">33%</div>
                    <div className="text-muted-foreground text-sm">less likely to receive bank loans</div>
                  </Card>
                  <Card className="p-4 bg-orange-500/10 border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-400">31%</div>
                    <div className="text-muted-foreground text-sm">lower average loan amounts</div>
                  </Card>
                  <Card className="p-4 bg-green-500/10 border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">+10%</div>
                    <div className="text-muted-foreground text-sm">higher revenue per dollar invested</div>
                  </Card>
                </div>
                <p className="text-muted-foreground">
                  The gap is real—but it's closing. Here's how to access available opportunities.
                </p>
              </section>

              {/* Grants */}
              <section id="grants" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Grants for Women-Owned Businesses</h2>
                <p className="text-muted-foreground mb-6">
                  Unlike loans, grants don't require repayment. Competition is fierce, but worth pursuing.
                </p>

                <h3 className="text-xl font-semibold mb-4">Top Grant Opportunities</h3>
                <div className="space-y-4 mb-8">
                  <Card className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">Amber Grant</h4>
                        <p className="text-muted-foreground text-sm">WomensNet</p>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-400">$10,000/month</Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Monthly awards to women entrepreneurs</li>
                      <li>• Simple application process</li>
                      <li>• Plus $25,000 annual grand prize</li>
                    </ul>
                  </Card>

                  <Card className="p-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">Cartier Women's Initiative</h4>
                        <p className="text-muted-foreground text-sm">Global Program</p>
                      </div>
                      <Badge className="bg-red-500/20 text-red-400">$100,000</Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• For impact-focused businesses</li>
                      <li>• Mentorship and networking included</li>
                      <li>• Global recognition</li>
                    </ul>
                  </Card>

                  <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">SBIR/STTR Programs</h4>
                        <p className="text-muted-foreground text-sm">Federal Government</p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400">Up to $1.5M</Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• For R&D and technology companies</li>
                      <li>• Preference for women-owned businesses</li>
                      <li>• Multiple funding phases</li>
                    </ul>
                  </Card>
                </div>
              </section>

              {/* Certifications */}
              <section id="certifications" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Certifications That Open Doors</h2>
                
                <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="text-xl font-bold">WOSB Certification</h3>
                      <p className="text-sm text-muted-foreground">Women-Owned Small Business</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    The federal government sets aside certain contracts for WOSBs.
                  </p>
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <ul className="space-y-2 text-muted-foreground mb-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span>51%+ owned and controlled by women</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span>Women make day-to-day decisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span>Meets SBA size standards</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 bg-pink-500/5 border-pink-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-8 h-8 text-pink-400" />
                    <div>
                      <h3 className="text-xl font-bold">WBENC Certification</h3>
                      <p className="text-sm text-muted-foreground">Women's Business Enterprise National Council</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    The gold standard for corporate supplier diversity.
                  </p>
                  <h4 className="font-semibold mb-2">Benefits:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 mt-1 flex-shrink-0" />
                      <span>Access to Fortune 500 supplier programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 mt-1 flex-shrink-0" />
                      <span>National conference and networking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 mt-1 flex-shrink-0" />
                      <span>Database listing for corporate buyers</span>
                    </li>
                  </ul>
                </Card>
              </section>

              {/* Venture Capital */}
              <section id="venture-capital" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Venture Capital for Women Founders</h2>
                
                <h3 className="text-xl font-semibold mb-4">Women-Focused VC Firms</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold">Female Founders Fund</div>
                    <div className="text-sm text-muted-foreground">Early-stage tech investments</div>
                  </Card>
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold">BBG Ventures</div>
                    <div className="text-sm text-muted-foreground">Consumer-focused startups</div>
                  </Card>
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold">Forerunner Ventures</div>
                    <div className="text-sm text-muted-foreground">Commerce and retail</div>
                  </Card>
                  <Card className="p-4 bg-card/50">
                    <div className="font-semibold">All Raise Portfolio</div>
                    <div className="text-sm text-muted-foreground">Diverse investment network</div>
                  </Card>
                </div>

                <h3 className="text-xl font-semibold mb-4">Angel Investor Networks</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Golden Seeds:</strong> Women-focused angel network</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>37 Angels:</strong> All-women investment network</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span><strong>Pipeline Angels:</strong> Impact-focused investing</span>
                  </li>
                </ul>
              </section>

              {/* Alternatives */}
              <section id="alternatives" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Alternative Funding Strategies</h2>
                
                <div className="space-y-4">
                  <Card className="p-6 bg-card/50">
                    <h3 className="font-bold text-lg mb-2">Revenue-Based Financing</h3>
                    <p className="text-muted-foreground text-sm mb-3">Repay as a percentage of revenue. Good for established businesses with predictable income who want to avoid equity dilution.</p>
                  </Card>

                  <Card className="p-6 bg-card/50">
                    <h3 className="font-bold text-lg mb-2">Community Development Financial Institutions (CDFIs)</h3>
                    <p className="text-muted-foreground text-sm mb-3">Mission-driven lenders that focus on underserved communities, offer flexible terms, and provide technical assistance.</p>
                  </Card>

                  <Card className="p-6 bg-card/50">
                    <h3 className="font-bold text-lg mb-2">Crowdfunding Platforms</h3>
                    <p className="text-muted-foreground text-sm">
                      <strong>IFundWomen</strong> (women-focused), <strong>Kickstarter</strong> (product-based), <strong>Wefunder</strong> (equity crowdfunding)
                    </p>
                  </Card>
                </div>
              </section>

              {/* Building Strategy */}
              <section id="building-strategy" className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">Building Your Funding Strategy</h2>
                <ol className="space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 text-primary font-bold">1</div>
                    <div>
                      <div className="font-semibold">Get Certified</div>
                      <div className="text-muted-foreground">Start WOSB and/or WBENC certification now—the process takes 2-6 months.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 text-primary font-bold">2</div>
                    <div>
                      <div className="font-semibold">Build Your Credit</div>
                      <div className="text-muted-foreground">Both personal and business credit matter for loans.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 text-primary font-bold">3</div>
                    <div>
                      <div className="font-semibold">Document Everything</div>
                      <div className="text-muted-foreground">Create a grant-ready file with business plan, financials, and impact metrics.</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 text-primary font-bold">4</div>
                    <div>
                      <div className="font-semibold">Network Strategically</div>
                      <div className="text-muted-foreground">Join NAWBO, Women Presidents' Organization, and industry associations.</div>
                    </div>
                  </li>
                </ol>
              </section>

              {/* CTA */}
              <section className="mb-12">
                <Card className="p-8 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 text-center">
                  <h2 className="text-2xl font-bold mb-4">Get Expert Funding Guidance</h2>
                  <p className="text-muted-foreground mb-6">
                    Lucy AI helps women entrepreneurs find funding opportunities, prepare applications, and build their businesses.
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
            title="Women Entrepreneur Funding FAQ"
            subtitle="Answers to common funding questions for women business owners"
            faqs={faqs}
          />

          <Footer />
        </div>
      </div>
    </>
  );
};

export default WomenFundingGuide;
