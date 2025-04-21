
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";

export const StickyCTA = () => {
  return (
    <section className="w-full py-12 md:py-24 bg-primary/5 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container px-4 md:px-6 relative">
        <AnimateOnScroll animation="fade-up" duration={500}>
          <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-1 bg-background rounded-full px-3 py-1 text-sm font-medium shadow-sm">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-muted-foreground ml-1">★★★★★ 4.9/5 from Listify sellers</span>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to <span className="text-primary">Transform</span> Your Listify Shop?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed mx-auto">
                Join thousands of creative sellers who save 5+ hours every week and increase their sales by an average of 32% with Listify's AI-powered listings.
              </p>
            </div>
            <div className="w-full max-w-sm mt-10">
              <Button 
                size="lg" 
                className="w-full text-md h-12 group shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-primary"
              >
                Create Your First Listing Free
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Free plan available · No credit card required</p>
            </div>
          </div>
        </AnimateOnScroll>
        
        <AnimateOnScroll animation="fade-up" delay={300} duration={500}>
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-background shadow-sm border-2 border-background -mr-2 flex items-center justify-center text-xs font-medium overflow-hidden hover:scale-110 transition-transform cursor-pointer"
                >
                  <img
                    src={`https://randomuser.me/api/portraits/women/${20 + i}.jpg`}
                    alt={`User ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium">
              Trusted by <span className="text-primary">5,000+</span> Listify sellers worldwide
            </p>
          </div>
        </AnimateOnScroll>
        
        <AnimateOnScroll animation="zoom-in" delay={500} duration={500}>
          <div className="border-b border-gray-700 dark:border-gray-600 w-full max-w-2xl mx-auto my-12"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mx-auto">
            {[
              { value: '120K+', label: 'Time Saved' },
              { value: '250K+', label: 'Listings Created' },
              { value: '$2.7M+', label: 'Revenue Generated' },
              { value: '4,800+', label: 'Happy Sellers' }
            ].map((stat, i) => (
              <div 
                key={i} 
                className="bg-background dark:bg-[#24303E] rounded-lg p-3 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer ring-1 ring-white/10"
              >
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};
