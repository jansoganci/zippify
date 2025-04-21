
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Search, 
  FilePlus, 
  Image, 
  FileText,
  Circle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { getOnboardingProgress, getProgressPercentage, isOnboardingComplete } from '@/utils/onboarding';
import { getPersonalizedGreeting } from '@/utils/greeting';

// Tips data for the carousel
const tips = [
  {
    id: 1,
    icon: <Lightbulb className="text-amber-500" />,
    prefix: "Did you know?",
    content: "Titles with 3-5 high-performing keywords convert best on Etsy."
  },
  {
    id: 2,
    icon: <Sparkles className="text-purple-500" />,
    prefix: "Pro Tip",
    content: "Use contrasting backgrounds for product images to boost click-through rates."
  },
  {
    id: 3,
    icon: <CheckCircle className="text-green-500" />,
    prefix: "Best Practice",
    content: "Stay consistent. Listing regularly improves your Etsy ranking."
  },
  {
    id: 4,
    icon: <Image className="text-blue-500" />,
    prefix: "Feature Highlight",
    content: "Struggling with mockups? Use our Edit Image tool for background removal."
  },
  {
    id: 5,
    icon: <FilePlus className="text-primary" />,
    prefix: "listify.digital Tip",
    content: "You can generate listing descriptions with AI from the Create Listing page."
  },
  {
    id: 6,
    icon: <Search className="text-indigo-500" />,
    prefix: "SEO Advice",
    content: "Regularly analyze trending keywords to stay ahead of the competition."
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [onboardingSteps, setOnboardingSteps] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [allComplete, setAllComplete] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [greeting, setGreeting] = useState('');
  
  // Load onboarding progress from localStorage
  useEffect(() => {
    setOnboardingSteps(getOnboardingProgress());
    setProgressPercentage(getProgressPercentage());
    setAllComplete(isOnboardingComplete());
    
    // Set personalized greeting
    setGreeting(getPersonalizedGreeting());
  }, []);
  
  // Auto-rotate tips every 6 seconds
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentTipIndex(prevIndex => (prevIndex + 1) % tips.length);
      }, 6000);
      
      return () => clearInterval(interval);
    }
  }, [isPaused]);
  
  const goToNextTip = () => {
    setCurrentTipIndex(prevIndex => (prevIndex + 1) % tips.length);
  };
  
  const goToPrevTip = () => {
    setCurrentTipIndex(prevIndex => (prevIndex - 1 + tips.length) % tips.length);
  };
  

  
  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back</h1>
          <p className="text-muted-foreground animate-fade-in">
            {greeting || "Let's boost your Etsy shop with AI-powered listings"}
          </p>
        </div>
      </section>
      
      {/* Quick Actions Section */}
      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <p className="text-muted-foreground">Jump into key features quickly</p>
        </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Card 
              onClick={() => navigate("/seo-keywords")} 
              className="hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer shadow-sm"
            >
              <CardHeader className="space-y-2">
                <div className="p-2 rounded-full bg-primary/10 w-fit">
                  <Search size={20} className="text-primary" />
                </div>
                <CardTitle className="text-lg">SEO Analysis</CardTitle>
                <CardDescription>Find the best keywords for your listing</CardDescription>
              </CardHeader>
            </Card>
            
            <Card 
              onClick={() => navigate("/create")} 
              className="hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer shadow-sm"
            >
              <CardHeader className="space-y-2">
                <div className="p-2 rounded-full bg-primary/10 w-fit">
                  <FilePlus size={20} className="text-primary" />
                </div>
                <CardTitle className="text-lg">Create Listing</CardTitle>
                <CardDescription>Generate an AI-powered Etsy listing</CardDescription>
              </CardHeader>
            </Card>
            
            <Card 
              onClick={() => navigate("/edit-image")} 
              className="hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer shadow-sm"
            >
              <CardHeader className="space-y-2">
                <div className="p-2 rounded-full bg-primary/10 w-fit">
                  <Image size={20} className="text-primary" />
                </div>
                <CardTitle className="text-lg">Edit Image</CardTitle>
                <CardDescription>Enhance your product photos with AI</CardDescription>
              </CardHeader>
            </Card>
            
            <Card 
              onClick={() => navigate("/listings")} 
              className="hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer shadow-sm"
            >
              <CardHeader className="space-y-2">
                <div className="p-2 rounded-full bg-primary/10 w-fit">
                  <FileText size={20} className="text-primary" />
                </div>
                <CardTitle className="text-lg">My Listings</CardTitle>
                <CardDescription>View and manage your created listings</CardDescription>
              </CardHeader>
            </Card>
          </div>
      </section>
      
      {/* Getting Started Section */}
      <section className="mb-8">
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Getting Started</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Complete these steps to set up your account
                </CardDescription>
              </div>
              
              <div className="text-sm font-medium">
                {progressPercentage}% Complete
              </div>
            </div>
          </CardHeader>
          
          <div className="px-6">
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              {onboardingSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {step.completed ? (
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle size={14} className="text-primary" />
                      </div>
                    ) : (
                      <Circle size={16} className="text-muted-foreground" />
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                  
                  {!step.completed && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto text-primary"
                      onClick={() => {
                        // Navigate to the appropriate page based on step ID
                        switch(step.id) {
                          case 'profile':
                            navigate('/profile');
                            break;
                          case 'keyword':
                            navigate('/seo-keywords');
                            break;
                          case 'listing':
                            navigate('/create');
                            break;
                          case 'image':
                            navigate('/edit-image');
                            break;
                        }
                      }}
                    >
                      Start
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {allComplete && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium">All steps completed!</h3>
                <p className="text-sm text-muted-foreground">You're all set to make the most of Zippify</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      
      {/* Tips & Inspiration Carousel */}
      <section className="mb-8">
        <Card 
          className="shadow-sm overflow-hidden" 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Tips & Inspiration</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Helpful advice to boost your Etsy success
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full" 
                  onClick={goToPrevTip}
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full" 
                  onClick={goToNextTip}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="relative overflow-hidden h-[120px]">
              {tips.map((tip, index) => (
                <div 
                  key={tip.id}
                  className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out ${index === currentTipIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
                >
                  <div className="bg-muted/10 rounded-lg p-4 flex items-start gap-4">
                    <div className="p-2 rounded-full bg-background shadow-sm">
                      {tip.icon}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm mb-1">{tip.prefix}</h3>
                      <p className="text-muted-foreground">{tip.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-1.5 mt-4">
              {tips.map((_, index) => (
                <button
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${index === currentTipIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted'}`}
                  onClick={() => setCurrentTipIndex(index)}
                  aria-label={`Go to tip ${index + 1}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
      

    </DashboardLayout>
  );
};

export default Index;
