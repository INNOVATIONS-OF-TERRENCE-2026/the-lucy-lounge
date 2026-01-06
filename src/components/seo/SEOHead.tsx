import { useEffect } from 'react';
import { CANONICAL_DOMAIN, getImageUrl, SITE_NAME, SITE_AUTHOR, SITE_TWITTER, SITE_THEME_COLOR } from '@/lib/seoConfig';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  canonical?: string;
}

export const SEOHead = ({
  title = 'Lucy AI - Divine Digital Companion Beyond Intelligence',
  description = 'Lucy AI is your divine digital companion with advanced reasoning, multimodal intelligence, real-time web search, code execution, and long-term memory. Engineered by Terrence Milliner Sr. Try free at TheLucyLounge.com',
  keywords = 'AI assistant, artificial intelligence, chat AI, Lucy AI, conversational AI, smart assistant, AI companion, multimodal AI, Terrence Milliner, advanced reasoning, AI chatbot, digital companion, AI tools, intelligent assistant',
  image = '/lucy-og-image.png',
  url = CANONICAL_DOMAIN,
  type = 'website',
  canonical
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', SITE_AUTHOR);
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow');
    updateMetaTag('theme-color', SITE_THEME_COLOR);
    updateMetaTag('format-detection', 'telephone=no');

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', getImageUrl(image), true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', SITE_NAME, true);
    updateMetaTag('og:locale', 'en_US', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', getImageUrl(image));
    updateMetaTag('twitter:creator', SITE_TWITTER);
    updateMetaTag('twitter:site', SITE_TWITTER);

    // Canonical link
    const canonicalUrl = canonical || url;
    let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.rel = 'canonical';
      document.head.appendChild(linkElement);
    }
    linkElement.href = canonicalUrl;

    // Schema.org structured data for AI application
    const scriptId = 'lucy-ai-schema';
    let schemaScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = scriptId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": SITE_NAME,
      "applicationCategory": "AI Assistant",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "operatingSystem": "Web Browser",
      "description": description,
      "image": getImageUrl(image),
      "url": url,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1250"
      }
    };

    schemaScript.textContent = JSON.stringify(schemaData);
  }, [title, description, keywords, image, url, type, canonical]);

  return null;
};
