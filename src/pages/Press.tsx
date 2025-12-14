import { SEOHead } from '@/components/seo/SEOHead';
import { PersonSchema } from '@/components/seo/PersonSchema';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  ExternalLink, 
  Quote,
  Mic,
  FileText,
  Image as ImageIcon,
  Users,
  Lightbulb,
  TrendingUp,
  Award
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Press = () => {
  const navigate = useNavigate();

  const storyAngles = [
    {
      title: "AI Credit Repair Revolution",
      hook: "How AI is democratizing credit repair formerly reserved for the wealthy",
      outlets: ["TechCrunch", "Wired", "The Verge"],
      icon: TrendingUp
    },
    {
      title: "Black Engineer Builds AI for Minorities",
      hook: "Terrence Milliner's mission to close the funding gap for underrepresented entrepreneurs",
      outlets: ["Black Enterprise", "Essence", "Blavity"],
      icon: Users
    },
    {
      title: "Solo Developer vs Credit Bureaus",
      hook: "David vs Goliath: One engineer's quest to decode Metro-2 credit reporting",
      outlets: ["Indie Hackers", "Hacker News", "Product Hunt"],
      icon: Lightbulb
    },
    {
      title: "The $0 Marketing AI Startup",
      hook: "How Lucy AI achieved growth through SEO and organic authority without paid ads",
      outlets: ["Forbes", "Fast Company", "Inc."],
      icon: Award
    }
  ];

  const companyFacts = [
    { label: "Founded", value: "2024" },
    { label: "Headquarters", value: "Dallas, Texas" },
    { label: "Founder", value: "Terrence Milliner Sr." },
    { label: "Category", value: "AI-Powered Financial Technology" },
    { label: "Focus Areas", value: "Credit Repair, SBA Loans, Business Funding" },
    { label: "Target Audience", value: "Small Business Owners, Entrepreneurs" }
  ];

  const expertQuotes = [
    {
      topic: "On AI and Credit Repair",
      quote: "The most effective credit repair strategy isn't disputing—it's understanding how bureaus calculate scores. Metro-2, the universal credit reporting format, has specific fields that disproportionately impact scores. AI can decode this complexity in seconds."
    },
    {
      topic: "On the Funding Gap",
      quote: "Black women-owned businesses receive less than 1% of venture capital funding. The knowledge gap in credit building and SBA loans costs minority entrepreneurs millions. That's why I built Lucy AI—to democratize this expertise."
    },
    {
      topic: "On Business Credit",
      quote: "Most entrepreneurs don't realize you can build a business credit profile in 90 days using Net-30 vendors. The playbook exists—it's just been gatekept by expensive consultants until now."
    }
  ];

  const podcastTopics = [
    "How AI is leveling the playing field for minority entrepreneurs",
    "The credit-building strategies that help small businesses secure SBA loans",
    "Why Metro-2 compliance matters more than credit disputes",
    "Building a solo AI startup with zero venture funding",
    "The future of AI in personal and business finance"
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Press & Media Kit | Lucy AI"
        description="Media resources, founder bio, company facts, and story angles for journalists and podcast hosts covering Lucy AI."
        url="https://lucylounge.org/press"
      />
      <PersonSchema 
        name="Terrence Milliner Sr."
        jobTitle="Software Engineer & AI Architect"
        description="Founder of Lucy AI, specializing in AI-powered credit repair and business funding solutions for entrepreneurs."
        url="/about/terrence-milliner"
        worksFor={{ name: "Lucy AI", url: "https://lucylounge.org" }}
        knowsAbout={["Artificial Intelligence", "Credit Repair", "SBA Loans", "Business Credit", "Software Engineering"]}
      />

      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Link to="/" className="text-xl font-bold text-primary">Lucy AI</Link>
          <Button asChild variant="outline" className="gap-2">
            <a href="mailto:press@lucylounge.org">
              <Mail className="w-4 h-4" />
              Contact Press
            </a>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Badge className="mb-4">Media Resources</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Press & Media Kit</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything journalists, podcasters, and content creators need to cover Lucy AI and founder Terrence Milliner Sr.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Download Full Press Kit
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href="mailto:press@lucylounge.org">
                <Mail className="w-4 h-4" />
                Media Inquiries
              </a>
            </Button>
          </div>
        </section>

        {/* Founder Bio Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Founder Bio
          </h2>
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-4xl font-bold text-primary-foreground shrink-0 mx-auto md:mx-0">
                  TM
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Terrence Milliner Sr.</h3>
                  <p className="text-primary font-medium mb-4">Software Engineer & AI Architect</p>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-muted-foreground mb-4">
                      Terrence Milliner Sr. is a Software Engineer and AI Architect who built Lucy AI to democratize credit expertise and business funding knowledge. With a background in full-stack development and a passion for financial literacy, Terrence created Lucy after watching family members and community members struggle to access the same credit repair and business funding knowledge that wealthy entrepreneurs take for granted.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Based in Dallas, Texas, Terrence combines deep technical expertise in AI systems with practical knowledge of Metro-2 credit reporting standards, SBA loan processes, and business credit building strategies. His work focuses on making complex financial systems accessible to underserved entrepreneurs.
                    </p>
                    <p className="text-muted-foreground">
                      Terrence is available for interviews, podcast appearances, and expert commentary on AI in finance, credit repair technology, small business funding, and entrepreneurship in underrepresented communities.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-6">
                    <Badge variant="secondary">AI/ML</Badge>
                    <Badge variant="secondary">Credit Repair</Badge>
                    <Badge variant="secondary">SBA Loans</Badge>
                    <Badge variant="secondary">Business Credit</Badge>
                    <Badge variant="secondary">Fintech</Badge>
                  </div>
                  <div className="mt-6">
                    <Button asChild variant="outline" size="sm" className="gap-2">
                      <Link to="/about/terrence-milliner">
                        <ExternalLink className="w-4 h-4" />
                        Full Author Page
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Company Facts */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Company Facts
          </h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyFacts.map((fact, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <p className="text-sm text-muted-foreground">{fact.label}</p>
                    <p className="font-semibold">{fact.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-3">About Lucy AI</h4>
                <p className="text-muted-foreground">
                  Lucy AI is an AI-powered assistant designed to help small business owners and entrepreneurs navigate credit repair, SBA loans, and business funding. Built by Terrence Milliner Sr., Lucy combines advanced AI capabilities with deep expertise in financial systems to provide actionable guidance that was previously only available through expensive consultants. The platform focuses on underserved communities, including women-owned and minority-owned businesses, who historically face significant barriers to accessing capital.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Story Angles */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            Story Angles
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {storyAngles.map((angle, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <angle.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{angle.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{angle.hook}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Best for:</p>
                  <div className="flex flex-wrap gap-2">
                    {angle.outlets.map((outlet, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{outlet}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Expert Quotes */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Quote className="w-6 h-6 text-primary" />
            Pre-Approved Expert Quotes
          </h2>
          <p className="text-muted-foreground mb-6">
            Journalists may use the following quotes with attribution to Terrence Milliner Sr., Founder of Lucy AI:
          </p>
          <div className="space-y-6">
            {expertQuotes.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">{item.topic}</Badge>
                  <blockquote className="text-lg italic border-l-4 border-primary pl-4">
                    "{item.quote}"
                  </blockquote>
                  <p className="text-sm text-muted-foreground mt-4">
                    — Terrence Milliner Sr., Software Engineer & Founder of Lucy AI
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Podcast Topics */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            Podcast & Interview Topics
          </h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-6">
                Terrence is available to discuss the following topics on podcasts, webinars, and media interviews:
              </p>
              <ul className="space-y-4">
                {podcastTopics.map((topic, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Booking:</strong> To schedule an interview or podcast appearance, please email{' '}
                  <a href="mailto:press@lucylounge.org" className="text-primary hover:underline">
                    press@lucylounge.org
                  </a>{' '}
                  with your show name, audience size, and preferred topics.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Brand Assets */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" />
            Brand Assets
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Logo Package</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">Lucy AI</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Primary logo in PNG, SVG, and vector formats. Light and dark versions included.
                </p>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download Logos
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Founder Headshot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-xl font-bold text-primary-foreground">
                    TM
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  High-resolution headshot of Terrence Milliner Sr. for press use.
                </p>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download Headshot
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Screenshots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <span className="text-muted-foreground text-sm">App Screenshots</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Screenshots of Lucy AI interface for editorial use.
                </p>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download Screenshots
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-muted/50 rounded-2xl p-12">
          <h2 className="text-2xl font-bold mb-4">Media Contact</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            For press inquiries, interview requests, or additional information, please reach out to our media team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <a href="mailto:press@lucylounge.org">
                <Mail className="w-4 h-4" />
                press@lucylounge.org
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">General Contact</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Press;
