import { Link } from 'react-router-dom';
import { SEOHead } from './SEOHead';
import { FAQSchema } from './FAQSchema';
import { HowToSchema } from './HowToSchema';
import { YMYLDisclaimer } from '../blog/YMYLDisclaimer';
import { CheckCircle, AlertTriangle, ArrowRight, Shield, Sparkles, BookOpen, Scale } from 'lucide-react';
import { CANONICAL_DOMAIN } from '@/lib/seoConfig';

interface Step {
  title: string;
  text: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Mistake {
  title: string;
  description: string;
}

interface InternalLink {
  href: string;
  text: string;
  type: 'pillar' | 'related' | 'tool';
}

interface ProgrammaticTemplateProps {
  // Meta
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  canonicalPath: string;
  
  // Content
  intro: string;
  problemExplanation?: string;
  steps: Step[];
  lucyHelp: string;
  mistakes: Mistake[];
  faqs: FAQ[];
  
  // Links
  pillarLink: InternalLink;
  relatedLinks: InternalLink[];
  
  // Optional sections
  additionalContent?: React.ReactNode;
  disclaimerType?: 'credit' | 'sba' | 'funding' | 'general';
  
  // Schema
  showHowToSchema?: boolean;
  howToTime?: string;
}

export const ProgrammaticTemplate = ({
  title,
  metaTitle,
  metaDescription,
  h1,
  canonicalPath,
  intro,
  problemExplanation,
  steps,
  lucyHelp,
  mistakes,
  faqs,
  pillarLink,
  relatedLinks,
  additionalContent,
  disclaimerType = 'credit',
  showHowToSchema = true,
  howToTime = 'PT30M'
}: ProgrammaticTemplateProps) => {
  const baseUrl = CANONICAL_DOMAIN;
  
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        keywords={`${title}, credit repair, Lucy AI, financial guidance`}
        canonical={`${baseUrl}${canonicalPath}`}
        image="/og-default.png"
      />
      
      <FAQSchema faqs={faqs} pageUrl={`${baseUrl}${canonicalPath}`} />
      
      {showHowToSchema && (
        <HowToSchema
          name={h1}
          description={intro}
          steps={steps.map(step => ({ name: step.title, text: step.text }))}
          totalTime={howToTime}
        />
      )}
      
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2 flex-wrap">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li>/</li>
            <li><Link to={pillarLink.href} className="hover:text-primary">{pillarLink.text}</Link></li>
            <li>/</li>
            <li className="text-foreground">{title}</li>
          </ol>
        </nav>
        
        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
          {h1}
        </h1>
        
        {/* YMYL Disclaimer */}
        <YMYLDisclaimer type={disclaimerType} showEditorialLink />
        
        {/* Intro - Unique per page */}
        <section className="prose prose-lg max-w-none mb-10">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {intro}
          </p>
        </section>
        
        {/* Problem Explanation (if provided) */}
        {problemExplanation && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Understanding the Problem
            </h2>
            <div className="prose max-w-none text-muted-foreground whitespace-pre-line">
              {problemExplanation}
            </div>
          </section>
        )}
        
        {/* Step-by-Step Solution */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Step-by-Step Solution
          </h2>
          <ol className="space-y-6">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        
        {/* Lucy AI Help Section */}
        <section className="mb-10 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border border-primary/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            How Lucy AI Helps With {title}
          </h2>
          <p className="text-muted-foreground mb-4">{lucyHelp}</p>
          <Link 
            to="/chat" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Start Using Lucy <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
        
        {/* Common Mistakes */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Common Mistakes to Avoid
          </h2>
          <div className="grid gap-4">
            {mistakes.map((mistake, index) => (
              <div key={index} className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-4">
                <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  {mistake.title}
                </h3>
                <p className="text-muted-foreground text-sm">{mistake.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Additional Content (optional) */}
        {additionalContent}
        
        {/* FAQ Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Scale className="h-6 w-6 text-blue-500" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
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
        
        {/* Internal Linking Section */}
        <section className="border-t pt-10">
          <h2 className="text-xl font-bold mb-4">Related Resources</h2>
          
          {/* Pillar Link */}
          <div className="mb-6">
            <Link 
              to={pillarLink.href}
              className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <span className="text-xs uppercase text-primary font-medium">Complete Guide</span>
                <p className="font-semibold">{pillarLink.text}</p>
              </div>
              <ArrowRight className="h-5 w-5 ml-auto text-primary" />
            </Link>
          </div>
          
          {/* Related Pages */}
          <div className="grid md:grid-cols-2 gap-4">
            {relatedLinks.map((link, index) => (
              <Link 
                key={index}
                to={link.href}
                className="flex items-center gap-3 p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    {link.type === 'related' ? 'Related Article' : 'Lucy Tool'}
                  </span>
                  <p className="font-medium">{link.text}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
        
        {/* Trust Signals Footer */}
        <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            Information aligned with FCRA, CFPB guidelines, and SBA requirements
          </p>
          <p className="mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </footer>
      </main>
    </div>
  );
};
