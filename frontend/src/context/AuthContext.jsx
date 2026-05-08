import React, { createContext, useState, useContext } from 'react';
import authService from '../services/authService';
import { User } from '../models/User';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getInitialUser = () => {
  try {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    if (token && raw) {
      const parsed = JSON.parse(raw);
      return new User(parsed);
    }
  } catch (e) {
    console.error('Auth init error:', e);
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (userData) => {
    try {
      setError(null);
      const data = await authService.register(userData);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setUser(new User(data.user));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const data = await authService.login(credentials);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setUser(new User(data.user));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};