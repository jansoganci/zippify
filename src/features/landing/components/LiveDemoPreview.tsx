
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";

export const LiveDemoPreview = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden bg-background">
      {/* Subtle gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20 pointer-events-none"></div>
      
      <div className="container px-4 md:px-6 relative">
        <AnimateOnScroll animation="fade-up" duration={500}>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-flex h-6 animate-fade-in items-center rounded-full bg-primary/10 px-3 text-sm font-medium text-primary">
              <Zap size={16} className="mr-2" />
              See the magic happen
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                From Idea to <span className="text-primary">Perfect Listing</span> in Minutes
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed mx-auto">
                No more staring at a blank screen. Just add your basic product details, 
                and watch as Zippify transforms them into a complete, professional listing.
              </p>
            </div>
          </div>
        </AnimateOnScroll>
        
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <AnimateOnScroll animation="fade-right" delay={200} duration={500}>
            <div className="space-y-6">
              <Card className="hover:shadow-md transition-all duration-300 border-primary/10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary text-sm">1</span>
                    You Provide the Basics
                  </h3>
                  <div className="space-y-4">
                    <div className="transition-all duration-300 hover:bg-muted/50 p-2 rounded-md">
                      <p className="text-sm font-medium mb-1 text-primary">Product Name</p>
                      <p className="p-2 bg-muted rounded-md">Hand-knitted Alpaca Wool Sweater</p>
                    </div>
                    
                    <div className="transition-all duration-300 hover:bg-muted/50 p-2 rounded-md">
                      <p className="text-sm font-medium mb-1 text-primary">Brief Description</p>
                      <p className="p-2 bg-muted rounded-md">Warm sweater made from alpaca wool in blue color, size medium.</p>
                    </div>
                    
                    <div className="transition-all duration-300 hover:bg-muted/50 p-2 rounded-md">
                      <p className="text-sm font-medium mb-1 text-primary">Product Image</p>
                      <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <svg className="w-10 h-10 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <p className="text-xs mt-2">Your product photo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimateOnScroll>
          
          <AnimateOnScroll animation="fade-left" delay={400} duration={500}>
            <Card className="bg-gradient-to-br from-background to-muted/30 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary text-sm">2</span>
                  Zippify Creates a Complete Listing
                </h3>
                <div className="space-y-4">
                  <div className="transition-all duration-300 hover:bg-background p-2 rounded-md">
                    <p className="text-sm font-medium mb-1 text-primary">SEO-Optimized Title</p>
                    <p className="p-2 bg-muted rounded-md border-l-2 border-primary">Hand-knitted 100% Alpaca Wool Sweater | Cozy Handmade Winter Pullover | Eco-Friendly Knitwear | Blue Medium Size</p>
                  </div>
                  
                  <div className="transition-all duration-300 hover:bg-background p-2 rounded-md">
                    <p className="text-sm font-medium mb-1 text-primary">Professional Description</p>
                    <div className="p-2 bg-muted rounded-md h-32 overflow-y-auto text-left border-l-2 border-primary">
                      <p className="text-sm">
                        Wrap yourself in luxurious comfort with this handcrafted alpaca wool sweater, 
                        lovingly knitted to provide exceptional warmth without the bulk. 
                        Each stitch represents our commitment to quality craftsmanship and sustainable fashion...
                      </p>
                    </div>
                  </div>
                  
                  <div className="transition-all duration-300 hover:bg-background p-2 rounded-md">
                    <p className="text-sm font-medium mb-1 text-primary">SEO Tags (Based on Real Searches)</p>
                    <div className="flex flex-wrap gap-2">
                      {["alpaca wool", "handmade sweater", "blue knitwear", "winter pullover", "eco-friendly"].map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full hover:bg-primary/20 transition-colors cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="transition-all duration-300 hover:bg-background p-2 rounded-md">
                    <p className="text-sm font-medium mb-1 text-primary">Enhanced Image</p>
                    <AspectRatio ratio={4/3} className="bg-muted rounded-md overflow-hidden border-l-2 border-primary">
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-primary/5 to-secondary/5">
                        <div className="flex flex-col items-center text-muted-foreground">
                          <svg className="w-12 h-12 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                          </svg>
                          <p className="text-sm mt-2">Professionally enhanced image</p>
                          <p className="text-xs mt-1">With improved lighting, background removal, and composition</p>
                        </div>
                      </div>
                    </AspectRatio>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </div>
        
        <AnimateOnScroll animation="fade-up" delay={600} duration={500}>
          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              className="group bg-primary hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Try It With Your Product
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              No technical skills required. Just upload and let AI do the work.
            </p>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};