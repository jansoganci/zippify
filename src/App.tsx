import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth components
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgetPassword from "./pages/ForgetPassword";

// App pages
import Index from "./pages/Index";
import CreateListing from "./features/etsyListing/pages/CreateListing";
import Listings from "./pages/Listings";
import Profile from "./pages/Profile";
import OptimizePattern from "./pages/optimizePattern";
import ReviewDraft from "./pages/ReviewDraft";
import ListingGeneration from "./pages/ListingGeneration";
import EditProductImage from "./features/imageEditing/EditImagePage";
import SeoKeywordAnalysis from "./pages/SeoKeywordAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          } />
          <Route path="/register" element={
            <AuthRedirect>
              <Register />
            </AuthRedirect>
          } />
          <Route path="/forgot-password" element={
            <AuthRedirect>
              <ForgetPassword />
            </AuthRedirect>
          } />

          {/* Dashboard Route */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />

          {/* Protected Application Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/create" element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          } />
          <Route path="/optimize" element={
            <ProtectedRoute>
              <OptimizePattern />
            </ProtectedRoute>
          } />
          <Route path="/review" element={
            <ProtectedRoute>
              <ReviewDraft />
            </ProtectedRoute>
          } />
          <Route path="/listing-generation" element={
            <ProtectedRoute>
              <ListingGeneration />
            </ProtectedRoute>
          } />
          <Route path="/edit-image" element={
            <ProtectedRoute>
              <EditProductImage />
            </ProtectedRoute>
          } />
          <Route path="/seo-keywords" element={
            <ProtectedRoute>
              <SeoKeywordAnalysis />
            </ProtectedRoute>
          } />
          <Route path="/listings" element={
            <ProtectedRoute>
              <Listings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;