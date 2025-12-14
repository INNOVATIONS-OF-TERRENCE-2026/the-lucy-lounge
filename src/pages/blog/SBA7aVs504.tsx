import { SEOHead } from '@/components/seo/SEOHead';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { RelatedGuides } from '@/components/blog/RelatedGuides';
import { AuthorByline } from '@/components/blog/AuthorByline';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SBA7aVs504 = () => {
  const navigate = useNavigate();
  const articleUrl = 'https://lucylounge.org/blog/sba-7a-vs-504-loans';

  const relatedLinks = [
    { title: 'SBA Loan Complete Guide', url: '/guides/sba-loan-complete-guide', type: 'pillar' as const },
    { title: 'SBA Loan with Bad Credit', url: '/blog/sba-loan-with-bad-credit', type: 'cluster' as const },
    { title: 'Business Credit Repair Guide', url: '/guides/business-credit-repair', type: 'cluster' as const },
  ];

  return (
    <>
      <SEOHead 
        title="SBA 7(a) vs 504 Loans: Complete Comparison Guide - Lucy AI"
        description="Compare SBA 7(a) and 504 loans side-by-side. Learn which loan is best for your business based on use case, requirements, rates, and terms."
        keywords="sba 7a vs 504, which sba loan is best, sba loan comparison, sba 7a loan, sba 504 loan"
        canonical={articleUrl}
        url={articleUrl}
      />
      <ArticleSchema 
        title="SBA 7(a) vs 504 Loans: Complete Comparison"
        description="Detailed comparison of SBA 7(a) and 504 loans to help you choose the right funding option."
        image="/og-default.png"
        datePublished="2025-01-10"
        dateModified="2025-01-14"
        authorName="Terrence Milliner Sr."
        url={articleUrl}
      />
      <BreadcrumbSchema 
        items={[
          { name: 'Home', url: 'https://lucylounge.org' },
          { name: 'Blog', url: 'https://lucylounge.org/blog' },
          { name: 'SBA 7a vs 504', url: articleUrl }
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex gap-8">
            <article className="flex-1 max-w-4xl">
              <AuthorByline 
                publishDate="2025-01-10"
                lastUpdated="2025-01-14"
                readTime="10 min read"
              />

              <h1 className="text-4xl md:text-5xl font-bold mb-6">SBA 7(a) vs 504 Loans: Which Is Right for Your Business?</h1>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-muted-foreground mb-8">
                  Both SBA 7(a) and 504 loans offer excellent terms for small businesses, but they serve different purposes. This guide breaks down exactly when to choose each.
                </p>

                <h2>Quick Comparison Table</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th>Feature</th>
                        <th>SBA 7(a)</th>
                        <th>SBA 504</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Max Loan Amount</td>
                        <td>$5 million</td>
                        <td>$5.5 million</td>
                      </tr>
                      <tr>
                        <td>Primary Use</td>
                        <td>Working capital, equipment, real estate</td>
                        <td>Real estate, heavy equipment only</td>
                      </tr>
                      <tr>
                        <td>Down Payment</td>
                        <td>10-20%</td>
                        <td>10%</td>
                      </tr>
                      <tr>
                        <td>Interest Rates</td>
                        <td>Variable (Prime + 2.25-4.75%)</td>
                        <td>Fixed (below market)</td>
                      </tr>
                      <tr>
                        <td>Term Length</td>
                        <td>10-25 years</td>
                        <td>10-25 years</td>
                      </tr>
                      <tr>
                        <td>Approval Time</td>
                        <td>30-90 days</td>
                        <td>60-90 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h2>When to Choose SBA 7(a)</h2>
                <Card className="p-6 my-6 border-green-500/30 bg-green-500/5">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" /> Best For:
                  </h3>
                  <ul className="space-y-2">
                    <li>✅ Working capital and operating expenses</li>
                    <li>✅ Inventory purchases</li>
                    <li>✅ Debt refinancing</li>
                    <li>✅ Business acquisition</li>
                    <li>✅ Mixed-use funding needs</li>
                    <li>✅ Flexibility in how funds are used</li>
                  </ul>
                </Card>

                <p>
                  The SBA 7(a) is the most versatile SBA loan program. It's ideal when you need flexibility or when your funding needs don't fit neatly into the real estate/equipment category. Most small businesses start here.
                </p>

                <h2>When to Choose SBA 504</h2>
                <Card className="p-6 my-6 border-blue-500/30 bg-blue-500/5">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-blue-500" /> Best For:
                  </h3>
                  <ul className="space-y-2">
                    <li>✅ Buying commercial real estate</li>
                    <li>✅ Constructing new facilities</li>
                    <li>✅ Major equipment purchases ($350K+)</li>
                    <li>✅ Long-term fixed-rate financing</li>
                    <li>✅ Lower down payment (10%)</li>
                    <li>✅ Job creation focus businesses</li>
                  </ul>
                </Card>

                <p>
                  The SBA 504 is specifically designed for major fixed assets. The key advantage is fixed below-market interest rates and lower down payments. However, funds cannot be used for working capital or inventory.
                </p>

                <h2>SBA 504 Loan Structure Explained</h2>
                <p>The 504 loan has a unique structure with three funding sources:</p>
                <ol>
                  <li><strong>Bank loan (50%)</strong> - From a traditional lender, first lien position</li>
                  <li><strong>CDC loan (40%)</strong> - From a Certified Development Company, backed by SBA</li>
                  <li><strong>Borrower equity (10%)</strong> - Your down payment</li>
                </ol>
                <p>
                  This structure allows for the lower down payment and below-market rates on the CDC portion.
                </p>

                <h2>Interest Rate Comparison</h2>
                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">SBA 7(a) Rates</h4>
                    <p className="text-2xl font-bold text-primary">Prime + 2.25% to 4.75%</p>
                    <p className="text-sm text-muted-foreground mt-2">Variable rate, changes with market</p>
                  </Card>
                  <Card className="p-6">
                    <h4 className="font-semibold mb-2">SBA 504 Rates</h4>
                    <p className="text-2xl font-bold text-primary">~5-6% Fixed</p>
                    <p className="text-sm text-muted-foreground mt-2">Fixed rate, locked at closing</p>
                  </Card>
                </div>

                <h2>Decision Flowchart</h2>
                <Card className="p-6 my-6 bg-muted/50">
                  <div className="space-y-4">
                    <p><strong>Question 1:</strong> Is your primary use real estate or heavy equipment?</p>
                    <p className="pl-4">→ Yes: Consider SBA 504</p>
                    <p className="pl-4">→ No: Choose SBA 7(a)</p>
                    
                    <p><strong>Question 2:</strong> Do you need working capital as part of the loan?</p>
                    <p className="pl-4">→ Yes: Choose SBA 7(a)</p>
                    <p className="pl-4">→ No: Either could work</p>
                    
                    <p><strong>Question 3:</strong> Is a fixed rate important to you?</p>
                    <p className="pl-4">→ Yes: Consider SBA 504</p>
                    <p className="pl-4">→ No: SBA 7(a) may be faster</p>
                  </div>
                </Card>

                <h2>Can You Combine Both?</h2>
                <p>
                  Yes! Some businesses use an SBA 7(a) for working capital and equipment while simultaneously using an SBA 504 for real estate. This allows you to maximize the benefits of both programs.
                </p>

                <div className="bg-primary/10 p-6 rounded-lg my-8">
                  <h3 className="text-xl font-semibold mb-2">Ready to Apply for an SBA Loan?</h3>
                  <p className="mb-4">Our complete guide covers requirements, documentation, and strategies to improve your approval odds.</p>
                  <Button onClick={() => navigate('/guides/sba-loan-complete-guide')}>
                    Read Complete SBA Guide <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </article>

            <aside className="hidden lg:block w-80">
              <div className="sticky top-8">
                <RelatedGuides links={relatedLinks} currentPath="/blog/sba-7a-vs-504-loans" />
              </div>
            </aside>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default SBA7aVs504;