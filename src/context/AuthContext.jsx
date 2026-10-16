import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, setToken as saveToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

// As claims casam com o que o JwtService.gerarToken() do backend grava:
// sub (email), id, name, pictureUrl, e agora: role.
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
    return {
      email: claims.sub,
      id: claims.id,
      name: claims.name,
      pictureUrl: claims.pictureUrl,
      // ✅ ADICIONADO: Extraímos o cargo do Token JWT (Fallback para 'funcionario')
      role: claims.role || claims.perfil || 'funcionario', 
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken();
    let decodedUser = token ? decodeJwt(token) : null;

    // ✅ HACK SÊNIOR: Forçar perfil de teste no Modo Dev
    const isMockMode = localStorage.getItem('@helptec-modo-dev') === 'true';
    if (isMockMode && decodedUser) {
      const devRole = localStorage.getItem('@helptec-dev-role');
      if (devRole) {
        decodedUser = { ...decodedUser, role: devRole };
      }
    }

    return decodedUser;
  });

  useEffect(() => {
    const token = getToken();
    if (token) {
      let decoded = decodeJwt(token);
      
      if (!decoded) {
        clearToken();
        setUser(null);
      } else {
        // Aplica o hack também caso o token mude sem desmontar a página
        const isMockMode = localStorage.getItem('@helptec-modo-dev') === 'true';
        if (isMockMode) {
          const devRole = localStorage.getItem('@helptec-dev-role');
          if (devRole) {
            decoded = { ...decoded, role: devRole };
            setUser(decoded);
          }
        }
      }
    }
  }, []);

  const login = (token) => {
    saveToken(token);
    let decodedUser = decodeJwt(token);

    // ✅ HACK SÊNIOR: Intercepta o momento exato do login no Modo Dev
    const isMockMode = localStorage.getItem('@helptec-modo-dev') === 'true';
    if (isMockMode) {
      const devRole = localStorage.getItem('@helptec-dev-role');
      if (devRole) {
        decodedUser = { ...decodedUser, role: devRole };
      }
    }

    setUser(decodedUser);
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