import { useEffect } from 'react';
import { CANONICAL_DOMAIN } from '@/lib/seoConfig';

interface PersonSchemaProps {
  name: string;
  jobTitle: string;
  description: string;
  image?: string;
  url: string;
  sameAs?: string[];
  worksFor?: {
    name: string;
    url: string;
  };
  alumniOf?: string[];
  knowsAbout?: string[];
}

export const PersonSchema = ({
  name,
  jobTitle,
  description,
  image,
  url,
  sameAs = [],
  worksFor,
  alumniOf = [],
  knowsAbout = []
}: PersonSchemaProps) => {
  useEffect(() => {
    const baseUrl = CANONICAL_DOMAIN;
    
    const schemaData: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name,
      jobTitle,
      description,
      url: url.startsWith('http') ? url : `${baseUrl}${url}`,
      ...(image && { image: image.startsWith('http') ? image : `${baseUrl}${image}` }),
      ...(sameAs.length > 0 && { sameAs }),
      ...(worksFor && {
        worksFor: {
          '@type': 'Organization',
          name: worksFor.name,
          url: worksFor.url
        }
      }),
      ...(alumniOf.length > 0 && {
        alumniOf: alumniOf.map(school => ({
          '@type': 'EducationalOrganization',
          name: school
        }))
      }),
      ...(knowsAbout.length > 0 && { knowsAbout })
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'person-schema';
    script.textContent = JSON.stringify(schemaData);
    
    const existing = document.getElementById('person-schema');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptEl = document.getElementById('person-schema');
      if (scriptEl) {
        document.head.removeChild(scriptEl);
      }
    };
  }, [name, jobTitle, description, image, url, sameAs, worksFor, alumniOf, knowsAbout]);

  return null;
};
