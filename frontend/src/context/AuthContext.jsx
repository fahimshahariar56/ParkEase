import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('parkease_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('parkease_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Persist token & user to localStorage whenever they change
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

  /**
   * Persist authenticated session data received from the API.
   */
  const _persistSession = useCallback((authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
  }, []);

  /**
   * Real API Login (Customer Default) — calls POST /api/v1/auth/customer/login.
   * Throws on failure so callers can surface the server error message.
   */
  const apiLogin = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    try {
      const res = await authApi.loginCustomer({ email, password });
      _persistSession(res.data.token, res.data.user);
      return res.data;
    } finally {
      setIsLoading(false);
    }
  }, [_persistSession]);

  /**
   * Customer-specific API Login — calls POST /api/v1/auth/customer/login.
   */
  const apiLoginCustomer = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    try {
      const res = await authApi.loginCustomer({ email, password });
      _persistSession(res.data.token, res.data.user);
      return res.data;
    } finally {
      setIsLoading(false);
    }
  }, [_persistSession]);

  /**
   * Admin-specific API Login — calls POST /api/v1/auth/admin/login.
   */
  const apiLoginAdmin = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    try {
      const res = await authApi.loginAdmin({ email, password });
      _persistSession(res.data.token, res.data.user);
      return res.data;
    } finally {
      setIsLoading(false);
    }
  }, [_persistSession]);

  /**
   * Real API Register — calls POST /api/v1/auth/register.
   * Throws on failure so callers can surface the server error message.
   */
  const apiRegister = useCallback(async ({ fullName, email, password, phone }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({ fullName, email, password, phone });
      _persistSession(res.data.token, res.data.user);
      return res.data;
    } finally {
      setIsLoading(false);
    }
  }, [_persistSession]);

  /**
   * Direct session setter — used by demo switcher and ProtectedRoute logic.
   */
  const login = useCallback((authToken, authUser) => {
    _persistSession(authToken, authUser);
  }, [_persistSession]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('parkease_token');
    localStorage.removeItem('parkease_user');
  }, []);

  /**
   * Demo role switcher — quick preview of route guards without a real backend call.
   */
  const setDemoRole = useCallback((role) => {
    if (role === 'ADMIN') {
      _persistSession('demo_admin_jwt_token', {
        id: 99,
        fullName: 'Admin Supervisor',
        email: 'admin@parkease.io',
        role: 'ADMIN',
      });
    } else {
      _persistSession('demo_customer_jwt_token', {
        id: 1,
        fullName: 'Demo Customer',
        email: 'customer@parkease.io',
        role: 'CUSTOMER',
      });
    }
  }, [_persistSession]);

  const value = {
    user,
    token,
    isLoading,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    isCustomer: user?.role === 'CUSTOMER',
    // API-wired actions
    apiLogin,
    apiLoginCustomer,
    apiLoginAdmin,
    apiRegister,
    // Direct session helpers
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
