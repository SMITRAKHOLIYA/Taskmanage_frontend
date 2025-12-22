import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        return { success: true, user: response.data.user };
      } else {
        console.error("Login failed: No token in response", response.data);
        return { success: false, message: response.data.message || 'Login failed: Unexpected response from server', response };
      }
    } catch (error) {
      console.error("Login error", error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, email, password, role = 'user', companyName = null) => {
    try {
      await api.post('/auth/register', { username, email, password, role, company_name: companyName });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user || !user.user || !user.user.id) return;
    try {
      const response = await api.get(`/users/${user.user.id}?t=${new Date().getTime()}`);
      // Update the nested user object
      const updatedUser = { ...user, user: { ...user.user, ...response.data } };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
