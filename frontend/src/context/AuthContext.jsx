import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hr_token');
    const stored = localStorage.getItem('hr_user');
    if (token && stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('hr_token', token);
    localStorage.setItem('hr_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
