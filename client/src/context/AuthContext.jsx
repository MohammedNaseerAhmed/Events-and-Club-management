import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState('idle');
  const [authLoading, setAuthLoading] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    if (!token) {
      setUser(null);
      setStatus('ready');
      return;
    }
    setStatus('loading');
    api.get('/auth/me')
      .then((res) => {
        const { user: u, unreadCount: uc } = res.data.data;
        setUser(u);
        setUnreadCount(uc || 0);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken('');
        setUser(null);
      })
      .finally(() => setStatus('ready'));
  }, [token]);

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: t, user: u } = res.data.data;
      localStorage.setItem(TOKEN_KEY, t);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      setToken(t);
      setUser(u);
      return res.data.data;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (name, username, email, password, role = 'student') => {
    if (typeof password === 'undefined' && typeof email === 'string' && typeof username === 'string') {
      password = email;
      email = username;
      username = name;
    }
    setAuthLoading(true);
    try {
      const res = await api.post('/auth/register', { name, username, email, password, role });
      const { token: t, user: u } = res.data.data || {};
      if (t && u) {
        localStorage.setItem(TOKEN_KEY, t);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        setToken(t);
        setUser(u);
      }
      return res.data.data;
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyEmailOtp = async (email, otp) => {
    setAuthLoading(true);
    try {
      const res = await api.post('/auth/verify-email', { email, otp });
      const { token: t, user: u } = res.data.data || {};
      if (t && u) {
        localStorage.setItem(TOKEN_KEY, t);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        setToken(t);
        setUser(u);
      }
      return res.data.data;
    } finally {
      setAuthLoading(false);
    }
  };

  const resendVerificationOtp = async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
    setUnreadCount(0);
  };

  const refreshToken = async () => {
    // Placeholder for refresh token flow when backend supports it (e.g. httpOnly refresh cookie).
    return Promise.resolve(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const value = useMemo(
    () => ({
      token,
      user,
      status,
      authLoading,
      login,
      register,
      verifyEmailOtp,
      resendVerificationOtp,
      logout,
      refreshToken,
      updateUser,
      isAuthenticated,
      unreadCount,
      setUnreadCount,
    }),
    [token, user, status, authLoading, unreadCount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
