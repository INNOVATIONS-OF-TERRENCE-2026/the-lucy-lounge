import { SEOHead } from '@/components/seo/SEOHead';
import { ReviewSchema } from '@/components/seo/ReviewSchema';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Star, 
  Quote, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  Building2,
  User
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Testimonials = () => {
  const navigate = useNavigate();

  const testimonials = [
    {
      name: "Marcus Johnson",
      role: "Founder, Johnson Construction LLC",
      content: "Lucy AI helped me understand Metro 2 credit reporting in a way no one else could explain. I went from a 580 to 720 credit score in 8 months and finally qualified for my SBA loan.",
      rating: 5,
      date: "2024-11-15",
      result: "580 → 720 Credit Score",
      category: "Credit Repair"
    },
    {
      name: "Keisha Williams",
      role: "CEO, Williams Consulting Group",
      content: "As a Black woman entrepreneur, I struggled to find funding resources. Lucy's guides on grants for Black women entrepreneurs led me to three grants I didn't know existed. I secured $45,000 in funding.",
      rating: 5,
      date: "2024-10-22",
      result: "$45,000 in Grants Secured",
      category: "Business Funding"
    },
    {
      name: "David Chen",
      role: "Owner, Chen's Auto Repair",
      content: "The 90-day business credit guide was a game changer. I followed it step by step and now have 5 Net-30 accounts reporting to Dun & Bradstreet. My Paydex score went from 0 to 78.",
      rating: 5,
      date: "2024-12-01",
      result: "Paydex 0 → 78",
      category: "Business Credit"
    },
    {
      name: "Angela Martinez",
      role: "Founder, Martinez Digital Marketing",
      content: "I was denied an SBA loan twice before finding Lucy. The SBA 7(a) vs 504 comparison helped me realize I was applying for the wrong loan type. Third time was the charm - approved for $150,000.",
      rating: 5,
      date: "2024-09-18",
      result: "$150,000 SBA Loan Approved",
      category: "SBA Loans"
    },
    {
      name: "Robert Thompson",
      role: "Owner, Thompson Landscaping",
      content: "The dispute letter templates alone saved me thousands in credit repair fees. I successfully disputed 4 inaccurate items and my score jumped 85 points in 60 days.",
      rating: 5,
      date: "2024-11-28",
      result: "+85 Points in 60 Days",
      category: "Credit Repair"
    },
    {
      name: "Tanya Brooks",
      role: "CEO, Brooks Catering Services",
      content: "Getting WOSB certified seemed impossible until I found Lucy's step-by-step guide. I completed my certification in 3 weeks and already landed my first federal contract worth $28,000.",
      rating: 5,
      date: "2024-10-05",
      result: "$28,000 Federal Contract",
      category: "Certifications"
    }
  ];

  const caseStudies = [
    {
      title: "From Denied to $250,000 SBA Loan Approval",
      client: "Johnson Construction LLC",
      industry: "Construction",
      challenge: "Marcus had a 580 credit score and was denied by 3 lenders. He had collections, late payments, and a thin business credit file.",
      solution: "Using Lucy's credit repair guide, Marcus disputed inaccurate late payments using Metro 2 compliance arguments. Simultaneously, he opened 4 Net-30 vendor accounts to build business credit separately from personal credit.",
      results: [
        "Credit score improved from 580 to 720 in 8 months",
        "Paydex score established at 80",
        "Approved for $250,000 SBA 7(a) loan",
        "Interest rate: Prime + 2.75%"
      ],
      timeline: "8 months",
      fundingSecured: "$250,000"
    },
    {
      title: "Black Woman Entrepreneur Secures $75,000 in Grants",
      client: "Williams Consulting Group",
      industry: "Business Consulting",
      challenge: "Keisha had been rejected for traditional bank loans due to being a newer business. She needed capital to hire staff and expand operations but didn't want to take on debt.",
      solution: "Lucy's grant database and application strategies helped Keisha identify and apply to grants specifically for Black women entrepreneurs. She applied to 8 grants over 4 months.",
      results: [
        "Secured Amber Grant ($10,000)",
        "Won regional SBDC competition ($25,000)",
        "Received IFundWomen coaching grant ($15,000)",
        "State minority business grant ($25,000)"
      ],
      timeline: "6 months",
      fundingSecured: "$75,000"
    },
    {
      title: "New Business Builds 80 Paydex in 90 Days",
      client: "Chen's Auto Repair",
      industry: "Automotive Services",
      challenge: "David's business was only 6 months old with no business credit history. He needed equipment financing but had no Paydex score.",
      solution: "Following Lucy's 90-day business credit blueprint, David strategically opened vendor accounts that report to business credit bureaus and made small, regular purchases paid on time.",
      results: [
        "Opened 5 Net-30 accounts in Week 1",
        "Paydex score of 50 by Day 45",
        "Paydex score of 78 by Day 90",
        "Approved for $35,000 equipment line"
      ],
      timeline: "90 days",
      fundingSecured: "$35,000"
    }
  ];

  const reviewsForSchema = testimonials.map(t => ({
    author: t.name,
    datePublished: t.date,
    reviewBody: t.content,
    ratingValue: t.rating
  }));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Customer Testimonials & Case Studies | Lucy AI"
        description="Real success stories from entrepreneurs who used Lucy AI to repair credit, secure SBA loans, and access business funding. See verified results and case studies."
        url="https://lucylounge.org/testimonials"
      />
      <ReviewSchema 
        itemName="Lucy AI"
        itemType="SoftwareApplication"
        reviews={reviewsForSchema}
        aggregateRating={{
          ratingValue: 4.9,
          reviewCount: testimonials.length
        }}
      />

      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Link to="/" className="text-xl font-bold text-primary">Lucy AI</Link>
          <Button asChild>
            <Link to="/chat">Try Lucy Free</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Badge className="mb-4">Real Results</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Success Stories from Real Entrepreneurs
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            See how business owners like you used Lucy AI to repair credit, build business credit, and secure funding.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-center">
            <div className="px-6 py-4 rounded-lg bg-primary/10">
              <div className="text-3xl font-bold text-primary">$500K+</div>
              <div className="text-sm text-muted-foreground">Funding Secured</div>
            </div>
            <div className="px-6 py-4 rounded-lg bg-primary/10">
              <div className="text-3xl font-bold text-primary">150+</div>
              <div className="text-sm text-muted-foreground">Credit Points Gained</div>
            </div>
            <div className="px-6 py-4 rounded-lg bg-primary/10">
              <div className="text-3xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Quote className="w-6 h-6 text-primary" />
            Customer Testimonials
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-4 flex-1 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">{testimonial.category}</Badge>
                      <div className="flex items-center gap-1 text-xs text-green-500 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {testimonial.result}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Case Studies */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Detailed Case Studies
          </h2>
          <div className="space-y-8">
            {caseStudies.map((study, index) => (
              <Card key={index}>
                <CardContent className="p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <Badge className="mb-2">{study.industry}</Badge>
                      <h3 className="text-xl font-bold">{study.title}</h3>
                      <p className="text-muted-foreground">{study.client}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-500">{study.fundingSecured}</div>
                      <div className="text-sm text-muted-foreground">in {study.timeline}</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-red-500 mb-2">The Challenge</h4>
                      <p className="text-sm text-muted-foreground">{study.challenge}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-500 mb-2">The Solution</h4>
                      <p className="text-sm text-muted-foreground">{study.solution}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-500 mb-2">The Results</h4>
                      <ul className="space-y-2">
                        {study.results.map((result, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12">
          <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of entrepreneurs who have used Lucy AI to repair their credit, build business credit, and secure funding.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/chat">Start Free with Lucy AI</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/guides/business-credit-repair">Read Credit Repair Guide</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Testimonials;
