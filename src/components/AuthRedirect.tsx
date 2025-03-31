import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface AuthRedirectProps {
  children: ReactNode;
}

const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem("zippify_token");
    setIsAuthenticated(!!token);
  }, []);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if not authenticated
  return <>{children}</>;
};

export default AuthRedirect;
