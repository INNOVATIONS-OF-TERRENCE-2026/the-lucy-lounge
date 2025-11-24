import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'WebSite' | 'Organization' | 'SoftwareApplication';
  data?: any;
}

export const StructuredData = ({ type, data }: StructuredDataProps) => {
  useEffect(() => {
    const getStructuredData = () => {
      const baseUrl = 'https://lucylounge.org';
      
      switch (type) {
        case 'WebSite':
          return {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Lucy AI - Divine Digital Companion',
            url: baseUrl,
            description: 'Lucy AI is a cutting-edge AI assistant with advanced reasoning, multimodal capabilities, and divine intelligence. Beyond GPT, beyond Gemini.',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${baseUrl}/chat?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          };
        
        case 'Organization':
          return {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Lucy AI',
            url: baseUrl,
            logo: `${baseUrl}/lucy-og-image.png`,
            description: 'Engineered by Terrence Milliner Sr., Lucy AI is a premium AI assistant platform with advanced capabilities beyond traditional AI models.',
            founder: {
              '@type': 'Person',
              name: 'Terrence Milliner Sr.'
            }
          };
        
        case 'SoftwareApplication':
          return {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Lucy AI',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            },
            description: 'Divine digital companion with advanced AI reasoning, multimodal intelligence, real-time web search, code execution, and long-term memory.',
            url: baseUrl,
            screenshot: `${baseUrl}/og-features.png`,
            author: {
              '@type': 'Person',
              name: 'Terrence Milliner Sr.'
            },
            featureList: [
              'Advanced chain-of-thought reasoning',
              'Multimodal analysis (images, audio, video, documents)',
              'Real-time web search integration',
              'Code execution sandbox',
              'Long-term memory system',
              'Proactive suggestions'
            ]
          };
        
        default:
          return null;
      }
    };

    const structuredData = data || getStructuredData();
    
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [type, data]);

  return null;
};