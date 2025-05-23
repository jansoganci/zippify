import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import ImprovedHeroSection from "@/features/landing/components/ImprovedHeroSection";
import { ProblemSolution } from "@/features/landing/components/ProblemSolution";
import { LiveDemoPreview } from "@/features/landing/components/LiveDemoPreview";
import { StickyCTA } from "@/features/landing/components/StickyCTA";
import ProcessSteps from '@/features/landing/components/ProcessSteps';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full h-16 border-b bg-background z-50 relative flex items-center">
        <div className="container flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/images/logo.svg" 
              alt="Listify" 
              className="h-8 w-auto"
            />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Login</Link>
            <button 
              onClick={toggleTheme} 
              className="ml-4 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg md:hidden z-40">
            <nav className="container py-4 flex flex-col space-y-4">
              <a 
                href="#features" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={closeMobileMenu}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={closeMobileMenu}
              >
                How It Works
              </a>
              <Link 
                to="/login" 
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                onClick={closeMobileMenu}
              >
                Login
              </Link>
            </nav>
          </div>
        )}
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
      
      
      <Footer />
    </div>
  );
};

export default LandingPage;
