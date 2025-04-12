
import { HeroSection } from "@/features/landing/components/HeroSection";
import { ProblemSolution } from "@/features/landing/components/ProblemSolution";
import { LiveDemoPreview } from "@/features/landing/components/LiveDemoPreview";
import { StickyCTA } from "@/features/landing/components/StickyCTA";
import { ScrollingStickyButton } from "@/features/landing/components/ScrollingStickyButton";
import Footer from "@/components/layout/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full h-16 border-b bg-background z-10 flex items-center">
        <div className="container flex items-center justify-between">
          <div className="text-xl font-bold">Zippify</div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="/dashboard" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Dashboard</a>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        <HeroSection />
        <div id="features">
          <ProblemSolution />
        </div>
        <div id="how-it-works">
          <LiveDemoPreview />
        </div>
        <StickyCTA />
      </main>
      
      <footer className="w-full py-6 border-t bg-background">
        <Footer />
      </footer>
      
      <ScrollingStickyButton />
    </div>
  );
};

export default LandingPage;