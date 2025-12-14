import { SEOHead } from '@/components/seo/SEOHead';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Clock, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BlackWomenGrants = () => {
  const navigate = useNavigate();
  const articleUrl = 'https://lucylounge.org/blog/black-women-entrepreneur-grants';

  const grants = [
    {
      name: 'Amber Grant',
      amount: '$10,000 monthly + $25,000 annual',
      deadline: 'End of each month',
      eligibility: 'All women entrepreneurs',
      link: 'https://ambergrantsforwomen.com'
    },
    {
      name: 'SoGal Black Founder Startup Grant',
      amount: '$10,000',
      deadline: 'Rolling',
      eligibility: 'Black women and non-binary founders',
      link: 'https://sogal.co'
    },
    {
      name: 'Fearless Fund',
      amount: '$20,000',
      deadline: 'Quarterly',
      eligibility: 'Women of color-led businesses',
      link: 'https://fearless.fund'
    },
    {
      name: 'IFundWomen Universal Grant',
      amount: '$25,000',
      deadline: 'Rolling',
      eligibility: 'All women founders',
      link: 'https://ifundwomen.com'
    },
    {
      name: 'Glossier Grant Initiative',
      amount: '$10,000',
      deadline: 'Annual',
      eligibility: 'Black women-owned beauty businesses',
      link: 'https://glossier.com'
    },
    {
      name: 'Visa She\'s Next Grant',
      amount: '$10,000',
      deadline: 'Quarterly',
      eligibility: 'Women small business owners',
      link: 'https://usa.visa.com'
    },
    {
      name: 'Tory Burch Foundation Fellows',
      amount: '$5,000 + education',
      deadline: 'Annual',
      eligibility: 'Women entrepreneurs in U.S.',
      link: 'https://toryburchfoundation.org'
    },
    {
      name: 'NAACP x Hello Alice Black-Owned Business Grant',
      amount: '$25,000',
      deadline: 'Periodic',
      eligibility: 'Black-owned small businesses',
      link: 'https://helloalice.com'
    }
  ];

  return (
    <>
      <SEOHead 
        title="Grants for Black Women Entrepreneurs 2025: Complete List - Lucy AI"
        description="Comprehensive list of grants specifically for Black women business owners. Updated 2025 with amounts, deadlines, eligibility, and application tips."
        keywords="grants black women entrepreneurs, black women business grants, minority women grants, black female founder funding"
        canonical={articleUrl}
        url={articleUrl}
      />
      <ArticleSchema 
        title="Grants for Black Women Entrepreneurs (2025)"
        description="Complete and updated list of grants available for Black women business owners, with application tips and strategies."
        image="/og-default.png"
        datePublished="2025-01-07"
        authorName="Lucy AI Business Expert"
        url={articleUrl}
      />
      <BreadcrumbSchema 
        items={[
          { name: 'Home', url: 'https://lucylounge.org' },
          { name: 'Blog', url: 'https://lucylounge.org/blog' },
          { name: 'Black Women Grants', url: articleUrl }
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>

        <article className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              January 7, 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              11 min read
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">Grants for Black Women Entrepreneurs: 2025 Complete Guide</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead text-xl text-muted-foreground mb-8">
              Black women are the fastest-growing demographic of entrepreneurs in the U.S., yet receive less than 1% of venture funding. These grants help close the gap.
            </p>

            <h2>Grant Opportunities Database</h2>
            <p className="mb-4">
              Below are verified grant programs accepting applications in 2025. Bookmark this page—we update it monthly.
            </p>

            <div className="space-y-4 not-prose">
              {grants.map((grant, index) => (
                <Card key={index} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{grant.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {grant.amount}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Deadline:</strong> {grant.deadline}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Eligibility:</strong> {grant.eligibility}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0" asChild>
                      <a href={grant.link} target="_blank" rel="noopener noreferrer">
                        Learn More <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <h2 className="mt-12">How to Win Grant Applications</h2>
            
            <h3>1. Tell Your Story Powerfully</h3>
            <p>
              Grant reviewers read hundreds of applications. Your story needs to stand out. Focus on:
            </p>
            <ul>
              <li>Why you started this business (personal connection)</li>
              <li>The problem you're solving and who benefits</li>
              <li>Your unique qualifications and experience</li>
              <li>Specific impact you'll create with the funds</li>
            </ul>

            <h3>2. Be Specific About Fund Usage</h3>
            <p>
              Vague plans lose to specific ones. Instead of "marketing," say "Facebook ads targeting women 25-45 in Atlanta to generate 500 leads."
            </p>

            <h3>3. Show Traction</h3>
            <p>
              Even small wins matter. Include:
            </p>
            <ul>
              <li>Revenue numbers (even if small)</li>
              <li>Customer testimonials</li>
              <li>Social media following</li>
              <li>Press mentions</li>
              <li>Partnerships or collaborations</li>
            </ul>

            <h3>4. Apply to Multiple Grants</h3>
            <p>
              Grant acceptance rates are typically 5-15%. Apply to at least 10 grants to improve your odds.
            </p>

            <h2>Additional Funding Sources</h2>
            <p>While pursuing grants, also explore:</p>
            <ul>
              <li><strong>WOSB Certification</strong> - Access federal contracts. 
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/blog/wosb-certification-guide')}>
                  See our guide →
                </Button>
              </li>
              <li><strong>SBA Loans</strong> - Government-backed loans with favorable terms.
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/guides/sba-loan-complete-guide')}>
                  SBA guide →
                </Button>
              </li>
              <li><strong>CDFIs</strong> - Community lenders with flexible requirements</li>
              <li><strong>Crowdfunding</strong> - Platforms like IFundWomen combine community and coaching</li>
            </ul>

            <h2>Organizations Supporting Black Women Entrepreneurs</h2>
            <ul>
              <li><strong>Black Girl Ventures</strong> - Pitch competitions and community</li>
              <li><strong>Backstage Capital</strong> - VC for underrepresented founders</li>
              <li><strong>digitalundivided</strong> - Programs and research</li>
              <li><strong>New Voices Foundation</strong> - Support for women of color entrepreneurs</li>
              <li><strong>National Black Chamber of Commerce</strong> - Advocacy and resources</li>
            </ul>

            <div className="bg-primary/10 p-6 rounded-lg my-8">
              <h3 className="text-xl font-semibold mb-2">Get Our Complete Women Entrepreneur Funding Guide</h3>
              <p className="mb-4">Beyond grants: loans, certifications, investors, and alternative funding strategies.</p>
              <Button onClick={() => navigate('/guides/funding-for-women-entrepreneurs')}>
                Complete Funding Guide <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
};

export default BlackWomenGrants;