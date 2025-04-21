
import { useEffect, useRef, useState } from "react";

type AnimateOnScrollProps = {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-left" | "fade-right" | "zoom-in" | "fade-in";
  delay?: number;
  threshold?: number;
  className?: string;
  duration?: number;
};

export const AnimateOnScroll = ({
  children,
  animation = "fade-up",
  delay = 0,
  threshold = 0.15, // Slightly higher threshold to make animations more noticeable
  className = "",
  duration = 600, // Increased default duration for more noticeable animations
}: AnimateOnScrollProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before the element is fully visible
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const animationClasses = {
    "fade-up": "translate-y-16 opacity-0", // Increased distance for more visible effect
    "fade-left": "translate-x-16 opacity-0", // Increased distance for more visible effect
    "fade-right": "-translate-x-16 opacity-0", // Increased distance for more visible effect
    "zoom-in": "scale-90 opacity-0", // More dramatic scaling
    "fade-in": "opacity-0",
  };

  const getAnimationClass = () => {
    return animationClasses[animation];
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${
        isVisible
          ? "translate-y-0 translate-x-0 scale-100 opacity-100"
          : getAnimationClass()
      } ${className}`}
      style={{ 
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};
