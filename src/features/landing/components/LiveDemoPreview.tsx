
import { useEffect, useRef, useState } from "react";
import { Search, FileText, Image, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimateOnScroll } from "@/features/landing/components/AnimateOnScroll";
import { Card, CardContent } from "@/components/ui/card";

// Feature content data
const featureContent = [
  {
    id: 1,
    title: "SEO & Keyword Analysis",
    icon: Search,
    subtitle: "Find untapped opportunities with AI-powered keyword research.",
    videoSrc: "https://placehold.it/1280x720.mp4", // Replace with real
    color: "purple"
  },
  {
    id: 2,
    title: "Effortless Listing Creation",
    icon: FileText,
    subtitle: "AI writes conversion-focused listings in seconds.",
    videoSrc: "https://placehold.it/1280x720.mp4", // Replace with real
    color: "yellow"
  },
  {
    id: 3,
    title: "Visual Photo Editing",
    icon: Image,
    subtitle: "Transform product images with one-click enhancements.",
    videoSrc: "https://placehold.it/1280x720.mp4", // Replace with real
    color: "green"
  }
];

export const LiveDemoPreview = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Responsive size state for mobile adaptation
  const [isMobile, setIsMobile] = useState(false);

  // Track window resize for responsiveness
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Autoplay video on feature switch
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, [activeIndex]);

  return (
    <section className="relative py-20 overflow-hidden" id="features">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/20 z-0">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_500px_at_50%_300px,rgba(155,135,245,0.3),transparent)]"></div>
        </div>
      </div>
      <div className="container relative z-10 px-2 mx-auto">
        <AnimateOnScroll animation="fade-up" className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Powerful Tools for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">Etsy Sellers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simplify your workflow and boost sales with our integrated suite of seller tools.
          </p>
        </AnimateOnScroll>
        {/* Desktop two-col layout */}
        <div className={`flex flex-col ${isMobile ? "" : "md:flex-row md:justify-center md:items-stretch"} w-full gap-6 md:gap-12 max-w-6xl mx-auto transition-all`}>
          {/* Left/Top: Main video card */}
          <div className={`${isMobile ? "" : "w-full md:w-[60%]"} flex items-center justify-center`}>
            <div className="relative aspect-video w-full md:w-full rounded-2xl shadow-2xl overflow-hidden border border-white/10 bg-black">
              {/* Video */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
                loop
                poster=""
                style={{
                  background: "#222",
                }}
              >
                <source src={featureContent[activeIndex].videoSrc} type="video/mp4" />
              </video>
              {/* Subtle overlay for text */}
              {/* Subtle overlay: from 0% at top to 30% black at bottom */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/0 via-black/10 to-black/30"></div>

              {/* Text overlay */}
              <div className="absolute left-0 bottom-0 right-0 px-6 py-6 md:px-10 z-10 flex flex-col gap-1">
                <div className="flex items-center">
                  <div className={`
                    mr-4 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 
                    ${activeIndex === 0 ? "bg-purple-100 text-purple-600" :
                      activeIndex === 1 ? "bg-yellow-100 text-yellow-600" :
                      "bg-green-100 text-green-600"}
                  `}>
                    {featureContent[activeIndex].id}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{featureContent[activeIndex].title}</h3>
                </div>
                <p className="text-white/90 text-sm md:text-base">{featureContent[activeIndex].subtitle}</p>
              </div>
            </div>
          </div>
          {/* Right/Bottom: Three smaller feature cards */}
          <div className={`${isMobile ? "mt-6 flex flex-col gap-3" : "flex flex-col gap-4 w-full md:w-[40%] min-w-[250px] max-w-xs"}`}>
            {featureContent.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = index === activeIndex;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveIndex(index)}
                  className={`group relative w-full transition-all focus:outline-none
                    ${isActive
                      ? "z-10 opacity-100 scale-105 border-2 border-primary bg-background"
                      : "opacity-60 scale-100 border border-transparent"}
                    rounded-xl shadow-md px-3 md:px-2 py-2 md:py-3 hover:opacity-90 hover:scale-105
                    flex items-center gap-3
                  `}
                  style={{minHeight: isMobile ? 60 : 72}}
                  aria-current={isActive}
                  tabIndex={0}
                >
                  <div className={`
                      w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow
                      ${index === 0 ? "text-purple-500 ring-2 ring-purple-200" :
                        index === 1 ? "text-yellow-600 ring-2 ring-yellow-200" :
                        "text-green-600 ring-2 ring-green-200"}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block font-semibold text-sm md:text-base">{feature.title}</span>
                    <span className="block text-xs md:text-xs text-muted-foreground">{feature.subtitle}</span>
                  </div>
                  {/* Arrow indicator for active */}
                  {isActive && (
                    <ArrowRight className={`ml-2 text-primary animate-fade-in transition-all`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* CTA Button */}
        <AnimateOnScroll 
          animation="fade-up" 
          delay={300} 
          className="mt-12 flex justify-center"
        >
          <Button
            size="lg"
            className="px-8 py-6 text-lg font-bold rounded-full shadow-xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 hover:scale-105 transition-all"
          >
            Start Free Trial
            <ArrowRight className="ml-2" />
          </Button>
        </AnimateOnScroll>
      </div>
    </section>
  );
};
