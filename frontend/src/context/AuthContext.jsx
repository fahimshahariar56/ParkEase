import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('parkease_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('parkease_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    // Default demo customer profile for initial seamless preview
    return {
      id: 1,
      fullName: 'Shahariar Ahammad Fahim',
      email: 'customer@parkease.io',
      role: 'CUSTOMER',
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('parkease_token', token);
    } else {
      localStorage.removeItem('parkease_token');
    }

    if (user) {
      localStorage.setItem('parkease_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('parkease_user');
    }
  }, [token, user]);

  const login = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('parkease_token');
    localStorage.removeItem('parkease_user');
  };

  /**
   * Helper for demo switching between Customer and Admin roles
   */
  const setDemoRole = (role) => {
    if (role === 'ADMIN') {
      setUser({
        id: 99,
        fullName: 'Admin Supervisor',
        email: 'admin@parkease.io',
        role: 'ADMIN',
      });
      setToken('demo_admin_jwt_token');
    } else {
      setUser({
        id: 1,
        fullName: 'Shahariar Ahammad Fahim',
        email: 'customer@parkease.io',
        role: 'CUSTOMER',
      });
      setToken('demo_customer_jwt_token');
    }
  };

  const value = {
    user,
    token,
    isLoading,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    isCustomer: user?.role === 'CUSTOMER',
    login,
    logout,
    setDemoRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
