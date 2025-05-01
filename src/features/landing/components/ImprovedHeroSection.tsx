
import { Button } from "@/components/ui/button"
import { AnimateOnScroll } from "./AnimateOnScroll"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import HoverRevealImage from "@/components/HoverRevealImage"

const ImprovedHeroSection = () => {
  return (
    <section className="w-full py-12 md:py-24 bg-background dark:bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Content - Text and CTA */}
          <div className="space-y-6 md:space-y-8">
            <AnimateOnScroll>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-tight">
                Create Stunning Visual Galleries in Minutes
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-xl">
                Our innovative platform lets you design engaging visual experiences without any coding required.
              </p>
              <div className="pt-6">
                <Button 
                  size="lg" 
                  className="group shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-primary"
                  asChild
                >
                  <Link to="/login">
                    Create your first listing for free
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Right Content - Interactive Image */}
          <div className="flex items-center justify-center">
            <AnimateOnScroll delay={200}>
              <HoverRevealImage />
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ImprovedHeroSection