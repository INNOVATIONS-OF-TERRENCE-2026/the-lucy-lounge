import { useParams, Navigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { FAQSchema } from '@/components/seo/FAQSchema';
import { YMYLDisclaimer } from '@/components/blog/YMYLDisclaimer';
import { sbaScenarios, getRelatedPages } from '@/data/programmaticSEO';
import { Link } from 'react-router-dom';
import { Briefcase, Sparkles, ArrowRight, Shield, Target, CheckCircle, CreditCard } from 'lucide-react';

const SBAFundingScenario = () => {
  const { scenario } = useParams<{ scenario: string }>();
  
  const pageData = sbaScenarios.find(s => s.slug === scenario);
  
  if (!pageData) {
    return <Navigate to="/guides/sba-loan-complete-guide" replace />;
  }
  
  const relatedScenarios = getRelatedPages('sba', scenario || '') as typeof sbaScenarios;
  const baseUrl = 'https://lucylounge.org';
  
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={pageData.metaTitle}
        description={pageData.metaDescription}
        keywords={`SBA loans, ${pageData.title.toLowerCase()}, small business funding, Lucy AI`}
        canonical={`${baseUrl}/sba-funding/${pageData.slug}`}
        image="/og-default.png"
      />
      
      <FAQSchema faqs={pageData.faqs} pageUrl={`${baseUrl}/sba-funding/${pageData.slug}`} />
      
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2 flex-wrap">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li>/</li>
            <li><Link to={pageData.pillarLink} className="hover:text-primary">{pageData.pillarText}</Link></li>
            <li>/</li>
            <li className="text-foreground">{pageData.title}</li>
          </ol>
        </nav>
        
        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground flex items-center gap-3">
          <Briefcase className="h-10 w-10 text-primary" />
          {pageData.h1}
        </h1>
        
        {/* YMYL Disclaimer */}
        <YMYLDisclaimer type="sba" showEditorialLink />
        
        {/* Credit Context Alert */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <CreditCard className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-bold text-lg mb-2">Credit Score Context</h2>
                <p className="text-muted-foreground">{pageData.creditContext}</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Intro */}
        <section className="prose prose-lg max-w-none mb-10">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {pageData.intro}
          </p>
        </section>
        
        {/* Strategies */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Strategies for Success
          </h2>
          <div className="space-y-6">
            {pageData.strategies.map((strategy, index) => (
              <div key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{strategy.title}</h3>
                  <p className="text-muted-foreground">{strategy.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Credit Requirements Table */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Program Requirements
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg overflow-hidden">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">Program</th>
                  <th className="text-left p-4 font-semibold">Credit Score</th>
                  <th className="text-left p-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {pageData.minimumRequirements.map((req, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4 font-medium">{req.program}</td>
                    <td className="p-4 text-primary">{req.credit}</td>
                    <td className="p-4 text-muted-foreground text-sm">{req.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        
        {/* Lucy AI Section */}
        <section className="mb-10 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border border-primary/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            How Lucy AI Helps With {pageData.title}
          </h2>
          <p className="text-muted-foreground mb-4">
            Lucy AI analyzes your credit profile, business financials, and goals to recommend the best SBA loan programs for your situation. Get personalized guidance on application preparation, lender matching, and credit improvement strategies.
          </p>
          <Link 
            to="/chat" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Get SBA Loan Guidance <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
        
        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {pageData.faqs.map((faq, index) => (
              <details key={index} className="group border rounded-lg">
                <summary className="cursor-pointer p-4 font-medium flex items-center justify-between">
                  {faq.question}
                  <span className="text-primary transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="px-4 pb-4 text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
        
        {/* Related Scenarios */}
        <section className="border-t pt-10">
          <h2 className="text-xl font-bold mb-4">Related SBA Scenarios</h2>
          
          <div className="mb-6">
            <Link 
              to={pageData.pillarLink}
              className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <span className="text-xs uppercase text-primary font-medium">Complete Guide</span>
                <p className="font-semibold">{pageData.pillarText}</p>
              </div>
              <ArrowRight className="h-5 w-5 ml-auto text-primary" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {relatedScenarios.map((s, index) => (
              <Link 
                key={index}
                to={`/sba-funding/${s.slug}`}
                className="flex items-center gap-3 p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs uppercase text-muted-foreground">Related Guide</span>
                  <p className="font-medium">{s.title}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
        
        {/* Trust Footer */}
        <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            SBA program information is current as of 2024. Requirements may vary by lender.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default SBAFundingScenario;
