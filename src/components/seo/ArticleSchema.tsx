import { useEffect } from 'react';

interface ArticleSchemaProps {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  url: string;
}

export const ArticleSchema = ({
  title,
  description,
  image,
  datePublished,
  dateModified,
  authorName = 'Lucy AI Team',
  url
}: ArticleSchemaProps) => {
  useEffect(() => {
    const baseUrl = 'https://lucylounge.org';
    
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: description,
      image: image.startsWith('http') ? image : `${baseUrl}${image}`,
      datePublished: datePublished,
      dateModified: dateModified || datePublished,
      author: {
        '@type': 'Person',
        name: authorName,
        url: `${baseUrl}/about`
      },
      publisher: {
        '@type': 'Organization',
        name: 'Lucy AI',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/lucy-og-image.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'article-schema';
    script.textContent = JSON.stringify(schemaData);
    
    const existing = document.getElementById('article-schema');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptEl = document.getElementById('article-schema');
      if (scriptEl) {
        document.head.removeChild(scriptEl);
      }
    };
  }, [title, description, image, datePublished, dateModified, authorName, url]);

  return null;
};
