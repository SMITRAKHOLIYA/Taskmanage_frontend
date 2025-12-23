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

  const login = async (email, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      console.log("DEBUG: Posting to /auth/login with baseURL:", api.defaults.baseURL);
      const response = await api.post(
        "auth/login",
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
      return { success: false, message: "Login failed" };
    }
  };

  const register = async (username, email, password, role = "user", companyName = null) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (companyName) formData.append("company_name", companyName);

      await api.post(
        "auth/register",
        formData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      return { success: true };
    } catch {
      return { success: false, message: "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
