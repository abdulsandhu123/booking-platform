"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api, { loginRequest, registerRequest, getMeRequest } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read the persisted token only after mount (client-side), so this
  // component renders identically on the server and the first client pass.
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      try {
        const res = await getMeRequest();
        setUser(res.data);
      } catch {
        // Token invalid or expired — clear it.
        localStorage.removeItem("token");
        setToken(null);
        delete api.defaults.headers.common.Authorization;
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  async function login(email, password) {
    const res = await loginRequest({ email, password });
    localStorage.setItem("token", res.data.token);
    api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(name, email, password, role) {
    const res = await registerRequest({ name, email, password, role });
    localStorage.setItem("token", res.data.token);
    api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
