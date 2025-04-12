
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, Search, PenTool, ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";

type FeatureProps = {
  title: string;
  problem: string;
  solution: string;
  icon: React.ReactNode;
  delay: number;
};

const Feature = ({ title, problem, solution, icon, delay }: FeatureProps) => (
  <AnimateOnScroll animation="fade-up" delay={delay} duration={500}>
    <Card className="h-full border-none shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6 space-y-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="space-y-3">
          <div className="flex items-start group">
            <div className="p-1 rounded-full bg-destructive/20 mr-2 mt-1 group-hover:scale-110 transition-transform">
              <div className="w-4 h-4 flex items-center justify-center">
                <span className="text-destructive text-xs">×</span>
              </div>
            </div>
            <p className="text-muted-foreground">{problem}</p>
          </div>
          <div className="flex items-start group">
            <div className="p-1 rounded-full bg-green-500/20 mr-2 mt-1 group-hover:scale-110 transition-transform">
              <Check className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-foreground">{solution}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </AnimateOnScroll>
);

export const ProblemSolution = () => {
  const features = [
    {
      title: "Hours Saved",
      problem: "Spend 45+ minutes writing each listing, feeling drained and uninspired",
      solution: "Generate complete, buyer-focused listings in under 2 minutes with just a few clicks",
      icon: <Clock className="h-5 w-5" />
    },
    {
      title: "SEO Supercharged",
      problem: "Guess which keywords might work, missing out on potential customers",
      solution: "Access real-time keyword data that shows exactly what buyers are searching for",
      icon: <Search className="h-5 w-5" />
    },
    {
      title: "Pro-Quality Content",
      problem: "Struggle with writer's block and wonder if your descriptions sound professional",
      solution: "Create compelling, error-free copy that turns browsers into buyers every time",
      icon: <PenTool className="h-5 w-5" />
    }
  ];

  return (
    <section className="w-full py-12 md:py-24 bg-muted/50 relative">
      {/* Subtle diagonal pattern background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(45deg,var(--primary)_25%,transparent_25%,transparent_50%,var(--primary)_50%,var(--primary)_75%,transparent_75%,transparent)] bg-[length:24px_24px]"></div>
      
      <div className="container px-4 md:px-6 relative">
        <AnimateOnScroll animation="fade-up" duration={500}>
          <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
            <div className="inline-flex h-6 animate-fade-in items-center rounded-full bg-primary/10 px-3 text-sm font-medium text-primary">
              Crafted for creative sellers
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                The <span className="text-primary">Smarter Way</span> to Sell on Etsy
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Focus on creating beautiful products, not wrestling with listing details. 
                See how Zippify transforms your Etsy shop experience:
              </p>
            </div>
          </div>
        </AnimateOnScroll>
        
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 mt-12">
          {features.map((feature, index) => (
            <Feature 
              key={index} 
              {...feature} 
              delay={index * 200}
            />
          ))}
        </div>
        
        <AnimateOnScroll animation="fade-up" delay={400} duration={500}>
          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              className="group hover:scale-105 transition-all duration-300"
            >
              Start Saving Time Today 
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};