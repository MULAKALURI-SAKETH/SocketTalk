import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChatUser } from '../types';

interface AuthContextType {
  isLoggedIn: boolean;
  user: ChatUser | null;
  login: (user: ChatUser) => void;
  logout: () => void;
}

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate(); // useNavigate must be called inside a router context

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // Initialize from localStorage on first render
    return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
  });

  const [user, setUser] = useState<ChatUser | null>(() => {
    // Restore the persisted user record from localStorage
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser) as ChatUser;
    } catch {
      return null;
    }
  });

  const login = (loggedInUser: ChatUser) => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'authenticated'); // Persist session token
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedInUser)); // Persist user record
    setUser(loggedInUser);
    setIsLoggedIn(true);
    navigate('/chat-home', { replace: true }); // Navigate to chat-home after successful login
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY); // Remove the token
    localStorage.removeItem(AUTH_USER_KEY); // Remove the user record
    setUser(null);
    setIsLoggedIn(false);
    navigate('/login', { replace: true }); // Redirect to login page after logout
  };

  // Optional: Add an effect to handle changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem(AUTH_TOKEN_KEY) !== null);
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser) as ChatUser);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};