import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState('idle');

  const isAuthenticated = !!user;

  useEffect(() => {
    if (!token) { setUser(null); setStatus('ready'); return; }
    setStatus('loading');
    api.get('/auth/me')
      .then((res) => {
        const { user: u, unreadCount: uc } = res.data.data;
        setUser(u);
        setUnreadCount(uc || 0);
        localStorage.setItem('user', JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken('');
        setUser(null);
      })
      .finally(() => setStatus('ready'));
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: t, user: u } = res.data.data;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return res.data.data;
  };

  const register = async (name, username, email, password, role = 'student') => {
    const res = await api.post('/auth/register', { name, username, email, password, role });
    const { token: t, user: u } = res.data.data;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return res.data.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setUnreadCount(0);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = useMemo(() => ({
    token, user, status, login, register, logout, updateUser,
    isAuthenticated, unreadCount, setUnreadCount,
  }), [token, user, status, unreadCount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
