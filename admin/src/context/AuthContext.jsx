import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  fetchCurrentUser,
  getStoredToken,
  login as loginRequest,
  logout as logoutRequest,
  setStoredToken,
  setUnauthorizedHandler,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 'checking' until we know whether the stored token is still valid.
  const [status, setStatus] = useState('checking');
  const [sessionExpired, setSessionExpired] = useState(false);

  const clearSession = useCallback((expired = false) => {
    setStoredToken(null);
    setUser(null);
    setStatus('anonymous');
    setSessionExpired(expired);
  }, []);

  // Any 401 from the API means the token no longer works: drop straight to login
  // instead of leaving the panel showing stale data it can no longer modify.
  useEffect(() => {
    setUnauthorizedHandler((httpStatus) => {
      if (httpStatus === 401) clearSession(true);
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (!getStoredToken()) {
        if (!cancelled) setStatus('anonymous');
        return;
      }
      try {
        const currentUser = await fetchCurrentUser();
        if (cancelled) return;
        setUser(currentUser);
        setStatus('authenticated');
      } catch {
        if (!cancelled) clearSession(false);
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(async (username, password) => {
    const loggedInUser = await loginRequest(username, password);
    setUser(loggedInUser);
    setStatus('authenticated');
    setSessionExpired(false);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus('anonymous');
    setSessionExpired(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAuthenticated: status === 'authenticated',
        isChecking: status === 'checking',
        sessionExpired,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
