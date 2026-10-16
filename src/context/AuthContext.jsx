import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, setToken as saveToken, clearToken } from '../services/api';

// Criação do Contexto
const AuthContext = createContext(null);

// Função pura para decodificar o JWT e extrair as permissões diretamente do Back-end
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
      // ✅ A FONTE DA VERDADE: O cargo agora vem 100% do Banco de Dados via JWT!
      // Usamos fallback para 'funcionario' caso a API não envie o campo
      role: claims.role || claims.perfil || 'funcionario', 
    };
  } catch {
    return null;
  }
}

// Provedor do Contexto que envolverá a aplicação (App.jsx)
export function AuthProvider({ children }) {
  // Inicialização Preguiçosa (Lazy Initialization): 
  // Só lê o localStorage (getToken) na primeira vez que a aplicação abre, poupando processamento.
  const [user, setUser] = useState(() => {
    const token = getToken();
    return token ? decodeJwt(token) : null;
  });

  // Efeito de segurança: Valida a integridade do token ao montar a aplicação.
  // Se o token existir no navegador mas estiver corrompido/ilegível, limpamos a sessão.
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

  // Função disparada pela página de Login após receber o OK da API
  const login = (token) => {
    saveToken(token);
    // Atualiza o estado global imediatamente com os dados e permissões do Back-end
    setUser(decodeJwt(token));
  };

  // Função para encerrar a sessão
  const logout = () => {
    clearToken();
    setUser(null);
  };

  // Otimização de Performance: useMemo garante que os componentes filhos 
  // só re-renderizem se o objeto `user` realmente mudar.
  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook customizado para facilitar o consumo do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de um <AuthProvider>');
  }
  return context;
}