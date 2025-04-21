
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import ImprovedHeroSection from "@/features/landing/components/ImprovedHeroSection";
import { ProblemSolution } from "@/features/landing/components/ProblemSolution";
import { LiveDemoPreview } from "@/features/landing/components/LiveDemoPreview";
import { StickyCTA } from "@/features/landing/components/StickyCTA";
import { ScrollingStickyButton } from "@/features/landing/components/ScrollingStickyButton";
import ProcessSteps from '@/features/landing/components/ProcessSteps';

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const useDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(useDark);
    document.documentElement.classList.toggle('dark', useDark);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full h-16 border-b bg-background z-10 flex items-center">
        <div className="container flex items-center justify-between">
          <div className="text-xl font-bold">Zippify</div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="/dashboard" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Dashboard</a>
            <button 
              onClick={toggleTheme} 
              className="ml-4 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        <ImprovedHeroSection />
        <div id="features">
          <ProblemSolution />
        </div>
        <ProcessSteps />
        <div id="how-it-works">
          <LiveDemoPreview />
        </div>
        <StickyCTA />
      </main>
      
      <footer className="w-full py-6 border-t bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-lg font-bold mb-4">Zippify</div>
              <p className="text-sm text-muted-foreground">
                AI-powered tools to help Etsy sellers create professional listings and boost sales.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-bold mb-2">Legal</div>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-bold mb-2">Company</div>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Zippify. All rights reserved.
          </div>
        </div>
      </footer>
      
      <ScrollingStickyButton />
    </div>
  );
};

export default LandingPage;
