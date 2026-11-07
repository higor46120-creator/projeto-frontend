import React, { createContext, useCallback, useEffect, useState } from 'react';
import { userService } from '../shared/services/userService';

export const AuthContext = createContext();

function lerTokenSalvo() {
  try {
    return localStorage.getItem('@HelpTec:token');
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  // Lê o token salvo já na primeira renderização. Se lesse depois (num useEffect),
  // o PrivateRoute veria "deslogado" por um instante e mandaria para o login a cada F5.
  const [token, setToken] = useState(lerTokenSalvo);

  // Dados de quem está logado, vindos de GET /usuarios/me:
  // { idUsuario, nome, email, role, area }. O "role" define a área de cada conta.
  const [usuario, setUsuario] = useState(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(() => !!lerTokenSalvo());
  const [erroUsuario, setErroUsuario] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!token) return undefined;
    let ativo = true;
    userService
      .me()
      .then((me) => {
        if (!ativo) return;
        setUsuario(me);
        setErroUsuario(false);
      })
      .catch(() => {
        if (!ativo) return;
        setUsuario(null);
        setErroUsuario(true);
      })
      .finally(() => {
        if (ativo) setCarregandoUsuario(false);
      });
    return () => {
      ativo = false;
    };
  }, [token, tentativa]);

  const login = useCallback((newToken) => {
    localStorage.setItem('@HelpTec:token', newToken);
    setCarregandoUsuario(true);
    setErroUsuario(false);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('@HelpTec:token');
    setToken(null);
    setUsuario(null);
    setCarregandoUsuario(false);
    setErroUsuario(false);
  }, []);

  // Tenta buscar o /usuarios/me de novo (ex.: o back estava fora do ar)
  const recarregarUsuario = useCallback(() => {
    setCarregandoUsuario(true);
    setErroUsuario(false);
    setTentativa((n) => n + 1);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        login,
        logout,
        usuario,
        perfil: usuario?.role ?? null,
        carregandoUsuario,
        erroUsuario,
        recarregarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};