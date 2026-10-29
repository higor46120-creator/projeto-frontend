import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('@HelpTec:token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem('@HelpTec:token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('@HelpTec:token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};