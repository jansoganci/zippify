import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const USER_DATA_KEY = 'zippify_user';

// Create context with default value
export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false
});

// Provider component that wraps the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
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
    if (!userData || !userData.id || !userData.email) {
      throw new Error('Invalid user data');
    }
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_DATA_KEY);
    setUser(null);
  }, []);

  // Debug useEffect to monitor user state changes
  useEffect(() => {
    console.log('Current User State:', {
      user,
      isAuthenticated: !!user,
      storedUser: localStorage.getItem(USER_DATA_KEY)
    });
  }, [user]);

  const contextValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

