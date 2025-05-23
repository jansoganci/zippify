import { useEffect, useRef, useState } from "react";
import { Search, FileText, Image, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimateOnScroll } from "@/features/landing/components/AnimateOnScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createLogger } from "@/utils/logger";

// Create logger for this component
const logger = createLogger('LiveDemoPreview');

// Feature content data
const featureContent = [
  {
    title: "SEO & Keyword Analysis",
    icon: Search,
    subtitle: "Analyze keywords in seconds to outrank competitors.",
    videoSrc: "/videos/seo&keyword.analysis.mp4",
    placeholderImage: "/placeholder-images/seo-analysis.svg",
    color: "purple"
  },
  {
    title: "Effortless Listing Creation",
    icon: FileText,
    subtitle: "Generate titles, descriptions & tags with one click.",
    videoSrc: "/videos/creating.listing.mp4",
    placeholderImage: "/placeholder-images/listing-creation.svg",
    color: "yellow"
  },
  {
    title: "Visual Photo Editing",
    icon: Image,
    subtitle: "Enhance photos and remove backgrounds instantly.",
    videoSrc: "/videos/image.editing.mp4",
    placeholderImage: "/placeholder-images/photo-editing.svg",
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
      // Force reload the video element when activeIndex changes
      const videoElement = videoRef.current;
      videoElement.load(); // Reload the video
      
      // Play the video after a small delay to ensure it's loaded
      const playPromise = videoElement.play();
      
      // Handle play promise (modern browsers return a promise from play())
      if (playPromise !== undefined) {
        playPromise
          .catch(error => {
            logger.debug('Video autoplay prevented', { error: error.message });
          });
      }
    }
  }, [activeIndex]);

  return (
    <section className="relative py-20 overflow-hidden bg-muted" id="features">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/20 z-0">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_500px_at_50%_300px,var(--primary)/30,transparent)]"></div>
        </div>
      </div>
      <div className="container relative z-10 px-2 mx-auto">
        <AnimateOnScroll animation="fade-up" className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">Powerful Tools</span>{" "}
            to Boost Your Sales
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our integrated suite of AI-powered tools helps you create perfect listings that attract more buyers.
          </p>
        </AnimateOnScroll>
        {/* Desktop two-col layout */}
        <div className={`flex flex-col ${isMobile ? "" : "md:flex-row md:justify-center md:items-stretch"} w-full gap-6 md:gap-12 max-w-6xl mx-auto transition-all`}>
          {/* Left/Top: Main video card */}
          <div className={`${isMobile ? "" : "w-full md:w-[60%]"} flex items-center justify-center`}>
            <div className="relative aspect-video w-full md:w-full rounded-xl shadow-xl overflow-hidden border border-border/20 bg-card/90 transition-all duration-500">
              {/* Highlight border when active */}
              <div className="absolute inset-0 border-2 border-primary/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Video */}
              <div className="w-full h-full flex items-center justify-center">
                <video
                  key={`video-${activeIndex}`} // Add key to force re-render when activeIndex changes
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                  loop
                  poster={featureContent[activeIndex].placeholderImage}
                  style={{
                    background: "var(--card)",
                  }}
                >
                  <source src={featureContent[activeIndex].videoSrc} type="video/mp4" />
                </video>
              </div>
              
              {/* Gradient overlay for text */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/10 to-black/60"></div>

              {/* Text overlay */}
              <div className="absolute left-0 bottom-0 right-0 px-6 py-6 md:px-10 z-10 flex flex-col gap-1">
                <div className="flex items-center">
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
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`group relative w-full transition-all duration-300 focus:outline-none
                    ${isActive
                      ? "z-10 opacity-100 scale-105 bg-card shadow-lg border-l-4 border-l-primary border-y border-r border-border"
                      : "opacity-80 scale-100 bg-background/80 hover:bg-card/80 border border-border/40"}
                    rounded-lg px-4 py-3 hover:opacity-100 hover:scale-[1.02]
                    flex items-center gap-3
                  `}
                  style={{minHeight: isMobile ? 70 : 80}}
                  aria-current={isActive}
                  tabIndex={0}
                >
                  <div className={`
                      w-10 h-10 flex items-center justify-center rounded-full 
                      ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
                      transition-all duration-300
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className={`block font-semibold text-sm md:text-base ${isActive ? "text-primary" : ""}`}>{feature.title}</span>
                    <span className="block text-xs md:text-xs text-muted-foreground mt-0.5">{feature.subtitle}</span>
                  </div>
                  {/* Arrow indicator for active */}
                  {isActive && (
                    <ArrowRight className="ml-2 text-primary animate-pulse transition-all" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* CTA Button removed */}
      </div>
    </section>
  );
};
