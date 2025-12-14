import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FAQSchema } from '@/components/seo/FAQSchema';

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOFAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs: FAQItem[];
  className?: string;
}

export const SEOFAQSection = ({ 
  title = 'Frequently Asked Questions',
  subtitle,
  faqs,
  className = ''
}: SEOFAQSectionProps) => {
  return (
    <section className={`py-16 px-4 ${className}`}>
      <FAQSchema faqs={faqs} />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="bg-card/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-border/20">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-border/20"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-foreground/80 text-base md:text-lg font-medium py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
