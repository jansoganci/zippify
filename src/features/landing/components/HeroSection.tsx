
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";

export const HeroSection = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent pointer-events-none" />
      
      <div className="container px-4 md:px-6 relative">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left side: Before/After comparison */}
          <AnimateOnScroll animation="fade-left" duration={500} delay={100}>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Before Card */}
                <Card className="opacity-60">
                  <CardContent className="p-4">
                    <div className="w-full h-32 bg-muted rounded-md mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-full bg-muted rounded" />
                      <div className="h-3 w-2/3 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
                
                {/* After Card */}
                <Card className="shadow-lg border-primary/20">
                  <CardContent className="p-4">
                    <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-md mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-primary/20 rounded" />
                      <div className="h-3 w-full bg-primary/10 rounded" />
                      <div className="h-3 w-2/3 bg-primary/10 rounded" />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Transformation Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-primary/80 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-primary/20">
                  AI transforms your listing
                </div>
              </div>
            </div>
          </AnimateOnScroll>
          
          {/* Right side: Content */}
          <div className="flex flex-col justify-center space-y-4">
            <AnimateOnScroll animation="fade-right" duration={500} delay={300}>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                <span className="text-primary">AI-Powered</span> Etsy Listings in 2 Minutes Flat
              </h1>
              <p className="text-muted-foreground md:text-xl max-w-[42rem]">
                Stop struggling with bland descriptions and invisible listings. Zippify transforms your product ideas into SEO-optimized Etsy listings that <span className="font-medium text-foreground">actually sell</span>.
              </p>
            </AnimateOnScroll>
            
            <AnimateOnScroll animation="fade-right" duration={500} delay={500}>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Button 
                  size="lg" 
                  className="group transition-all duration-200 hover:shadow-md hover:scale-105"
                >
                  Create Your First Listing Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="hover:bg-background/80 transition-all duration-200 hover:shadow-sm"
                >
                  See How It Works
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                <span className="font-medium">✓ No credit card required</span> · Takes less than 60 seconds to start
              </p>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};