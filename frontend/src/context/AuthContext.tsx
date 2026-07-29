import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAxiosToken, getAxiosToken } from '../api/axios';

// 1. Define the User type based on your backend
export interface User {
  id: number;
  username: string;
  email: string;
}

// 2. Define the Context contract
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start in a loading state

  // Unified login function
  const login = (userData: User, token: string) => {
    setAxiosToken(token); // Save token in memory
    setUser(userData);    // Save user in context
  };

  const logout = () => {
    setAxiosToken(null);
    setUser(null);
  };

  const refreshStarted = React.useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/auth/refresh');

        if (response.data.accessToken && response.data.user) {
          setAxiosToken(response.data.accessToken);
          setUser(response.data.user);
        } else {
          setUser(null);
        }

      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (refreshStarted.current) {
      return;
    }

    refreshStarted.current = true;

    if (!getAxiosToken()) {
      checkSession();
    } else {
      setIsLoading(false);
    }

  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};