
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { Link } from "react-router-dom";

export const StickyCTA = () => {
  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-background to-primary/5 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container px-4 md:px-6 relative">
        <AnimateOnScroll animation="fade-up" duration={500}>
          <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium shadow-sm border border-border/30">
              <span className="text-primary font-semibold">Beta</span>
              <span className="text-muted-foreground">We're just getting started</span>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Start Creating <span className="text-primary">Better Listings</span> Today
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed mx-auto">
                Streamline your workflow with AI-powered tools designed to help you create professional listings faster and more effectively.
              </p>
            </div>
            
            <div className="w-full max-w-sm mt-10">
              <Button 
                size="lg" 
                className="w-full text-md h-12 group shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-primary"
                asChild
              >
                <Link to="/login">
                  Try Listify Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">No credit card required · 14-day free trial</p>
            </div>
          </div>
        </AnimateOnScroll>
        
        <AnimateOnScroll animation="fade-up" delay={300} duration={500}>
          <div className="mt-12 md:mt-16 bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl p-6 md:p-8 max-w-3xl mx-auto shadow-md">
            <h3 className="text-xl md:text-2xl font-semibold text-center mb-6">What You'll Get</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <h4 className="font-medium">SEO Keyword Research</h4>
                  <p className="text-sm text-muted-foreground">Find the best keywords to improve your listing visibility</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <h4 className="font-medium">AI Listing Generator</h4>
                  <p className="text-sm text-muted-foreground">Create compelling titles, descriptions and tags</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <h4 className="font-medium">Image Enhancement</h4>
                  <p className="text-sm text-muted-foreground">Remove backgrounds and enhance product photos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <h4 className="font-medium">Time-Saving Workflow</h4>
                  <p className="text-sm text-muted-foreground">Streamlined process from research to publishing</p>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};
