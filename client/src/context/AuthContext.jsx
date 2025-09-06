import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready

  const isAuthenticated = !!user;

  useEffect(() => {
    if (!token) {
      setUser(null);
      setStatus('ready');
      return;
    }
    
    // Set loading state immediately
    setStatus('loading');
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setStatus('ready');
    }, 5000);
    
    api.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setStatus('ready');
      });
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (!data || !data.token) {
      throw new Error('Login failed: No token received');
    }
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, role = 'student') => {
    const data = await api.register(name, email, password, role);
    if (!data || !data.token) {
      throw new Error('Register failed: No token received');
    }
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const value = useMemo(() => ({
    token,
    user,
    status,
    login,
    register,
    logout,
    isAuthenticated,
  }), [token, user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
