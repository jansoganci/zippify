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
import { Link } from "react-router-dom";

// Özellik slaytları için genel şablon
const FeatureSlide = ({
  title,
  subtitle,
  accentColor,
  children
}: {
  title: string;
  subtitle: string;
  accentColor: string;
  children: React.ReactNode;
}) => (
  <div className="relative h-full flex flex-col items-center justify-center p-6 md:p-8 overflow-hidden">
    <div className={`absolute -z-10 top-1/3 right-1/4 w-48 h-48 ${accentColor}/5 rounded-full blur-3xl opacity-60`} />
    <div className="text-center max-w-3xl mx-auto space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-primary">
          {title}
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
          {subtitle}
        </p>
      </div>
      <div className="w-full mt-6 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md rounded-xl">
        {children}
      </div>
    </div>
  </div>
);

// 1. Slayt placeholder (Keyword Trends)
const KeywordTrendsPlaceholder = () => (
  <div className="h-60 w-[768px] mx-auto bg-card rounded-xl border border-border shadow-md overflow-hidden">
    <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/40 rounded-t-sm"></div>
    <div className="bg-muted/10 p-3 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 9 3-3 3 3"/><path d="M13 18H7a2 2 0 0 1-2-2V6"/><path d="m22 15-3 3-3-3"/><path d="M11 6h6a2 2 0 0 1 2 2v10"/></svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Keyword Analysis</h3>
          <p className="text-xs text-muted-foreground">12 keywords found based on your search</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="px-2 py-1 bg-muted/20 rounded text-xs font-medium">Popularity</div>
        <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">Competition</div>
      </div>
    </div>
    <div className="p-4 w-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm border border-primary/30 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-sm"></div>
            </div>
            <span className="text-sm font-medium">handmade ceramic mug</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs px-2 py-0.5 bg-green-500/10 text-green-600 rounded">High</div>
            <div className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded">Medium</div>
            <div className="flex items-center text-xs text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm border border-primary/30 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-sm"></div>
            </div>
            <span className="text-sm font-medium">personalized coffee cup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs px-2 py-0.5 bg-green-500/10 text-green-600 rounded">High</div>
            <div className="text-xs px-2 py-0.5 bg-red-500/10 text-red-600 rounded">High</div>
            <div className="flex items-center text-xs text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm border border-primary/30 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-sm"></div>
            </div>
            <span className="text-sm font-medium">custom tea mug gift</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded">Medium</div>
            <div className="text-xs px-2 py-0.5 bg-green-500/10 text-green-600 rounded">Low</div>
            <div className="flex items-center text-xs text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="2" y1="12" y2="12"/><polyline points="16 6 22 12 16 18"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 2. Slayt placeholder (Listing Generator)
const AIOutputPlaceholder = () => (
  <div className="h-60 w-[768px] mx-auto bg-card rounded-xl border border-border shadow-md overflow-hidden">
    <div className="bg-muted/50 p-2 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>
      <span className="text-xs font-medium">Listing Generator</span>
      <div className="w-4" />
    </div>
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Product Input</span>
        <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full">AI Powered</span>
      </div>
      <div className="bg-muted/20 p-2 rounded-md border border-border/50 text-xs">
        <span className="text-purple-600 font-medium">Input:</span>
        <span className="ml-1">Handmade ceramic mug</span>
      </div>
      <div className="space-y-2">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-2 rounded-md border border-purple-200 dark:border-purple-800/30">
          <p className="font-medium text-xs">Handcrafted Ceramic Coffee Mug | Artisan Pottery | Unique Gift</p>
        </div>
        <div className="bg-muted/20 p-2 rounded-md border border-border/50 text-xs text-muted-foreground line-clamp-2">
          This beautiful handmade ceramic mug is crafted with love and attention to detail. Perfect for your morning coffee or evening tea, this artisan pottery piece brings warmth and character to your daily ritual...
        </div>
        <div className="flex flex-wrap gap-1">
          {["handmade", "ceramic", "pottery", "coffee"].map(tag => (
            <span key={tag} className="bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[10px] px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-700/30">
              #{tag}
            </span>
          ))}
          <span className="text-[10px] text-muted-foreground">+4 more</span>
        </div>
      </div>
    </div>
  </div>
);

// 3. Slayt placeholder (Before/After Image)
const BeforeAfterPlaceholder = () => (
  <div className="h-60 w-[768px] mx-auto bg-card rounded-xl border border-border shadow-md overflow-hidden">
    <div className="bg-muted/50 p-2 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>
      <span className="text-xs font-medium">Image Editor</span>
      <div className="w-4" />
    </div>
    <div className="p-3 relative">
      <div className="grid grid-cols-2 gap-3">
        {/* Original */}
        <div className="space-y-2">
          <div className="bg-muted/30 p-1.5 rounded-md text-xs font-medium text-center text-muted-foreground">Original Image</div>
          <div className="aspect-square bg-muted/20 rounded-md border border-border/50 flex items-center justify-center relative overflow-hidden">
            <img src="/images/original.jpg" className="w-full h-full max-h-[90%] object-contain" alt="Original product listing" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] p-1 text-center">
              Low quality, distracting background
            </div>
          </div>
        </div>
        {/* Enhanced */}
        <div className="space-y-2">
          <div className="bg-green-500/10 p-1.5 rounded-md text-xs font-medium text-center text-green-600 dark:text-green-400">Enhanced Image</div>
          <div className="aspect-square bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10 rounded-md border border-green-200 dark:border-green-800/30 flex items-center justify-center relative overflow-hidden">
            <img src="/images/enchanged.jpg" className="w-full h-full max-h-[90%] object-contain" alt="Enhanced product listing" />
            <div className="absolute bottom-0 left-0 right-0 bg-green-500/70 text-white text-[10px] p-1 text-center">
              Enhanced quality, removed background
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-200 dark:border-green-700/30">Background Removal</div>
          <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-200 dark:border-green-700/30">Enhancement</div>
        </div>
        <button className="bg-green-500 hover:bg-green-600 text-white text-[10px] px-2 py-0.5 rounded transition-colors">Download</button>
      </div>
    </div>
  </div>
);

