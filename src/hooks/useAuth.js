import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const USER_DATA_KEY = 'zippify_user';
const AuthContext = createContext(null);

// Provider component that wraps the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage during first render
    try {
      const storedUser = localStorage.getItem(USER_DATA_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      localStorage.removeItem(USER_DATA_KEY);
      return null;
    }
  });

  const login = useCallback((userData) => {
    // Validate required user data
    if (!userData || !userData.id || !userData.email) {
      throw new Error('Invalid user data');
    }

    // Store user data
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_DATA_KEY);
    setUser(null);
  }, []);

  // Keep localStorage in sync with state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_DATA_KEY);
    }
  }, [user]);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
