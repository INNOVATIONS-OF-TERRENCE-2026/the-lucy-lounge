import { useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  pageUrl?: string;
}

export const FAQSchema = ({ faqs, pageUrl }: FAQSchemaProps) => {
  useEffect(() => {
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-schema';
    script.textContent = JSON.stringify(schemaData);
    
    // Remove existing FAQ schema if present
    const existing = document.getElementById('faq-schema');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptEl = document.getElementById('faq-schema');
      if (scriptEl) {
        document.head.removeChild(scriptEl);
      }
    };
  }, [faqs, pageUrl]);

  return null;
};
