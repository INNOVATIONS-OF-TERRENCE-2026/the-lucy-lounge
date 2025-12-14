import { SEOHead } from '@/components/seo/SEOHead';
import { FAQSchema } from '@/components/seo/FAQSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Features as FeaturesSection } from '@/components/landing/Features';
import { SEOFAQSection } from '@/components/blog/SEOFAQSection';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LucyAvatar } from '@/components/avatar/LucyAvatar';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';

const Features = () => {
  const navigate = useNavigate();

  const detailedFeatures = [
    {
      category: 'AI Capabilities',
      items: [
        { name: 'Advanced Reasoning Engine', description: 'Multi-step chain-of-thought analysis with transparent reasoning process' },
        { name: 'Vision & Multimodal', description: 'Analyze images, videos, PDFs, and documents with AI' },
        { name: 'Long-term Memory', description: 'Remembers your preferences across all sessions' },
        { name: 'Code Execution', description: 'Run Python and JavaScript in secure sandbox' },
        { name: 'Web Search', description: 'Real-time information with source citations' },
        { name: 'Image Generation', description: 'Create AI images from text descriptions' }
      ]
    },
    {
      category: 'User Experience',
      items: [
        { name: 'Real-time Streaming', description: 'Token-by-token response generation' },
        { name: 'Voice Capabilities', description: 'Speech-to-text and text-to-speech' },
        { name: 'Proactive Suggestions', description: 'Context-aware follow-up recommendations' },
        { name: 'Animated Avatar', description: 'Lucy avatar with emotional expressions' },
        { name: 'Smart Backgrounds', description: 'Dynamic 4K HDR nature scenes' },
        { name: 'Dark/Light Modes', description: 'Beautiful themes for any preference' }
      ]
    },
    {
      category: 'Collaboration',
      items: [
        { name: 'Multi-user Rooms', description: 'Real-time collaborative conversations' },
        { name: 'Share Conversations', description: 'Create secure shareable links' },
        { name: 'Team Workspaces', description: 'Organize and collaborate with teams' },
        { name: 'Export Options', description: 'TXT, MD, JSON export formats' }
      ]
    },
    {
      category: 'Developer Tools',
      items: [
        { name: 'Full-text Search', description: 'Search across all conversations' },
        { name: 'Conversation Folders', description: 'Organize with tags and folders' },
        { name: 'Analytics Dashboard', description: 'Track usage and performance' },
        { name: 'API Access', description: 'Integrate Lucy into your workflows' }
      ]
    }
  ];

  const featuresFAQs = [
    {
      question: "What AI capabilities does Lucy AI have?",
      answer: "Lucy AI includes advanced reasoning with chain-of-thought analysis, multimodal vision for analyzing images/videos/PDFs, long-term memory across sessions, secure code execution in Python and JavaScript, real-time web search with citations, AI image generation, and voice conversation capabilities."
    },
    {
      question: "Can Lucy AI analyze images and documents?",
      answer: "Yes, Lucy AI features cutting-edge multimodal capabilities. It can analyze images, photographs, videos, PDF documents, data tables, and charts. Simply upload any file and Lucy will provide detailed analysis and insights."
    },
    {
      question: "Does Lucy AI remember my preferences?",
      answer: "Yes, Lucy AI includes a sophisticated long-term memory system that remembers your preferences, communication style, and conversation history across all sessions. You can view and manage your memories in the settings panel."
    },
    {
      question: "Can I run code with Lucy AI?",
      answer: "Absolutely! Lucy AI can execute Python and JavaScript code in a secure sandbox environment. This makes it perfect for developers, data analysts, and anyone who needs to test code snippets quickly."
    },
    {
      question: "Does Lucy AI have voice capabilities?",
      answer: "Yes, Lucy AI supports both speech-to-text and text-to-speech. You can speak to Lucy using your microphone and receive spoken responses, enabling natural voice conversations."
    },
    {
      question: "How does Lucy AI compare to ChatGPT?",
      answer: "Lucy AI combines the best capabilities of multiple AI models into one platform. Unlike ChatGPT, Lucy offers built-in code execution, long-term memory, multimodal vision, web search, image generation, and voice capabilities all in one seamless experience."
    }
  ];

  return (
    <>
      <SEOHead 
        title="Features - Lucy AI | Advanced AI Capabilities & Tools"
        description="Explore Lucy AI's powerful features: advanced reasoning engine, multimodal vision, code execution, web search, long-term memory, and creative tools. Best AI chat platform 2025."
        keywords="AI features, multimodal AI, AI vision, AI reasoning, code execution AI, AI memory system, AI web search, best AI tools 2025"
        image="/og-features.png"
        url="https://lucylounge.org/features"
        canonical="https://lucylounge.org/features"
      />
      <FAQSchema faqs={featuresFAQs} />
      <BreadcrumbSchema 
        items={[
          { name: 'Home', url: 'https://lucylounge.org' },
          { name: 'Features', url: 'https://lucylounge.org/features' }
        ]}
      />
      
      <div className="min-h-screen relative overflow-hidden">
        <CosmicBackground />

        <div className="relative z-10">
          {/* Header */}
          <div className="container mx-auto px-4 py-8">
            <Button
              variant="ghost"
              className="text-foreground hover:bg-muted/20 border border-border/30"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Hero Section */}
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="flex justify-center mb-6">
              <LucyAvatar size="lg" state="focused" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-shadow-strong">
              Powerful AI Features
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 text-shadow-soft">
              Everything you need in a modern AI assistant, powered by cutting-edge technology
            </p>
          </div>

          {/* Features Grid */}
          <FeaturesSection />

          {/* Detailed Feature Comparison */}
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center text-shadow-strong">
                Complete Feature List
              </h2>

              <div className="space-y-12">
                {detailedFeatures.map((category, index) => (
                  <div key={index} className="glass-card-enhanced p-8">
                    <h3 className="text-2xl font-bold text-white mb-6">{category.category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                          <div>
                            <div className="font-semibold text-white">{item.name}</div>
                            <div className="text-sm text-white/70">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/95 font-semibold text-lg px-8 py-6"
                  onClick={() => navigate('/auth')}
                >
                  Try Lucy AI Free
                </Button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <SEOFAQSection 
            title="Frequently Asked Questions About Lucy AI Features"
            faqs={featuresFAQs}
          />

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Features;
