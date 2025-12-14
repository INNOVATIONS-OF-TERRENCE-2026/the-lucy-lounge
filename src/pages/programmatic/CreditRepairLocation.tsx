import { useParams, Navigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { FAQSchema } from '@/components/seo/FAQSchema';
import { YMYLDisclaimer } from '@/components/blog/YMYLDisclaimer';
import { creditByState, getRelatedPages } from '@/data/programmaticSEO';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, ArrowRight, Shield, Scale, Building, Phone } from 'lucide-react';

const CreditRepairLocation = () => {
  const { state } = useParams<{ state: string }>();
  
  const pageData = creditByState.find(s => s.slug === state);
  
  if (!pageData) {
    return <Navigate to="/guides/credit-repair-complete-guide" replace />;
  }
  
  const relatedStates = getRelatedPages('location', state || '') as typeof creditByState;
  const baseUrl = 'https://lucylounge.org';
  
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={pageData.metaTitle}
        description={pageData.metaDescription}
        keywords={`credit repair ${pageData.state}, ${pageData.state} debt laws, Lucy AI`}
        canonical={`${baseUrl}/credit-repair/in-${pageData.slug}`}
        image="/og-default.png"
      />
      
      <FAQSchema faqs={pageData.faqs} pageUrl={`${baseUrl}/credit-repair/in-${pageData.slug}`} />
      
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2 flex-wrap">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li>/</li>
            <li><Link to={pageData.pillarLink} className="hover:text-primary">{pageData.pillarText}</Link></li>
            <li>/</li>
            <li className="text-foreground">{pageData.state}</li>
          </ol>
        </nav>
        
        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground flex items-center gap-3">
          <MapPin className="h-10 w-10 text-primary" />
          {pageData.h1}
        </h1>
        
        {/* YMYL Disclaimer */}
        <YMYLDisclaimer type="credit" showEditorialLink />
        
        {/* State Overview */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-500/20">
            <h2 className="text-xl font-bold mb-3">{pageData.state} at a Glance</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Average Credit Score:</span>
                <span className="ml-2 font-semibold">{pageData.averageCreditScore}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Debt SOL (Credit Cards):</span>
                <span className="ml-2 font-semibold">
                  {pageData.stateLaws.find(l => l.law === 'Statute of Limitations')?.detail}
                </span>
              </div>
            </div>
          </div>
        </section>
        
        {/* State-Specific Advice */}
        <section className="prose prose-lg max-w-none mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            {pageData.state} Credit Repair Landscape
          </h2>
          <p className="text-muted-foreground">
            {pageData.stateSpecificAdvice}
          </p>
        </section>
        
        {/* State Laws */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Scale className="h-6 w-6 text-amber-500" />
            {pageData.state} Debt Collection Laws
          </h2>
          <div className="space-y-4">
            {pageData.stateLaws.map((law, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg text-primary">{law.law}</h3>
                <p className="text-muted-foreground">{law.detail}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Local Resources */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Building className="h-6 w-6 text-green-500" />
            {pageData.state} Credit Resources
          </h2>
          <div className="grid gap-4">
            {pageData.localResources.map((resource, index) => (
              <div key={index} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{resource.name}</h3>
                    <p className="text-sm text-primary">{resource.type}</p>
                    <p className="text-sm text-muted-foreground">{resource.focus}</p>
                  </div>
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Lucy AI Section */}
        <section className="mb-10 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border border-primary/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Lucy AI Knows {pageData.state} Laws
          </h2>
          <p className="text-muted-foreground mb-4">
            Lucy AI is trained on {pageData.state}-specific debt collection laws, statute of limitations rules, and wage garnishment protections. Get personalized guidance based on your state's legal framework.
          </p>
          <Link 
            to="/chat" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Get {pageData.state}-Specific Help <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
        
        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">{pageData.state} Credit FAQ</h2>
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
        
        {/* Related States */}
        <section className="border-t pt-10">
          <h2 className="text-xl font-bold mb-4">Credit Repair in Other States</h2>
          
          <div className="mb-6">
            <Link 
              to={pageData.pillarLink}
              className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <span className="text-xs uppercase text-primary font-medium">National Guide</span>
                <p className="font-semibold">{pageData.pillarText}</p>
              </div>
              <ArrowRight className="h-5 w-5 ml-auto text-primary" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {relatedStates.map((s, index) => (
              <Link 
                key={index}
                to={`/credit-repair/in-${s.slug}`}
                className="flex items-center gap-3 p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{s.state}</span>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Trust Footer */}
        <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            State-specific information for educational purposes. Consult a local attorney for legal advice.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default CreditRepairLocation;
