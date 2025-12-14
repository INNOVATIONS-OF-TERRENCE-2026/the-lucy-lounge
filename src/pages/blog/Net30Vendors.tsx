import { SEOHead } from '@/components/seo/SEOHead';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { RelatedGuides } from '@/components/blog/RelatedGuides';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Clock, Calendar, Check, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Net30Vendors = () => {
  const navigate = useNavigate();
  const articleUrl = 'https://lucylounge.org/blog/net-30-vendors-for-new-business';

  const relatedLinks = [
    { title: 'Business Credit Repair Guide', url: '/guides/business-credit-repair', type: 'pillar' as const },
    { title: '90-Day Credit Building Plan', url: '/blog/build-business-credit-90-days', type: 'cluster' as const },
    { title: 'Metro 2 Explained', url: '/blog/metro-2-credit-reporting-explained', type: 'cluster' as const },
  ];

  const vendors = [
    {
      name: 'Uline',
      category: 'Shipping Supplies',
      creditLimit: '$500-$2,000',
      reports: ['D&B', 'Experian Business'],
      requirements: 'EIN, business bank account',
      difficulty: 'Easy'
    },
    {
      name: 'Quill',
      category: 'Office Supplies',
      creditLimit: '$500-$1,500',
      reports: ['D&B'],
      requirements: 'EIN, 6+ months in business preferred',
      difficulty: 'Easy'
    },
    {
      name: 'Grainger',
      category: 'Industrial Supplies',
      creditLimit: '$1,000-$5,000',
      reports: ['D&B', 'Experian Business'],
      requirements: 'EIN, D-U-N-S number',
      difficulty: 'Moderate'
    },
    {
      name: 'Summa Office Supplies',
      category: 'Office Supplies',
      creditLimit: '$500-$1,000',
      reports: ['D&B', 'Experian Business', 'Equifax Business'],
      requirements: 'EIN, active D-U-N-S',
      difficulty: 'Easy'
    },
    {
      name: 'Strategic Network Solutions',
      category: 'Computer Equipment',
      creditLimit: '$500-$2,000',
      reports: ['D&B', 'Experian Business'],
      requirements: 'EIN, D-U-N-S number',
      difficulty: 'Easy'
    },
    {
      name: 'Crown Office Supplies',
      category: 'Office Supplies',
      creditLimit: '$500-$1,000',
      reports: ['D&B', 'Experian Business'],
      requirements: 'EIN, D-U-N-S number',
      difficulty: 'Easy'
    },
    {
      name: 'The CEO Creative',
      category: 'Marketing Materials',
      creditLimit: '$300-$500',
      reports: ['D&B', 'Experian Business', 'Equifax Business'],
      requirements: 'EIN only',
      difficulty: 'Very Easy'
    },
    {
      name: 'Shirtsy',
      category: 'Custom Apparel',
      creditLimit: '$500-$1,500',
      reports: ['D&B', 'Experian Business'],
      requirements: 'EIN, D-U-N-S number',
      difficulty: 'Easy'
    }
  ];

  return (
    <>
      <SEOHead 
        title="Net 30 Vendors for New Business: Complete List 2025 - Lucy AI"
        description="Build business credit with Net 30 vendor accounts that report to credit bureaus. Complete list with credit limits, requirements, and application tips."
        keywords="net 30 vendors new business, vendors that report business credit, net 30 accounts, build business credit"
        canonical={articleUrl}
        url={articleUrl}
      />
      <ArticleSchema 
        title="Net 30 Vendors for New Business: Complete List"
        description="Build business credit from scratch with vendor accounts that report to D&B, Experian, and Equifax Business."
        image="/og-default.png"
        datePublished="2025-01-06"
        authorName="Lucy AI Credit Expert"
        url={articleUrl}
      />
      <BreadcrumbSchema 
        items={[
          { name: 'Home', url: 'https://lucylounge.org' },
          { name: 'Blog', url: 'https://lucylounge.org/blog' },
          { name: 'Net 30 Vendors', url: articleUrl }
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
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  January 6, 2025
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  13 min read
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">Net 30 Vendors That Report: Build Business Credit</h1>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-muted-foreground mb-8">
                  Net 30 vendor accounts are the foundation of business credit. These vendors extend credit and report your payments to business credit bureaus—building your Paydex score without personal credit checks.
                </p>

                <h2>What Is a Net 30 Account?</h2>
                <p>
                  A Net 30 account means you have 30 days to pay for purchases. When the vendor reports to credit bureaus, your on-time payments build your business credit profile.
                </p>
                <p><strong>Key benefit:</strong> Most Net 30 vendors don't check personal credit, making them accessible for new businesses and business owners with credit challenges.</p>

                <h2>Before You Apply: Setup Checklist</h2>
                <Card className="p-6 my-6 bg-muted/50">
                  <ul className="space-y-2 not-prose">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Get your EIN from the IRS (free)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Register with Dun & Bradstreet for D-U-N-S number (free)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Open a business bank account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Set up dedicated business phone number</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Create business website or professional email</span>
                    </li>
                  </ul>
                </Card>

                <h2>Net 30 Vendors That Report to Credit Bureaus</h2>
                
                <div className="space-y-4 not-prose">
                  {vendors.map((vendor, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Building className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">{vendor.name}</h3>
                            <Badge variant={vendor.difficulty === 'Very Easy' ? 'default' : 'secondary'}>
                              {vendor.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{vendor.category}</p>
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                              <p className="font-medium">Credit Limit</p>
                              <p className="text-muted-foreground">{vendor.creditLimit}</p>
                            </div>
                            <div>
                              <p className="font-medium">Reports To</p>
                              <p className="text-muted-foreground">{vendor.reports.join(', ')}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm"><strong>Requirements:</strong> {vendor.requirements}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <h2 className="mt-12">Strategy: The Right Order</h2>
                <ol>
                  <li><strong>Month 1-2:</strong> Apply to 2-3 "very easy" vendors (The CEO Creative, Crown Office)</li>
                  <li><strong>Month 2-3:</strong> Add 2-3 "easy" vendors (Uline, Quill, Summa)</li>
                  <li><strong>Month 4-6:</strong> Apply for "moderate" vendors (Grainger)</li>
                  <li><strong>Month 6+:</strong> Graduate to business credit cards</li>
                </ol>

                <h2>Maximize Reporting Impact</h2>
                <ul>
                  <li><strong>Pay early</strong> - Pay in 1-20 days for best Paydex scores</li>
                  <li><strong>Make purchases monthly</strong> - Active accounts build credit faster</li>
                  <li><strong>Verify reporting</strong> - Check D&B, Experian, Equifax after 30-60 days</li>
                  <li><strong>Request credit limit increases</strong> - After 3-6 months of good history</li>
                </ul>

                <h2>Common Mistakes to Avoid</h2>
                <ul>
                  <li><strong>Applying too fast</strong> - Space applications 2-4 weeks apart</li>
                  <li><strong>Mixing personal/business</strong> - Always use business info consistently</li>
                  <li><strong>Paying late</strong> - Even 1 late payment damages your Paydex</li>
                  <li><strong>Not verifying reporting</strong> - Some vendors stop reporting; monitor accounts</li>
                </ul>

                <div className="bg-primary/10 p-6 rounded-lg my-8">
                  <h3 className="text-xl font-semibold mb-2">Get the Complete Credit Building System</h3>
                  <p className="mb-4">Net 30 vendors are step one. Our full guide covers dispute strategies, monitoring, and advanced credit building.</p>
                  <Button onClick={() => navigate('/guides/business-credit-repair')}>
                    Complete Credit Repair Guide <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </article>

            <aside className="hidden lg:block w-80">
              <div className="sticky top-8">
                <RelatedGuides links={relatedLinks} currentPath="/blog/net-30-vendors-for-new-business" />
              </div>
            </aside>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Net30Vendors;