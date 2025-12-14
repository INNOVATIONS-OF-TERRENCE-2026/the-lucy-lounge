import { SEOHead } from '@/components/seo/SEOHead';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Clock, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SBABadCredit = () => {
  const navigate = useNavigate();
  const articleUrl = 'https://lucylounge.org/blog/sba-loan-with-bad-credit';

  return (
    <>
      <SEOHead 
        title="SBA Loan with Bad Credit: Your Options in 2025 - Lucy AI"
        description="A 620 credit score isn't automatic denial. Learn SBA loan options for bad credit, minimum requirements by program, and strategies to improve approval odds."
        keywords="sba loan bad credit, minimum credit score sba, sba loan requirements credit score, sba loan denied credit"
        canonical={articleUrl}
        url={articleUrl}
      />
      <ArticleSchema 
        title="SBA Loan with Bad Credit: Your Options"
        description="A 620 credit score isn't automatic denial. Here's the path forward for SBA loans with less-than-perfect credit."
        image="/og-default.png"
        datePublished="2025-01-09"
        authorName="Lucy AI Business Expert"
        url={articleUrl}
      />
      <BreadcrumbSchema 
        items={[
          { name: 'Home', url: 'https://lucylounge.org' },
          { name: 'Blog', url: 'https://lucylounge.org/blog' },
          { name: 'SBA Loan Bad Credit', url: articleUrl }
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
              January 9, 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              9 min read
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">SBA Loan with Bad Credit: Your Real Options</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead text-xl text-muted-foreground mb-8">
              A 620 credit score doesn't mean automatic denial. Here's what you actually need to know about getting SBA funding with imperfect credit.
            </p>

            <Card className="p-6 my-6 border-yellow-500/30 bg-yellow-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Important Truth</h3>
                  <p className="text-sm">
                    The SBA does not set minimum credit scores. Individual lenders do. This means your options vary dramatically depending on which lender you approach.
                  </p>
                </div>
              </div>
            </Card>

            <h2>Credit Score Tiers for SBA Loans</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Credit Score</th>
                    <th>Approval Odds</th>
                    <th>Best Programs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-green-600 font-semibold">700+</td>
                    <td>Excellent</td>
                    <td>Any SBA program</td>
                  </tr>
                  <tr>
                    <td className="text-green-500 font-semibold">680-699</td>
                    <td>Good</td>
                    <td>Most SBA programs</td>
                  </tr>
                  <tr>
                    <td className="text-yellow-600 font-semibold">650-679</td>
                    <td>Moderate</td>
                    <td>SBA 7(a), Microloans, Community Advantage</td>
                  </tr>
                  <tr>
                    <td className="text-orange-600 font-semibold">620-649</td>
                    <td>Challenging</td>
                    <td>Microloans, CDFIs, select 7(a) lenders</td>
                  </tr>
                  <tr>
                    <td className="text-red-600 font-semibold">Below 620</td>
                    <td>Difficult</td>
                    <td>Microloans, CDFIs only (with strong business)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Best SBA Options for Lower Credit Scores</h2>

            <h3>1. SBA Microloan Program</h3>
            <Card className="p-6 my-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Most flexible on credit</p>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• Loans up to $50,000</li>
                    <li>• Focus on character and business viability</li>
                    <li>• Technical assistance often included</li>
                    <li>• Scores as low as 575 considered</li>
                  </ul>
                </div>
              </div>
            </Card>

            <h3>2. SBA Community Advantage</h3>
            <Card className="p-6 my-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Mission-driven lenders</p>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• Loans up to $350,000</li>
                    <li>• Serves underrepresented communities</li>
                    <li>• More holistic underwriting approach</li>
                    <li>• Often accept 640+ scores</li>
                  </ul>
                </div>
              </div>
            </Card>

            <h3>3. CDFI Lenders</h3>
            <Card className="p-6 my-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Community Development Financial Institutions</p>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• Mission to serve underbanked businesses</li>
                    <li>• Often SBA-approved lenders</li>
                    <li>• Consider full picture, not just score</li>
                    <li>• May offer technical assistance</li>
                  </ul>
                </div>
              </div>
            </Card>

            <h2>How to Improve Your Approval Odds</h2>
            <ol>
              <li>
                <strong>Fix credit errors first</strong> - Even small corrections can boost your score.
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/guides/business-credit-repair')}>
                  See our credit repair guide →
                </Button>
              </li>
              <li><strong>Build business credit separately</strong> - Strong business credit can offset personal credit issues</li>
              <li><strong>Increase your down payment</strong> - Offering 20-30% down shows commitment and reduces lender risk</li>
              <li><strong>Show strong cash flow</strong> - Consistent revenue matters more than credit to some lenders</li>
              <li><strong>Get a co-signer</strong> - A partner or investor with better credit can strengthen your application</li>
              <li><strong>Offer additional collateral</strong> - Real estate, equipment, or inventory can offset credit concerns</li>
            </ol>

            <h2>What If You've Been Denied?</h2>
            <p>An SBA denial isn't the end. Here's what to do:</p>
            <ol>
              <li><strong>Ask for specific reasons</strong> - You have the right to know why</li>
              <li><strong>Address the issues</strong> - Create a plan to fix each problem</li>
              <li><strong>Try a different lender</strong> - Different lenders have different criteria</li>
              <li><strong>Consider alternatives</strong> - Revenue-based financing, equipment financing, or lines of credit</li>
              <li><strong>Reapply after 6 months</strong> - With improvements made</li>
            </ol>

            <h2>Timeline to Improve Credit Before Applying</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Current Score</th>
                    <th>Target Score</th>
                    <th>Realistic Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>580-620</td>
                    <td>660+</td>
                    <td>6-12 months</td>
                  </tr>
                  <tr>
                    <td>620-650</td>
                    <td>680+</td>
                    <td>3-6 months</td>
                  </tr>
                  <tr>
                    <td>650-680</td>
                    <td>700+</td>
                    <td>2-4 months</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg my-8">
              <h3 className="text-xl font-semibold mb-2">Check Your SBA Readiness</h3>
              <p className="mb-4">Take our quick quiz to see which SBA programs you may qualify for and get personalized next steps.</p>
              <Button onClick={() => navigate('/toolkit/sba-readiness')}>
                Take SBA Readiness Quiz <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="border-t pt-8 mt-8">
              <Button variant="outline" onClick={() => navigate('/guides/sba-loan-complete-guide')} className="mt-4">
                Complete SBA Loan Guide <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
};

export default SBABadCredit;