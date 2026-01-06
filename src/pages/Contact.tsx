import { useState } from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, MessageSquare, Clock, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from '@/components/cosmic/CosmicBackground';
import { toast } from 'sonner';
import { CANONICAL_DOMAIN } from '@/lib/seoConfig';

const Contact = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Message sent! We\'ll respond within 24-48 hours.');
  };

  const contactReasons = [
    { icon: MessageSquare, title: 'General Inquiries', description: 'Questions about Lucy AI features and capabilities' },
    { icon: Mail, title: 'Content Corrections', description: 'Report inaccuracies or outdated information' },
    { icon: Clock, title: 'Response Time', description: 'We aim to respond within 24-48 business hours' }
  ];

  return (
    <>
      <SEOHead 
        title="Contact Us | Lucy AI Support & Inquiries"
        description="Get in touch with the Lucy AI team. Contact us for support, content corrections, partnership inquiries, or general questions."
        keywords="contact Lucy AI, support, help, inquiries, business contact"
        image="/og-default.png"
        url={`${CANONICAL_DOMAIN}/contact`}
        canonical={`${CANONICAL_DOMAIN}/contact`}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' }
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

          {/* Hero */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Contact Us
              </h1>
              <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
                Have a question or feedback? We'd love to hear from you.
              </p>
            </div>
          </section>

          {/* Contact Info Cards */}
          <section className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {contactReasons.map((item, index) => (
                  <Card key={index} className="glass-card p-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card-enhanced p-8">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Message Sent!</h2>
                    <p className="text-foreground/80 mb-6">
                      Thank you for reaching out. We'll respond within 24-48 business hours.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: '', email: '', subject: '', message: '' });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="bg-background/50 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-button text-white hover:shadow-glow-magenta transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </section>

          {/* Additional Info */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-muted-foreground text-sm">
                For urgent matters or partnership inquiries, please include "URGENT" or "PARTNERSHIP" 
                in your subject line for faster response.
              </p>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Contact;
