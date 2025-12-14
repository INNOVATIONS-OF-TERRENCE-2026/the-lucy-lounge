import { useParams, Navigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { FAQSchema } from '@/components/seo/FAQSchema';
import { YMYLDisclaimer } from '@/components/blog/YMYLDisclaimer';
import { comparisonPages, getRelatedPages } from '@/data/programmaticSEO';
import { Link } from 'react-router-dom';
import { GitCompare, Sparkles, ArrowRight, Shield, CheckCircle, XCircle, Target, Clock, DollarSign } from 'lucide-react';

const ComparisonPage = () => {
  const { comparison } = useParams<{ comparison: string }>();
  
  const pageData = comparisonPages.find(c => c.slug === comparison);
  
  if (!pageData) {
    return <Navigate to="/guides/credit-repair-complete-guide" replace />;
  }
  
  const relatedComparisons = getRelatedPages('comparison', comparison || '') as typeof comparisonPages;
  const baseUrl = 'https://lucylounge.org';
  
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={pageData.metaTitle}
        description={pageData.metaDescription}
        keywords={`${pageData.optionA.name} vs ${pageData.optionB.name}, comparison, Lucy AI`}
        canonical={`${baseUrl}/compare/${pageData.slug}`}
        image="/og-default.png"
      />
      
      <FAQSchema faqs={pageData.faqs} pageUrl={`${baseUrl}/compare/${pageData.slug}`} />
      
      <main className="container max-w-5xl mx-auto px-4 py-12">
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
          <GitCompare className="h-10 w-10 text-primary" />
          {pageData.h1}
        </h1>
        
        {/* YMYL Disclaimer */}
        <YMYLDisclaimer type="credit" showEditorialLink />
        
        {/* Quick Comparison Table */}
        <section className="mb-10 overflow-x-auto">
          <table className="w-full border rounded-lg overflow-hidden">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-left font-semibold">Factor</th>
                <th className="p-4 text-left font-semibold text-blue-600 dark:text-blue-400">{pageData.optionA.name}</th>
                <th className="p-4 text-left font-semibold text-purple-600 dark:text-purple-400">{pageData.optionB.name}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-4 font-medium">Best For</td>
                <td className="p-4 text-sm text-muted-foreground">{pageData.optionA.bestFor}</td>
                <td className="p-4 text-sm text-muted-foreground">{pageData.optionB.bestFor}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Timeline</td>
                <td className="p-4 text-sm">{pageData.optionA.timeline}</td>
                <td className="p-4 text-sm">{pageData.optionB.timeline}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-medium flex items-center gap-2"><Target className="h-4 w-4" /> Credit Impact</td>
                <td className="p-4 text-sm">{pageData.optionA.creditImpact}</td>
                <td className="p-4 text-sm">{pageData.optionB.creditImpact}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-medium flex items-center gap-2"><DollarSign className="h-4 w-4" /> Cost</td>
                <td className="p-4 text-sm">{pageData.optionA.cost}</td>
                <td className="p-4 text-sm">{pageData.optionB.cost}</td>
              </tr>
            </tbody>
          </table>
        </section>
        
        {/* Detailed Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Option A */}
          <div className="border rounded-xl p-6 border-blue-500/30 bg-blue-500/5">
            <h2 className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-400">
              {pageData.optionA.name}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">{pageData.optionA.description}</p>
            
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" /> Pros
            </h3>
            <ul className="space-y-2 mb-6">
              {pageData.optionA.pros.map((pro, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span className="text-muted-foreground">{pro}</span>
                </li>
              ))}
            </ul>
            
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" /> Cons
            </h3>
            <ul className="space-y-2">
              {pageData.optionA.cons.map((con, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-red-500">✗</span>
                  <span className="text-muted-foreground">{con}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Option B */}
          <div className="border rounded-xl p-6 border-purple-500/30 bg-purple-500/5">
            <h2 className="text-2xl font-bold mb-2 text-purple-600 dark:text-purple-400">
              {pageData.optionB.name}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">{pageData.optionB.description}</p>
            
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" /> Pros
            </h3>
            <ul className="space-y-2 mb-6">
              {pageData.optionB.pros.map((pro, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span className="text-muted-foreground">{pro}</span>
                </li>
              ))}
            </ul>
            
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" /> Cons
            </h3>
            <ul className="space-y-2">
              {pageData.optionB.cons.map((con, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-red-500">✗</span>
                  <span className="text-muted-foreground">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Verdict */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-green-500" />
              The Verdict
            </h2>
            <p className="text-muted-foreground">{pageData.verdict}</p>
          </div>
        </section>
        
        {/* Lucy AI Section */}
        <section className="mb-10 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border border-primary/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Let Lucy AI Help You Decide
          </h2>
          <p className="text-muted-foreground mb-4">
            Not sure which option is right for your situation? Lucy AI can analyze your specific circumstances—credit score, debt amounts, financial goals—and recommend the best approach for you.
          </p>
          <Link 
            to="/chat" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Get Personalized Advice <ArrowRight className="h-4 w-4" />
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
        
        {/* Related Comparisons */}
        <section className="border-t pt-10">
          <h2 className="text-xl font-bold mb-4">More Comparisons</h2>
          
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
            {relatedComparisons.map((c, index) => (
              <Link 
                key={index}
                to={`/compare/${c.slug}`}
                className="flex items-center gap-3 p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <GitCompare className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{c.title}</p>
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
            Comparison for educational purposes. Individual results vary based on circumstances.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default ComparisonPage;
