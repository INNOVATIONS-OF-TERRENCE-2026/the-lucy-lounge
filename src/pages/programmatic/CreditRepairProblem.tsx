import { useParams, Navigate } from 'react-router-dom';
import { ProgrammaticTemplate } from '@/components/seo/ProgrammaticTemplate';
import { creditProblems, getRelatedPages } from '@/data/programmaticSEO';

const CreditRepairProblem = () => {
  const { problem } = useParams<{ problem: string }>();
  
  const pageData = creditProblems.find(p => p.slug === problem);
  
  if (!pageData) {
    return <Navigate to="/guides/credit-repair-complete-guide" replace />;
  }
  
  const relatedProblems = getRelatedPages('problem', problem || '') as typeof creditProblems;
  
  const relatedLinks = [
    ...relatedProblems.map(p => ({
      href: `/credit-repair/how-to-fix-${p.slug}`,
      text: `How to Fix ${p.title}`,
      type: 'related' as const
    })),
    {
      href: '/chat',
      text: 'Lucy Credit Repair Assistant',
      type: 'related' as const
    }
  ];
  
  return (
    <ProgrammaticTemplate
      title={pageData.title}
      metaTitle={pageData.metaTitle}
      metaDescription={pageData.metaDescription}
      h1={pageData.h1}
      canonicalPath={`/credit-repair/how-to-fix-${pageData.slug}`}
      intro={pageData.intro}
      problemExplanation={pageData.problemExplanation}
      steps={pageData.steps}
      lucyHelp={pageData.lucyHelp}
      mistakes={pageData.mistakes}
      faqs={pageData.faqs}
      pillarLink={{
        href: pageData.pillarLink,
        text: pageData.pillarText,
        type: 'pillar'
      }}
      relatedLinks={relatedLinks}
      disclaimerType="credit"
      showHowToSchema={true}
      howToTime={pageData.recoveryTime?.includes('day') ? 'P30D' : 'P90D'}
      additionalContent={
        pageData.fcraRelevant && (
          <section className="mb-10 p-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <h2 className="text-xl font-bold mb-3 text-blue-600 dark:text-blue-400">
              Your Legal Rights Under FCRA
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Right to dispute inaccurate information (Section 611)</li>
              <li>• Credit bureaus must investigate within 30 days</li>
              <li>• Unverified items must be removed</li>
              <li>• You can sue for FCRA violations and recover damages</li>
            </ul>
          </section>
        )
      }
    />
  );
};

export default CreditRepairProblem;
