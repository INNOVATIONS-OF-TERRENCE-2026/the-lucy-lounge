import { useEffect } from 'react';

interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration format e.g., "PT30M" for 30 minutes
  estimatedCost?: {
    currency: string;
    value: string;
  };
}

export const HowToSchema = ({
  name,
  description,
  steps,
  totalTime,
  estimatedCost
}: HowToSchemaProps) => {
  useEffect(() => {
    const baseUrl = 'https://lucylounge.org';
    
    const schemaData: any = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name,
      description,
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        ...(step.url && { url: step.url.startsWith('http') ? step.url : `${baseUrl}${step.url}` }),
        ...(step.image && { image: step.image.startsWith('http') ? step.image : `${baseUrl}${step.image}` })
      }))
    };

    if (totalTime) {
      schemaData.totalTime = totalTime;
    }

    if (estimatedCost) {
      schemaData.estimatedCost = {
        '@type': 'MonetaryAmount',
        currency: estimatedCost.currency,
        value: estimatedCost.value
      };
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'howto-schema';
    script.textContent = JSON.stringify(schemaData);
    
    const existing = document.getElementById('howto-schema');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptEl = document.getElementById('howto-schema');
      if (scriptEl) {
        document.head.removeChild(scriptEl);
      }
    };
  }, [name, description, steps, totalTime, estimatedCost]);

  return null;
};
