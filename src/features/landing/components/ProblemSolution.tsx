
import { Timer, Rocket, Award } from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { ProblemSolutionCard } from "./ProblemSolutionCard";

export const ProblemSolution = () => {
  const features = [
    {
      title: "Hours Saved",
      problem: "Spend 45+ minutes writing each listing, feeling drained and uninspired",
      solution: "Generate complete, buyer-focused listings in under 2 minutes with just a few clicks",
      icon: Timer
    },
    {
      title: "SEO Supercharged",
      problem: "Guess which keywords might work, missing out on potential customers",
      solution: "Discover the top-converting keywords for your products automatically",
      icon: Rocket
    },
    {
      title: "Pro-Quality Content",
      problem: "Struggle with writer's block and wonder if your descriptions sound professional",
      solution: "Auto-create professional product pages that convert browsers into buyers",
      icon: Award
    }
  ];

  return (
    <section className="w-full py-16 md:py-28 bg-background dark:bg-background relative overflow-hidden">
      {/* Enhanced background with multiple patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(45deg,var(--primary)_25%,transparent_25%,transparent_50%,var(--primary)_50%,var(--primary)_75%,transparent_75%,transparent)] bg-[length:24px_24px]"></div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      
      <div className="container px-4 md:px-8 relative">
        <AnimateOnScroll animation="fade-up" duration={500}>
          <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto">
            <div className="inline-flex h-7 animate-fade-in items-center rounded-full bg-primary/10 px-5 py-1 text-sm font-medium text-primary border border-primary/20 shadow-sm">
              Crafted for creative sellers
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 dark:from-foreground dark:to-foreground/70">
                Create <span className="text-primary font-extrabold">Better Listings</span> in Less Time
              </h2>
              <p className="max-w-[700px] text-lg text-muted-foreground leading-relaxed mx-auto">
                Focus on creating beautiful products, not wrestling with listing details.
                See how Zippify helps you save time and increase sales:
              </p>
            </div>
          </div>
        </AnimateOnScroll>
        
        <div className="grid gap-6 sm:gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {features.map((feature, index) => (
            <AnimateOnScroll 
              key={index} 
              animation="fade-up" 
              delay={index * 300}
              duration={600}
            >
              <ProblemSolutionCard {...feature} delay={index * 100} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};
