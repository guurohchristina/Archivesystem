
/*import { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load saved token if any
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axiosClient.get("/auth/me")
        .then(res => setUser(res.data.user))
        .catch(() => setUser(null));
    }
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const res = await axiosClient.post("/auth/login", { email, password });

    // save token
    localStorage.setItem("token", res.data.token);
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

    setUser(res.data.user);
  };

  // REGISTER
  const register = async (data) => {
    const res = await axiosClient.post("/auth/register", data);

    // save token
    localStorage.setItem("token", res.data.token);
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

    setUser(res.data.user);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    delete axiosClient.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};*/


/*import { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // check saved session
  useEffect(() => {
    axiosClient.get("/auth/me")
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const login = async (email, password) => {
    const res = await axiosClient.post("/auth/login", { email, password });
    setUser(res.data.user);
  };

  const register = async (data) => {
    const res = await axiosClient.post("/auth/register", data);
    setUser(res.data.user);
  };

  const logout = () => {
    axiosClient.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};*/
/*

import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Hardcoded test user
  const TEST_USER = {
    name: "tina",
    email: "tina@example.com",
    role: "admin", // or "admin" if you want admin access
    password: "password123" // only for reference
  };

  const login = async (email, password) => {
    // Check if input matches test user
    if (email === TEST_USER.email && password === TEST_USER.password) {
      setUser(TEST_USER);
      return true;
    } else {
      alert("Invalid credentials");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};*/


// src/context/AuthContext.jsx
/*import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Register function - connects to your backend
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      // Save user data and token
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      setUser(result.data.user);

      return result;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function - connects to your backend
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Hardcoded admin credentials (as per your requirement)
      if (email === "admin@archive.com" && password === "admin123") {
        const adminUser = {
          id: 0,
          name: "System Admin",
          email: "admin@archive.com",
          role: "admin",
          created_at: new Date().toISOString()
        };
        
        const adminToken = "admin-hardcoded-token"; // In real app, get from backend
        
        localStorage.setItem("token", adminToken);
        localStorage.setItem("user", JSON.stringify(adminUser));
        setUser(adminUser);
        
        return { success: true, data: { user: adminUser, token: adminToken } };
      }

      // Regular user login - call your backend API
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      // Save user data and token
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      setUser(result.data.user);

      return result;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      register,
      login,
      logout,
      loading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};*/


// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use your backend's PUBLIC URL (replace with your actual URL)
  //const API_BASE = "https://improved-memory-xjpqw5rr799fvw5x-3000.app.github.dev/";

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  console.log("🌐 API Base URL:", API_BASE); // Add this to debug
  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      console.log("Sending registration to:", `${API_BASE}/auth/register`);
      
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password
        }),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Registration result:", result);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Save user data and token
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      setUser(result.data.user);

      return result;
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Hardcoded admin credentials
      if (email === "admin@archive.com" && password === "admin123") {
        const adminUser = {
          id: 0,
          name: "System Admin",
          email: "admin@archive.com",
          role: "admin",
          created_at: new Date().toISOString()
        };
        
        const adminToken = "admin-hardcoded-token";
        
        localStorage.setItem("token", adminToken);
        localStorage.setItem("user", JSON.stringify(adminUser));
        setUser(adminUser);
        
        return { success: true, data: { user: adminUser, token: adminToken } };
      }

      console.log("Sending login to:", `${API_BASE}/auth/login`);
      
      // Regular user login
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Login result:", result);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Save user data and token
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      setUser(result.data.user);

      return result;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      register,
      login,
      logout,
      loading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};