import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { userService } from '../shared/services/userService';
import { notificacaoService } from '../shared/services/notificacaoService';

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

  // Para mandar o token de notificação só uma vez por login
  const notificacoesRegistradasPara = useRef(null);

  useEffect(() => {
    if (!token) return undefined;
    let ativo = true;
    userService
      .me()
      .then((me) => {
        if (!ativo) return;
        setUsuario(me);
        setErroUsuario(false);
        // Liga as notificações push deste navegador à conta (PUT /usuarios/me/fcm-token)
        if (me?.idUsuario && notificacoesRegistradasPara.current !== me.idUsuario) {
          notificacoesRegistradasPara.current = me.idUsuario;
          notificacaoService.registrar();
        }
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
    // Avisa o back para parar de mandar push para este navegador (antes de apagar o token)
    notificacaoService.remover(localStorage.getItem('@HelpTec:token'));
    notificacoesRegistradasPara.current = null;
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