const ProcessSteps = () => {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // Otomatik döndürme
  useEffect(() => {
    if (!api) return;
    const start = () => {
      intervalRef.current = window.setInterval(() => api.scrollNext(), 5000) as unknown as number;
    };
    const stop = () => { if (intervalRef.current != null) clearInterval(intervalRef.current); intervalRef.current = null; };
    start();
    const c = carouselContainerRef.current;
    if (c) { c.addEventListener('mouseenter', stop); c.addEventListener('mouseleave', start); }
    return () => {
      stop();
      if (c) { c.removeEventListener('mouseenter', stop); c.removeEventListener('mouseleave', start); }
    };
  }, [api]);

  // Seçim güncelleme
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  return (
    <section className="w-full min-h-screen bg-background relative overflow-hidden py-12" id="features">
      <div className="container px-4 md:px-6 h-full flex flex-col">
        <AnimateOnScroll animation="fade-up">
          <div className="flex flex-col items-center justify-center space-y-6 text-center mb-16">
            <div className="inline-flex h-7 animate-fade-in items-center rounded-full bg-secondary/20 px-5 py-1 text-sm font-medium uppercase tracking-wider text-secondary-foreground border border-secondary/30 shadow-sm">
              Core Features
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-primary/70">
                Get More Sales with <span className="font-extrabold">Less Effort</span>
              </h2>
              <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground leading-relaxed mx-auto">
                Our AI-powered tools help you create perfect listings that attract more buyers and boost your conversion rates.
              </p>
            </div>
          </div>
        </AnimateOnScroll>

        <div className="flex-1 w-full relative" ref={carouselContainerRef}>
          <AnimateOnScroll animation="fade-up" delay={200}>
            <div className="absolute -z-10 top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-70 transform -translate-y-1/2" />
            <div className="absolute -z-10 top-1/3 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl opacity-70" />
            <div className="relative bg-background/20 backdrop-blur-sm rounded-xl p-1 md:p-4 shadow-md border border-border/30 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-70" />

              <Carousel setApi={setApi} className="w-full" opts={{ align: "center", loop: true }}>
                <CarouselContent className="h-full px-2 md:px-4">
                  <CarouselItem className="w-full p-1 md:p-2">
                    <FeatureSlide
                      title="SEO & Keyword Research"
                      subtitle="Discover the highest-impact keywords in seconds."
                      accentColor="bg-blue-500"
                    >
                      <KeywordTrendsPlaceholder />
                    </FeatureSlide>
                  </CarouselItem>
                  <CarouselItem className="w-full p-1 md:p-2">
                    <FeatureSlide
                      title="Effortless Listing Creation"
                      subtitle="Auto-generate SEO-optimized titles, descriptions, tags & alt-text."
                      accentColor="bg-purple-500"
                    >
                      <AIOutputPlaceholder />
                    </FeatureSlide>
                  </CarouselItem>
                  <CarouselItem className="w-full p-1 md:p-2">
                    <FeatureSlide
                      title="Visual Photo Editor"
                      subtitle="One-click background removal & enhancement."
                      accentColor="bg-green-500"
                    >
                      <BeforeAfterPlaceholder />
                    </FeatureSlide>
                  </CarouselItem>
                </CarouselContent>

                <CarouselPrevious className="hidden lg:flex -left-3 bg-background/80 backdrop-blur-sm border border-border/60 shadow-md hover:bg-background hover:border-primary/50 transition-all duration-300" />
                <CarouselNext className="hidden lg:flex -right-3 bg-background/80 backdrop-blur-sm border border-border/60 shadow-md hover:bg-background hover:border-primary/50 transition-all duration-300" />
              </Carousel>
            </div>
          </AnimateOnScroll>

          <div className="flex justify-center gap-3 mt-10">
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                onClick={() => api?.scrollTo(idx)}
                className={`transition-all duration-300 ${
                  current === idx
                    ? 'bg-primary w-10 h-3 rounded-full shadow-md shadow-primary/20'
                    : 'w-3 h-3 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 hover:scale-110'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="lg:hidden flex justify-center gap-6 mt-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => api?.scrollPrev()}
            aria-label="Previous slide"
            className="rounded-full w-12 h-12 bg-background/80 backdrop-blur-sm border border-border/60 shadow-md hover:border-primary/50 hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => api?.scrollNext()}
            aria-label="Next slide"
            className="rounded-full w-12 h-12 bg-background/80 backdrop-blur-sm border border-border/60 shadow-md hover:border-primary/50 hover:scale-105 transition-all duration-300"
          >
            <ArrowRight className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;