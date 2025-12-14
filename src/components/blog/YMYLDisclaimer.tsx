import { AlertTriangle, Shield, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface YMYLDisclaimerProps {
  type?: 'credit' | 'sba' | 'funding' | 'general';
  showEditorialLink?: boolean;
}

export const YMYLDisclaimer = ({ type = 'general', showEditorialLink = true }: YMYLDisclaimerProps) => {
  const disclaimerContent = {
    credit: {
      title: 'Financial Information Disclaimer',
      text: 'This content is for educational and informational purposes only and does not constitute financial, legal, or credit repair advice. Credit repair results vary based on individual circumstances. Always consult with a qualified financial professional or credit counselor before making decisions about your credit. The strategies discussed may not be suitable for all situations.',
      regulation: 'Information about credit reporting is based on the Fair Credit Reporting Act (FCRA) and Metro-2 credit reporting standards as of the publication date.'
    },
    sba: {
      title: 'SBA Loan Information Disclaimer',
      text: 'This content is for educational and informational purposes only and does not constitute financial or legal advice. SBA loan eligibility, terms, and requirements are determined by individual lenders and the U.S. Small Business Administration. Loan approval is not guaranteed. Always consult with an SBA-approved lender or financial advisor for guidance specific to your situation.',
      regulation: 'SBA program information is based on current U.S. Small Business Administration guidelines as of the publication date. Terms and requirements may change.'
    },
    funding: {
      title: 'Business Funding Disclaimer',
      text: 'This content is for educational and informational purposes only and does not constitute financial, legal, or investment advice. Grant availability, eligibility requirements, and funding terms vary by program and change frequently. Always verify current information directly with funding organizations before applying.',
      regulation: 'Grant and funding program details are accurate as of the publication date. We recommend confirming current availability and requirements with the issuing organization.'
    },
    general: {
      title: 'Disclaimer',
      text: 'This content is for educational and informational purposes only. Individual results may vary. Always consult with qualified professionals before making financial decisions.',
      regulation: ''
    }
  };

  const content = disclaimerContent[type];

  return (
    <div className="my-8 rounded-lg border border-amber-500/30 bg-amber-500/5 p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <h4 className="font-semibold text-foreground">{content.title}</h4>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {content.text}
      </p>
      
      {content.regulation && (
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">
          {content.regulation}
        </p>
      )}
      
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-amber-500/20">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Fact-checked content</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileCheck className="w-4 h-4" />
          <span>Expert reviewed</span>
        </div>
        {showEditorialLink && (
          <Link 
            to="/editorial-standards" 
            className="text-xs text-primary hover:underline ml-auto"
          >
            View our editorial standards →
          </Link>
        )}
      </div>
    </div>
  );
};
