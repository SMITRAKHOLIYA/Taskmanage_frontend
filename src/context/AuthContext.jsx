import React, { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password, retryCount = 0) => {
    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const response = await api.post(
        "/auth/login",
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (response.data?.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
        return { success: true, user: response.data.user };
      }

      return { success: false, message: response.data?.message || "Login failed" };
    } catch (err) {
      // Auto-retry for 500 errors or network errors (Cold Start mitigation)
      if (retryCount < 2 && (!err.response || err.response.status >= 500 || err.code === 'ERR_NETWORK')) {
        console.log(`Login failed (Attempt ${retryCount + 1}). Retrying in ${retryCount + 1}s...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        return login(email, password, retryCount + 1);
      }
      return { success: false, message: err.message || "Login failed" };
    }
  };

  const register = async (username, email, password, role = "user", companyName = null, companySize = null, industry = null, companyId = null) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (companyName) formData.append("company_name", companyName);
      if (companySize) formData.append("company_size", companySize);
      if (industry) formData.append("industry", industry);
      if (companyId) formData.append("company_id", companyId);

      const response = await api.post(
        "/auth/register",
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      // Auto-login or return user data if provided by backend
      if (response.data?.user) {
        // If the backend returns a token immediately upon registration, we could login.
        // For now, the backend returns "user registered successfully" and updated to return user info.
        // Let's stick to returning success, but if I wanted auto-login I needs a token.
        // AuthController::register currently DOES NOT return a token. So we still need to login separately.
      }

      return { success: true, ...response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user?.user?.id) return;
    try {
      const response = await api.get(`/users/${user.user.id}`);
      if (response.data) {
        const updatedUser = { ...user, user: response.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error("Failed to refresh user data", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
