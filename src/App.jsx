import React, { useState, useEffect } from 'react';
import { ChakraProvider, CSSReset, useColorMode } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/common/PageTransition';
import { LandingPage } from './components/landing/LandingPage';
import { theme } from './styles/theme';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { CreateListing } from './components/workflow/CreateListing.jsx';
import { ProfilePage } from './components/profile/ProfilePage';
import { AuthProvider } from './hooks/useAuth.jsx';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Placeholder component for My Listings
const MyListings = () => <div>My Listings Page (Coming Soon)</div>;

const AppContent = () => {
  const location = useLocation();

  // Theme handling
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

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

          {/* Auth routes */}
          <Route path="/auth">
            <Route
              path="login"
              element={
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              }
            />
            <Route
              path="register"
              element={
                <PageTransition>
                  <RegisterPage />
                </PageTransition>
              }
            />
            <Route
              path="forgot-password"
              element={
                <PageTransition>
                  <ForgotPasswordPage />
                </PageTransition>
              }
            />
            <Route
              path="reset-password"
              element={
                <PageTransition>
                  <ResetPasswordPage />
                </PageTransition>
              }
            />
            <Route
              path="verify-email"
              element={
                <PageTransition>
                  <VerifyEmailPage />
                </PageTransition>
              }
            />
          </Route>

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <PageTransition>
                  <DashboardPage
                    workflowState={workflowState}
                    setWorkflowState={setWorkflowState}
                  />
                </PageTransition>
              </PrivateRoute>
            }
          />
          <Route
            path="/create-listing"
            element={
              <PrivateRoute>
                <PageTransition>
                  <CreateListing />
                </PageTransition>
              </PrivateRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <PrivateRoute>
                <PageTransition>
                  <MyListings />
                </PageTransition>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <PageTransition>
                  <ProfilePage />
                </PageTransition>
              </PrivateRoute>
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;