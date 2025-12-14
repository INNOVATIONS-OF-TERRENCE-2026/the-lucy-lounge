import { useEffect } from 'react';

interface Review {
  author: string;
  datePublished: string;
  reviewBody: string;
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
}

interface ReviewSchemaProps {
  itemName: string;
  itemType?: 'Product' | 'Service' | 'SoftwareApplication' | 'Organization';
  reviews: Review[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export const ReviewSchema = ({
  itemName,
  itemType = 'SoftwareApplication',
  reviews,
  aggregateRating
}: ReviewSchemaProps) => {
  useEffect(() => {
    const reviewSchemas = reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author
      },
      datePublished: review.datePublished,
      reviewBody: review.reviewBody,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.ratingValue,
        bestRating: review.bestRating || 5,
        worstRating: review.worstRating || 1
      }
    }));

    const schemaData: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': itemType,
      name: itemName,
      review: reviewSchemas,
      ...(aggregateRating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: aggregateRating.ratingValue,
          reviewCount: aggregateRating.reviewCount,
          bestRating: aggregateRating.bestRating || 5,
          worstRating: aggregateRating.worstRating || 1
        }
      })
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'review-schema';
    script.textContent = JSON.stringify(schemaData);
    
    const existing = document.getElementById('review-schema');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptEl = document.getElementById('review-schema');
      if (scriptEl) {
        document.head.removeChild(scriptEl);
      }
    };
  }, [itemName, itemType, reviews, aggregateRating]);

  return null;
};
