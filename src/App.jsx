import React, { useState, useEffect } from 'react';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/common/PageTransition';
import { LandingPage } from './components/landing/LandingPage';
import { theme } from './styles/theme';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { CreateListing } from './components/workflow/CreateListing.jsx';

// Placeholder components for other routes
const MyListings = () => <div>My Listings Page (Coming Soon)</div>;
const Profile = () => <div>Profile Page (Coming Soon)</div>;

const AppContent = () => {
  const location = useLocation();

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Language state
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  // Workflow state
  const [workflowState, setWorkflowState] = useState({
    currentStep: null,
    completedSteps: []
  });

  // Update theme in localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Update language in localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleTheme = () => setIsDark(!isDark);
  const handleLanguageChange = (newLang) => setLanguage(newLang);

  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage
                  isDark={isDark}
                  onThemeToggle={toggleTheme}
                  language={language}
                  onLanguageChange={handleLanguageChange}
                />
              </PageTransition>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <DashboardPage
                  workflowState={workflowState}
                  setWorkflowState={setWorkflowState}
                />
              </PageTransition>
            }
          />
          <Route
            path="/create"
            element={
              <PageTransition>
                <CreateListing />
              </PageTransition>
            }
          />
          <Route
            path="/listings"
            element={
              <PageTransition>
                <MyListings />
              </PageTransition>
            }
          />
          <Route
            path="/profile"
            element={
              <PageTransition>
                <Profile />
              </PageTransition>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </ChakraProvider>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;