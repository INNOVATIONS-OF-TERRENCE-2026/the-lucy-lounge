import { SEOHead } from '@/components/seo/SEOHead';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { RelatedGuides } from '@/components/blog/RelatedGuides';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Clock, Calendar, Check, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WOSBCertification = () => {
  const navigate = useNavigate();
  const articleUrl = 'https://lucylounge.org/blog/wosb-certification-guide';

  const relatedLinks = [
    { title: 'Women Entrepreneur Funding Guide', url: '/guides/funding-for-women-entrepreneurs', type: 'pillar' as const },
    { title: 'Grants for Black Women Entrepreneurs', url: '/blog/black-women-entrepreneur-grants', type: 'cluster' as const },
    { title: 'SBA Loan Complete Guide', url: '/guides/sba-loan-complete-guide', type: 'cluster' as const },
  ];

  return (
    <>
      <SEOHead 
        title="WOSB Certification Guide: Step-by-Step Process (2025) - Lucy AI"
        description="Complete guide to Women-Owned Small Business (WOSB) certification. Requirements, application process, documents needed, and tips for approval."
        keywords="wosb certification, women owned business certification, how to get wosb, wosb requirements, women owned small business"
        canonical={articleUrl}
        url={articleUrl}
      />
      <ArticleSchema 
        title="WOSB Certification: Complete Step-by-Step Guide"
        description="Everything you need to know about getting certified as a Women-Owned Small Business for federal contracting."
        image="/og-default.png"
        datePublished="2025-01-08"
        authorName="Lucy AI Business Expert"
        url={articleUrl}
      />
      <BreadcrumbSchema 
        items={[
          { name: 'Home', url: 'https://lucylounge.org' },
          { name: 'Blog', url: 'https://lucylounge.org/blog' },
          { name: 'WOSB Certification', url: articleUrl }
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
                  January 8, 2025
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  14 min read
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">WOSB Certification: Your Complete Guide</h1>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-muted-foreground mb-8">
                  WOSB certification opens doors to billions in federal contracts set aside specifically for women-owned businesses. Here's exactly how to get certified.
                </p>

                <h2>What Is WOSB Certification?</h2>
                <p>
                  The Women-Owned Small Business (WOSB) Federal Contracting Program is designed to help women-owned businesses compete for federal contracts. The government has a goal of awarding at least 5% of all federal contracting dollars to WOSBs.
                </p>

                <h2>Benefits of WOSB Certification</h2>
                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <Card className="p-4">
                    <Check className="w-5 h-5 text-green-500 mb-2" />
                    <h4 className="font-semibold">Set-Aside Contracts</h4>
                    <p className="text-sm text-muted-foreground">Access contracts reserved specifically for WOSBs</p>
                  </Card>
                  <Card className="p-4">
                    <Check className="w-5 h-5 text-green-500 mb-2" />
                    <h4 className="font-semibold">Sole-Source Awards</h4>
                    <p className="text-sm text-muted-foreground">Contracts up to $4.5M without competition</p>
                  </Card>
                  <Card className="p-4">
                    <Check className="w-5 h-5 text-green-500 mb-2" />
                    <h4 className="font-semibold">Competitive Edge</h4>
                    <p className="text-sm text-muted-foreground">Stand out in federal marketplace</p>
                  </Card>
                  <Card className="p-4">
                    <Check className="w-5 h-5 text-green-500 mb-2" />
                    <h4 className="font-semibold">Free Certification</h4>
                    <p className="text-sm text-muted-foreground">SBA certification costs nothing</p>
                  </Card>
                </div>

                <h2>WOSB vs EDWOSB</h2>
                <p>There are two types of certification:</p>
                <ul>
                  <li><strong>WOSB</strong> - Women-Owned Small Business (51%+ owned and controlled by women)</li>
                  <li><strong>EDWOSB</strong> - Economically Disadvantaged WOSB (same as WOSB plus income/net worth limits)</li>
                </ul>
                <p>EDWOSB has access to more set-aside contracts across additional NAICS codes.</p>

                <h2>Basic Requirements</h2>
                <Card className="p-6 my-6 bg-muted/50">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5" /> Eligibility Checklist
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Business is at least 51% owned by one or more women</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Women manage day-to-day operations and make long-term decisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Women hold highest officer position</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Business meets SBA size standards for its NAICS code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Business is organized as for-profit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      <span>Primary business location in the U.S.</span>
                    </li>
                  </ul>
                </Card>

                <h2>For EDWOSB: Additional Requirements</h2>
                <ul>
                  <li><strong>Personal net worth</strong> under $850,000 (excluding primary residence and business)</li>
                  <li><strong>Adjusted gross income</strong> average under $400,000 over 3 years</li>
                  <li><strong>Fair market value</strong> of all assets under $6.5 million</li>
                </ul>

                <h2>Step-by-Step Certification Process</h2>

                <h3>Step 1: Register in SAM.gov</h3>
                <p>
                  Before applying for WOSB certification, your business must be registered in the System for Award Management (SAM.gov). This is free and required for all federal contracting.
                </p>

                <h3>Step 2: Create SBA Account</h3>
                <p>
                  Visit certify.sba.gov and create an account. This is the official SBA certification portal.
                </p>

                <h3>Step 3: Gather Documents</h3>
                <p>Documents typically required:</p>
                <ul>
                  <li>Articles of incorporation/organization</li>
                  <li>Operating agreement or bylaws</li>
                  <li>Ownership documents (stock certificates, membership certificates)</li>
                  <li>Birth certificates or passports for women owners</li>
                  <li>Personal and business tax returns (3 years)</li>
                  <li>Business financial statements</li>
                  <li>Resumes of owners and key employees</li>
                  <li>Bank signature cards</li>
                  <li>Loan agreements (if applicable)</li>
                </ul>

                <h3>Step 4: Complete Application</h3>
                <p>
                  The online application asks detailed questions about ownership, control, and day-to-day management. Be thorough and consistent with your documentation.
                </p>

                <h3>Step 5: Upload Documents</h3>
                <p>
                  Upload all supporting documents. Ensure they're clear, complete, and match the information in your application.
                </p>

                <h3>Step 6: Submit and Wait</h3>
                <p>
                  SBA review typically takes 2-4 weeks. You may receive requests for additional information.
                </p>

                <h2>Common Mistakes to Avoid</h2>
                <ol>
                  <li><strong>Inconsistent documents</strong> - Ownership percentages must match across all documents</li>
                  <li><strong>Missing signatures</strong> - All documents requiring signatures must be complete</li>
                  <li><strong>Outdated information</strong> - Use current operating agreements and bylaws</li>
                  <li><strong>Control issues</strong> - Ensure women actually control decision-making</li>
                  <li><strong>Size standard errors</strong> - Verify you meet SBA size standards for your NAICS</li>
                </ol>

                <h2>Timeline</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th>Phase</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Document gathering</td>
                        <td>1-2 weeks</td>
                      </tr>
                      <tr>
                        <td>Application completion</td>
                        <td>1-2 days</td>
                      </tr>
                      <tr>
                        <td>SBA review</td>
                        <td>2-4 weeks</td>
                      </tr>
                      <tr>
                        <td>Additional info (if needed)</td>
                        <td>1-2 weeks</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Total</td>
                        <td className="font-semibold">4-8 weeks</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-primary/10 p-6 rounded-lg my-8">
                  <h3 className="text-xl font-semibold mb-2">Explore All Funding Options for Women</h3>
                  <p className="mb-4">WOSB is just one piece of the funding puzzle. Our complete guide covers grants, loans, and investment strategies.</p>
                  <Button onClick={() => navigate('/guides/funding-for-women-entrepreneurs')}>
                    Women Entrepreneur Funding Guide <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </article>

            <aside className="hidden lg:block w-80">
              <div className="sticky top-8">
                <RelatedGuides links={relatedLinks} currentPath="/blog/wosb-certification-guide" />
              </div>
            </aside>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default WOSBCertification;