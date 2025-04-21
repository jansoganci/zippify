
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const ScrollingStickyButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when user scrolls 40% of the page
      const scrollPosition = window.scrollY;
      const pageHeight = document.body.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollPercentage = scrollPosition / (pageHeight - viewportHeight);

      if (scrollPercentage > 0.4) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-16 opacity-0"
      }`}
    >
      <Button
        size="lg"
        className="group shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary overflow-hidden relative"
      >
        <span className="relative z-10 flex items-center">
          Start Free Trial
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </span>
        
        {/* Subtle pulse/glow effect on hover */}
        <span className="absolute inset-0 bg-primary-foreground/10 opacity-0 group-hover:opacity-100 group-hover:scale-[1.8] rounded-full blur-md transition-all duration-700 ease-in-out transform-gpu"></span>
      </Button>
    </div>
  );
};
