
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreateListing from "./pages/CreateListing";
import Listings from "./pages/Listings";
import Profile from "./pages/Profile";
import OptimizePattern from "./pages/optimizePattern";
import ReviewDraft from "./pages/ReviewDraft";
import ListingGeneration from "./pages/ListingGeneration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<CreateListing />} />
          <Route path="/optimize" element={<OptimizePattern />} />
          <Route path="/review" element={<ReviewDraft />} />
          <Route path="/listing-generation" element={<ListingGeneration />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
