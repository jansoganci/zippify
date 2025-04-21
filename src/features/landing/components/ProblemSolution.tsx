
import { Clock, Search, PenTool } from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { ProblemSolutionCard } from "./ProblemSolutionCard";

export const ProblemSolution = () => {
  const features = [
    {
      title: "Hours Saved",
      problem: "Spend 45+ minutes writing each listing, feeling drained and uninspired",
      solution: "Generate complete, buyer-focused listings in under 2 minutes with just a few clicks",
      icon: Clock
    },
    {
      title: "SEO Supercharged",
      problem: "Guess which keywords might work, missing out on potential customers",
      solution: "Access real-time keyword data that shows exactly what buyers are searching for",
      icon: Search
    },
    {
      title: "Pro-Quality Content",
      problem: "Struggle with writer's block and wonder if your descriptions sound professional",
      solution: "Create compelling, error-free copy that turns browsers into buyers every time",
      icon: PenTool
    }
  ];

  return (
    <section className="w-full py-12 md:py-24 bg-white dark:bg-[#0F172A] relative">
      {/* Subtle diagonal pattern background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(45deg,var(--primary)_25%,transparent_25%,transparent_50%,var(--primary)_50%,var(--primary)_75%,transparent_75%,transparent)] bg-[length:24px_24px]"></div>
      
      <div className="container px-4 md:px-6 relative">
        <AnimateOnScroll animation="fade-up" duration={500}>
          <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-3xl mx-auto">
            <div className="inline-flex h-6 animate-fade-in items-center rounded-full bg-primary/10 px-4 text-sm font-medium text-primary">
              Crafted for creative sellers
            </div>
            <div className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                The <span className="text-primary">Smarter Way</span> to Sell on Etsy
              </h2>
              <p className="max-w-[700px] text-base text-muted-foreground leading-relaxed">
                Focus on creating beautiful products, not wrestling with listing details. 
                See how Zippify transforms your Etsy shop experience:
              </p>
            </div>
          </div>
        </AnimateOnScroll>
        
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 mt-8">
          {features.map((feature, index) => (
            <AnimateOnScroll 
              key={index} 
              animation="fade-up" 
              delay={index * 200}
              duration={500}
            >
              <ProblemSolutionCard {...feature} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};
