import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import adminApi from '../services/adminApi';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [adminUser, setAdminUser] = useState(null);
  const [status, setStatus] = useState('idle');

  const isAuthenticated = !!adminUser;

  useEffect(() => {
    if (!token) {
      setAdminUser(null);
      return;
    }
    setStatus('loading');
    adminApi.me(token)
      .then(setAdminUser)
      .catch(() => {
        localStorage.removeItem('adminToken');
        setToken('');
        setAdminUser(null);
      })
      .finally(() => setStatus('ready'));
  }, [token]);

  const login = async (email, password) => {
    const data = await adminApi.login(email, password);
    if (!data || !data.token) {
      throw new Error('Admin login failed: No token received');
    }
    localStorage.setItem('adminToken', data.token);
    setToken(data.token);
    setAdminUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setAdminUser(null);
  };

  const value = useMemo(() => ({
    token,
    adminUser,
    status,
    login,
    logout,
    isAuthenticated,
  }), [token, adminUser, status]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => useContext(AdminAuthContext);
