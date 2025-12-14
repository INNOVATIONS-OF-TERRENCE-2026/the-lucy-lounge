import { SEOHead } from '@/components/seo/SEOHead';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { HowToSchema } from '@/components/seo/HowToSchema';
import { RelatedGuides } from '@/components/blog/RelatedGuides';
import { AuthorByline } from '@/components/blog/AuthorByline';
import { YMYLDisclaimer } from '@/components/blog/YMYLDisclaimer';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Build90DayCredit = () => {
  const navigate = useNavigate();
  const articleUrl = 'https://lucylounge.org/blog/build-business-credit-90-days';

  const relatedLinks = [
    { title: 'Business Credit Repair Guide', url: '/guides/business-credit-repair', type: 'pillar' as const },
    { title: 'Net-30 Vendors List', url: '/blog/net-30-vendors-for-new-business', type: 'cluster' as const },
    { title: 'Dispute Letters Guide', url: '/blog/dispute-letters-that-work', type: 'cluster' as const },
  ];

  const howToSteps = [
    { name: 'Week 1-2: Foundation', text: 'Get EIN, register D-U-N-S number, open business bank account, set up business address and phone' },
    { name: 'Week 3-4: First Accounts', text: 'Apply for 2-3 starter Net 30 vendor accounts that report to business credit bureaus' },
    { name: 'Week 5-8: Build Activity', text: 'Make purchases on vendor accounts and pay within 15 days. Apply for 2-3 more vendors' },
    { name: 'Week 9-12: Graduate Up', text: 'Apply for business credit cards, request credit limit increases on existing accounts' }
  ];

  return (
    <>
      <SEOHead 
        title="Build Business Credit in 90 Days: Week-by-Week Plan - Lucy AI"
        description="Actionable 90-day plan to build business credit from scratch. Week-by-week tasks, vendor recommendations, and timeline to your first business credit card."
        keywords="build business credit fast, business credit 90 days, business credit timeline, how long to build business credit"
        canonical={articleUrl}
        url={articleUrl}
      />
      <ArticleSchema 
        title="Build Business Credit in 90 Days"
        description="Complete week-by-week action plan to build business credit from zero."
        image="/og-default.png"
        datePublished="2025-01-05"
        dateModified="2025-01-14"
        authorName="Terrence Milliner Sr."
        url={articleUrl}
      />
      <HowToSchema 
        name="Build Business Credit in 90 Days"
        description="Week-by-week action plan to establish and build business credit"
        steps={howToSteps}
        totalTime="P90D"
        estimatedCost={{ currency: 'USD', value: '0-500' }}
      />
      <BreadcrumbSchema 
        items={[
          { name: 'Home', url: 'https://lucylounge.org' },
          { name: 'Blog', url: 'https://lucylounge.org/blog' },
          { name: 'Build Credit 90 Days', url: articleUrl }
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
                publishDate="2025-01-05"
                lastUpdated="2025-01-14"
                readTime="10 min read"
              />
              <YMYLDisclaimer type="credit" />

              <h1 className="text-4xl md:text-5xl font-bold mb-6">Build Business Credit in 90 Days: Your Action Plan</h1>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-muted-foreground mb-8">
                  Most business owners wait years to build credit. With this 90-day plan, you can establish a solid business credit foundation and be ready for your first business credit card.
                </p>

                <h2>Week 1-2: Lay the Foundation</h2>
                <Card className="p-6 my-4 border-l-4 border-l-primary">
                  <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Goal: Business Identity</h3>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Day 1:</strong> Get your EIN from IRS.gov (free, instant)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Day 2-3:</strong> Register for D-U-N-S number at dnb.com (free)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Day 4-7:</strong> Open business bank account (recommend: Chase, Bank of America, or local credit union)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Day 7-10:</strong> Set up business phone number (Google Voice works)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Day 10-14:</strong> Create business email and basic website</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <h2>Week 3-4: First Credit Accounts</h2>
                <Card className="p-6 my-4 border-l-4 border-l-primary">
                  <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Goal: 2-3 Reporting Accounts</h3>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Week 3:</strong> Apply to The CEO Creative (easiest approval)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Week 3:</strong> Apply to Uline (shipping supplies)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Week 4:</strong> Apply to Quill or Summa Office Supplies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Week 4:</strong> Make first purchases (even small amounts count)</span>
                        </li>
                      </ul>
                      <p className="mt-4 text-sm text-muted-foreground">
                        See full vendor list: <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/blog/net-30-vendors-for-new-business')}>Net 30 Vendors Guide →</Button>
                      </p>
                    </div>
                  </div>
                </Card>

                <h2>Week 5-8: Build Payment History</h2>
                <Card className="p-6 my-4 border-l-4 border-l-primary">
                  <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Goal: Perfect Payment History</h3>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Weekly:</strong> Make at least one purchase per vendor account</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Pay within 15 days:</strong> Early payment = higher Paydex score</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Week 6:</strong> Apply for 2 more vendor accounts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Week 8:</strong> Check D&B for initial Paydex score</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <h2>Week 9-12: Level Up</h2>
                <Card className="p-6 my-4 border-l-4 border-l-primary">
                  <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Goal: Business Credit Card</h3>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Week 9:</strong> Request credit limit increases on existing accounts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Week 10:</strong> Apply for store business credit card (Staples, Amazon)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Week 11:</strong> Check all three business credit reports</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                          <span><strong>Week 12:</strong> Apply for first general business credit card (Chase Ink, Capital One Spark)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <h2>Expected Results After 90 Days</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Expected Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Paydex Score</td>
                        <td>70-80 (good)</td>
                      </tr>
                      <tr>
                        <td>Trade Lines</td>
                        <td>5-8 reporting accounts</td>
                      </tr>
                      <tr>
                        <td>Credit Limit</td>
                        <td>$5,000-$15,000 total</td>
                      </tr>
                      <tr>
                        <td>Business Credit Card</td>
                        <td>1-2 approvals likely</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h2>Keys to Success</h2>
                <ol>
                  <li><strong>Never miss a payment</strong> - One late payment destroys momentum</li>
                  <li><strong>Pay early, not just on time</strong> - 1-15 day payments boost Paydex</li>
                  <li><strong>Keep business and personal separate</strong> - Always use business info</li>
                  <li><strong>Be patient with applications</strong> - Space them 2-3 weeks apart</li>
                  <li><strong>Monitor your progress</strong> - Check reports at week 6 and week 12</li>
                </ol>

                <div className="bg-primary/10 p-6 rounded-lg my-8">
                  <h3 className="text-xl font-semibold mb-2">Need to Repair Personal Credit First?</h3>
                  <p className="mb-4">If personal credit issues are holding you back, our complete guide covers dispute strategies and repair tactics.</p>
                  <Button onClick={() => navigate('/guides/business-credit-repair')}>
                    Credit Repair Guide <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </article>

            <aside className="hidden lg:block w-80">
              <div className="sticky top-8">
                <RelatedGuides links={relatedLinks} currentPath="/blog/build-business-credit-90-days" />
              </div>
            </aside>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Build90DayCredit;