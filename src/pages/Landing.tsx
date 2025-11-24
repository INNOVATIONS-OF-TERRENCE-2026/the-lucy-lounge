import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/seo/SEOHead';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import { QuickActionLauncher } from '@/components/daily/QuickActionLauncher';
import { UsageStreak } from '@/components/daily/UsageStreak';
import { ParallaxEnvironment } from '@/components/effects/ParallaxEnvironment';
import { useAmbientIntelligence } from '@/hooks/useAmbientIntelligence';

const Landing = () => {
  const navigate = useNavigate();
  const { themeMode } = useAmbientIntelligence();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/chat');
      }
    });
  }, [navigate]);

  return (
    <>
      <SEOHead 
        title="Lucy AI - Beyond Intelligence | Advanced AI Assistant"
        description="Experience the future of AI with Lucy - featuring advanced reasoning, vision, memory, code execution, and real-time web search. Try free today!"
        keywords="AI assistant, artificial intelligence, chat AI, Lucy AI, GPT-5, Gemini, multimodal AI, code execution, image generation"
        canonical="https://lucy-ai.app"
      />
      
      <ParallaxEnvironment mode={themeMode} intensity={0.5}>
        <div className="min-h-screen relative">
          <Hero />
          
          {/* Quick Actions Section */}
          <section className="relative z-10 py-12 px-4">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
              <QuickActionLauncher />
              <UsageStreak />
            </div>
          </section>
          
          <Features />
          <Pricing />
          <FAQ />
          <Footer />
        </div>
      </ParallaxEnvironment>
    </>
  );
};

export default Landing;
