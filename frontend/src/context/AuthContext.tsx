import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAxiosToken, getAxiosToken } from '../api/axios';

export interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

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
  const [isLoading, setIsLoading] = useState(true);

  const login = (userData: User, token: string) => {
    setAxiosToken(token);
    setUser(userData);
  };

  const logout = () => {
    setAxiosToken(null);
    setUser(null);
  };

  const refreshStarted = React.useRef(false);

   useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.post<{ success: boolean; accessToken?: string; user?: User }>('/auth/refresh');

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