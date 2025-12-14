import { useParams, Navigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { FAQSchema } from '@/components/seo/FAQSchema';
import { YMYLDisclaimer } from '@/components/blog/YMYLDisclaimer';
import { creditPersonas, getRelatedPages } from '@/data/programmaticSEO';
import { Link } from 'react-router-dom';
import { Users, Sparkles, ArrowRight, Shield, CheckCircle, Target, DollarSign } from 'lucide-react';

const CreditRepairPersona = () => {
  const { persona } = useParams<{ persona: string }>();
  
  const pageData = creditPersonas.find(p => p.slug === persona);
  
  if (!pageData) {
    return <Navigate to="/guides/credit-repair-complete-guide" replace />;
  }
  
  const relatedPersonas = getRelatedPages('persona', persona || '') as typeof creditPersonas;
  const baseUrl = 'https://lucylounge.org';
  
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={pageData.metaTitle}
        description={pageData.metaDescription}
        keywords={`credit repair, ${pageData.title.toLowerCase()}, Lucy AI, financial guidance`}
        canonical={`${baseUrl}/credit-repair/for-${pageData.slug}`}
        image="/og-default.png"
      />
      
      <FAQSchema faqs={pageData.faqs} pageUrl={`${baseUrl}/credit-repair/for-${pageData.slug}`} />
      
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2 flex-wrap">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li>/</li>
            <li><Link to={pageData.pillarLink} className="hover:text-primary">{pageData.pillarText}</Link></li>
            <li>/</li>
            <li className="text-foreground">For {pageData.title}</li>
          </ol>
        </nav>
        
        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground flex items-center gap-3">
          <Users className="h-10 w-10 text-primary" />
          {pageData.h1}
        </h1>
        
        {/* YMYL Disclaimer */}
        <YMYLDisclaimer type="credit" showEditorialLink />
        
        {/* Intro */}
        <section className="prose prose-lg max-w-none mb-10">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {pageData.intro}
          </p>
        </section>
        
        {/* Unique Needs Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Unique Challenges for {pageData.title}
          </h2>
          <p className="text-muted-foreground">
            {pageData.uniqueNeeds}
          </p>
        </section>
        
        {/* Specific Advice */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Tailored Credit Strategies
          </h2>
          <ul className="space-y-4">
            {pageData.specificAdvice.map((advice, index) => (
              <li key={index} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-sm">
                  ✓
                </span>
                <span className="text-muted-foreground">{advice}</span>
              </li>
            ))}
          </ul>
        </section>
        
        {/* Funding Pathways */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-amber-500" />
            Funding Pathways for {pageData.title}
          </h2>
          <div className="grid gap-4">
            {pageData.fundingPathways.map((pathway, index) => (
              <div key={index} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <h3 className="font-semibold text-lg">{pathway.name}</h3>
                <p className="text-sm text-muted-foreground">{pathway.requirement}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Lucy AI Help */}
        <section className="mb-10 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border border-primary/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            How Lucy AI Helps {pageData.title}
          </h2>
          <p className="text-muted-foreground mb-4">
            Lucy AI understands the unique financial challenges facing {pageData.title.toLowerCase()}. Our platform provides personalized credit repair strategies, dispute letter templates, and funding pathway recommendations tailored to your situation.
          </p>
          <Link 
            to="/chat" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Start with Lucy <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
        
        {/* FAQ Section */}
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
        
        {/* Internal Links */}
        <section className="border-t pt-10">
          <h2 className="text-xl font-bold mb-4">Related Resources</h2>
          
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
            {relatedPersonas.map((p, index) => (
              <Link 
                key={index}
                to={`/credit-repair/for-${p.slug}`}
                className="flex items-center gap-3 p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs uppercase text-muted-foreground">Related Guide</span>
                  <p className="font-medium">Credit Repair for {p.title}</p>
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
            Information aligned with FCRA, CFPB guidelines, and SBA requirements
          </p>
        </footer>
      </main>
    </div>
  );
};

export default CreditRepairPersona;
