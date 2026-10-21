import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, setToken as saveToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

// ✅ Dicionário de Perfis (ACL Front-end)
const EMAIL_ROLE_MAP = {
  'gestor@helptec.com': 'gestor',
  'suporte@helptec.com': 'suporte',
  'aprovador@helptec.com': 'aprovador',
};

// Função pura para decodificar o JWT e extrair as permissões
function decodeJwt(token) {
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = decodeURIComponent(
      atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    const claims = JSON.parse(payloadJson);
    const userEmail = claims.sub; 
    
    // Define o cargo baseado no dicionário ou fallback da API
    const assignedRole = EMAIL_ROLE_MAP[userEmail] || claims.role || claims.perfil || 'funcionario';
    
    return {
      email: userEmail,
      id: claims.id,
      name: claims.name,
      pictureUrl: claims.pictureUrl,
      role: assignedRole,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken();
    return token ? decodeJwt(token) : null;
  });

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeJwt(token);
      if (!decoded) {
        clearToken();
        setUser(null);
      }
    }
  }, []);

  const login = (token) => {
    saveToken(token);
    setUser(decodeJwt(token));
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de um <AuthProvider>');
  }
  return context;
}