
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();
  
  const scrollToDemo = () => {
    const demoElement = document.getElementById('how-it-works');
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background decoration - subtle pattern effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent pointer-events-none"></div>
      
      <div className="container px-4 md:px-6 relative">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <AnimateOnScroll animation="fade-left" duration={500} delay={100}>
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-2 w-fit">
                <Sparkles size={16} />
                <span>The Etsy seller's secret weapon</span>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll animation="fade-left" duration={500} delay={300}>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  <span className="text-primary">AI-Powered</span> Etsy Listings in 2 Minutes Flat
                </h1>
                <p className="text-muted-foreground md:text-xl max-w-xl">
                  Stop struggling with bland descriptions and invisible listings. Zippify transforms your product ideas into SEO-optimized Etsy listings that <span className="font-medium text-foreground">actually sell</span>.
                </p>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll animation="fade-left" duration={500} delay={500}>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button 
                  size="lg" 
                  className="mt-4 group transition-all duration-300 hover:shadow-md hover:scale-105"
                  onClick={() => navigate('/create')}
                >
                  Create Your First Listing Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="mt-4 hover:bg-background/80 transition-all duration-300 hover:shadow-sm"
                  onClick={scrollToDemo}
                >
                  See How It Works
                </Button>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll animation="fade-left" duration={500} delay={700}>
              <p className="text-sm text-muted-foreground pt-2">
                <span className="font-medium">✓ No credit card required</span> · Takes less than 60 seconds to start
              </p>
            </AnimateOnScroll>
          </div>
          
          <AnimateOnScroll animation="fade-right" duration={600} delay={400}>
            <div className="flex justify-center lg:justify-end relative">
              <div className="relative w-full max-w-[500px] h-[400px] rounded-lg overflow-hidden bg-muted shadow-lg transition-all hover:shadow-xl duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Placeholder for hero image - suggestion: show before/after of an Etsy listing transformation */}
                  <div className="flex flex-col items-center text-muted-foreground space-y-2">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="text-primary" size={20} />
                    </div>
                    <p className="font-medium">Beautiful listing transformation</p>
                    <p className="text-xs max-w-xs text-center">Illustration showing a product photo being transformed into a professional Etsy listing with SEO tags</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
              <div className="absolute -z-10 top-12 -left-6 w-24 h-24 bg-secondary/10 rounded-full blur-xl"></div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
};