
import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { AnimateOnScroll } from "./AnimateOnScroll";

// Feature slide colors
const slideAccentColors = [
  "bg-blue-500", // Slide 1
  "bg-purple-500", // Slide 2
  "bg-green-500" // Slide 3
];

const FeatureSlide = ({ 
  number, 
  title, 
  subtitle, 
  accentColor, 
  children 
}: {
  number: string;
  title: string;
  subtitle: string;
  accentColor: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="relative h-full flex flex-col items-center justify-center p-8 md:p-12">
      {/* Large number badge */}
      <div className={`absolute top-8 left-8 md:top-12 md:left-12 w-14 h-14 rounded-full ${accentColor} flex items-center justify-center text-white text-2xl font-bold`}>
        {number}
      </div>
      
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
        <p className="text-xl text-muted-foreground">{subtitle}</p>
        
        <div className="w-full mt-10">
          {children}
        </div>
      </div>
    </div>
  );
};

// Placeholder components for slide content
const KeywordTrendsPlaceholder = () => (
  <div className="h-64 bg-muted/20 rounded-xl border border-border flex items-center justify-center">
    <div className="space-y-4 p-6 w-full">
      <div className="flex items-end justify-between h-40 gap-2">
        {[40, 65, 35, 85, 55, 75, 60, 90].map((height, i) => (
          <div 
            key={i}
            className="bg-blue-500/80 rounded-t-md w-full" 
            style={{ height: `${height}%` }}
          >
            <div className="h-1 w-full bg-blue-400 rounded-t-md"></div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Jan</span>
        <span>Mar</span>
        <span>Jun</span>
        <span>Sep</span>
        <span>Dec</span>
      </div>
    </div>
  </div>
);

const AIOutputPlaceholder = () => (
  <div className="h-64 bg-muted/20 rounded-xl border border-border overflow-hidden">
    <div className="bg-muted/50 p-3 border-b border-border flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-red-400"></div>
      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
      <div className="w-3 h-3 rounded-full bg-green-400"></div>
      <span className="text-xs font-mono ml-2">Listify AI Generator</span>
    </div>
    <div className="p-4 font-mono text-sm space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-purple-500">Input:</span>
        <span className="bg-muted/30 px-2 py-1 rounded">Handmade ceramic mug</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-purple-500">Output:</span>
        <div className="space-y-1">
          <div className="bg-muted/30 px-2 py-1 rounded animate-pulse">Handcrafted Ceramic Coffee Mug | Artisan Pottery...</div>
          <div className="bg-muted/30 px-2 py-1 rounded animate-pulse">This beautiful handmade ceramic mug is crafted with...</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {["handmade", "ceramic", "pottery", "coffee lover"].map((tag) => (
              <span key={tag} className="bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BeforeAfterPlaceholder = () => (
  <div className="h-64 bg-muted/20 rounded-xl border border-border flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 flex">
      <div className="w-1/2 h-full bg-muted flex items-center justify-center border-r border-border">
        <div className="text-center p-4">
          <div className="w-24 h-24 mx-auto bg-gray-400 rounded-lg mb-2 flex items-center justify-center text-white">
            Before
          </div>
          <span className="text-xs text-muted-foreground">Original Photo</span>
        </div>
      </div>
      <div className="w-1/2 h-full bg-gradient-to-tr from-green-500/10 to-green-500/5 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-24 h-24 mx-auto bg-green-400 rounded-lg mb-2 flex items-center justify-center text-white shadow-lg">
            After
          </div>
          <span className="text-xs text-muted-foreground">Enhanced Photo</span>
        </div>
      </div>
    </div>
    
    {/* Slider handle */}
    <div className="absolute inset-y-0 left-1/2 w-1 bg-white shadow-lg transform -translate-x-1/2 flex items-center justify-center">
      <div className="w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-green-500"></div>
      </div>
    </div>
  </div>
);

const ProcessSteps = () => {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // Auto-rotation timer setup
  useEffect(() => {
    if (!api) return;
    
    const startAutoRotation = () => {
      intervalRef.current = window.setInterval(() => {
        api.scrollNext();
      }, 5000) as unknown as number;
    };
    
    const stopAutoRotation = () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    
    // Start auto-rotation
    startAutoRotation();
    
    // Pause on hover
    const container = carouselContainerRef.current;
    if (container) {
      container.addEventListener('mouseenter', stopAutoRotation);
      container.addEventListener('mouseleave', startAutoRotation);
    }
    
    // Cleanup
    return () => {
      stopAutoRotation();
      if (container) {
        container.removeEventListener('mouseenter', stopAutoRotation);
        container.removeEventListener('mouseleave', startAutoRotation);
      }
    };
  }, [api]);

  // Update current slide
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      if (api) setCurrent(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <section className="w-full min-h-screen bg-background relative overflow-hidden py-12" id="features">
      <div className="container px-4 md:px-6 h-full flex flex-col">
        <AnimateOnScroll animation="fade-up">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex h-6 animate-fade-in items-center rounded-full bg-secondary px-3 text-xs font-medium uppercase tracking-wider text-secondary-foreground">
              Core Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
              Get More Sales with Less Effort
            </h2>
            <p className="max-w-[700px] text-muted-foreground text-lg leading-relaxed">
              Our AI-powered tools help you create perfect listings that attract more buyers.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="flex-1 w-full" ref={carouselContainerRef}>
          <AnimateOnScroll animation="fade-up" delay={200}>
            <Carousel 
              setApi={setApi} 
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="h-full">
                <CarouselItem>
                  <FeatureSlide 
                    number="1" 
                    title="SEO & Keyword Research" 
                    subtitle="Discover the highest-impact keywords in seconds."
                    accentColor="bg-blue-500"
                  >
                    <KeywordTrendsPlaceholder />
                  </FeatureSlide>
                </CarouselItem>
                <CarouselItem>
                  <FeatureSlide 
                    number="2" 
                    title="Effortless Listing Creation" 
                    subtitle="Auto-generate SEO-optimized titles, descriptions, tags & alt-text."
                    accentColor="bg-purple-500"
                  >
                    <AIOutputPlaceholder />
                  </FeatureSlide>
                </CarouselItem>
                <CarouselItem>
                  <FeatureSlide 
                    number="3" 
                    title="Visual Photo Editor" 
                    subtitle="One-click background removal & enhancement."
                    accentColor="bg-green-500"
                  >
                    <BeforeAfterPlaceholder />
                  </FeatureSlide>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex -left-5 bg-background border border-border" />
              <CarouselNext className="hidden lg:flex -right-5 bg-background border border-border" />
            </Carousel>
          </AnimateOnScroll>
          
          {/* Dot navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => api?.scrollTo(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  current === idx 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Sticky CTA button */}
      <div className="sticky bottom-6 w-full flex justify-center z-10 mt-12">
        <Button
          size="lg"
          className="group shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-primary"
        >
          Start Free Trial
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
      
      {/* Mobile view control buttons */}
      <div className="lg:hidden flex justify-center gap-4 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => api?.scrollPrev()}
          aria-label="Previous slide"
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => api?.scrollNext()}
          aria-label="Next slide"
          className="rounded-full"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export default ProcessSteps;
