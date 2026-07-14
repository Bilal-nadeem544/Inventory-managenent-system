import { createContext, useContext, useState, useEffect } from "react";
import { setAccessToken } from "../api/client";
import { signupRequest, loginRequest, refreshRequest, logoutRequest } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const data = await refreshRequest();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login({ identifier, password }) {
    const data = await loginRequest({ identifier, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  }

  async function signup(formData) {
    const data = await signupRequest(formData);
    return data;
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}