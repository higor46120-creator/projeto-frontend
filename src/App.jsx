// src/App.jsx
import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { PrivateRoute } from './shared/components/PrivateRoute';

import './App.css';
import splashImage from './assets/print certo.jpg'; 
import { IrParaGoogle, RetornoDoGoogle } from './pages/login/LoginGoogle';
import { ROTA_RETORNO_GOOGLE, abaJaPassouPeloGoogle, googleConfigurado, iniciarLoginGoogle } from './utils/loginGoogle';
import ApproverPage from './pages/aprovador/ApproverPage';
import CandidatePage from './pages/candidato/CandidatePage';
import MeusChamadosPage from './pages/chamados/MeusChamadosPage';
import SupportPage from './pages/suporte/SupportPage';
import WebmailPage from './pages/webmail/WebmailPage';
import ManagerPage from './pages/gestor/ManagerPage';
import { PERFIL, rotaDoPerfil } from './utils/perfis';

// Leva a conta logada para a área do seu perfil (USER -> Meus Chamados, APROVADOR -> /aprovador ...)
const IrParaMinhaArea = () => {
  const { perfil } = useContext(AuthContext);
  return <Navigate to={rotaDoPerfil(perfil)} replace />;
};

// Componente Dashboard atualizado com botão de Logout
const Dashboard = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="main-content text-white flex flex-col items-center justify-center min-h-screen bg-[#050505]">
      <h1 className="text-3xl font-bold mb-4">Bem-vindo à HelpTec!</h1>
      <p className="text-gray-400 mb-8">Este é o seu ambiente de trabalho protegido.</p>
      <button 
        onClick={logout}
        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#be123c] to-[#4338ca] text-white font-semibold hover:opacity-85 transition-opacity cursor-pointer"
      >
        Sair da Conta (Logout)
      </button>
    </div>
  );
};

// Ordem ao abrir o site numa aba nova:
//   1. "Escolha uma conta" do Google (mesmo que já exista um login salvo)
//   2. volta em /login/callback, troca o token do Google pelo do HelpTec e marca a aba
//   3. tela de abertura e depois a área da conta
// F5 na mesma aba: a aba já está marcada, então vai direto para a tela de abertura.
function temTokenSalvo() {
  try {
    return Boolean(localStorage.getItem('@HelpTec:token'));
  } catch {
    return false;
  }
}

function estaVoltandoDoGoogle() {
  return window.location.pathname === ROTA_RETORNO_GOOGLE;
}

function precisaPassarPeloGoogle() {
  return googleConfigurado() && !abaJaPassouPeloGoogle() && !estaVoltandoDoGoogle();
}

function App() {
  const [irParaGoogle] = useState(precisaPassarPeloGoogle);
  const [isSplashVisible, setIsSplashVisible] = useState(() => !precisaPassarPeloGoogle() && temTokenSalvo());

  useEffect(() => {
    if (irParaGoogle) iniciarLoginGoogle();
  }, [irParaGoogle]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isSplashVisible) return undefined;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsSplashVisible(false), 400);
          return 100;
        }
        return prev + 2; 
      });
    }, 40); 
    
    return () => clearInterval(interval);
    // só na primeira abertura da página
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (irParaGoogle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] text-gray-300 text-sm">
        Abrindo o login do Google...
      </div>
    );
  }

  if (isSplashVisible) {
    return (
      <div className="splash-screen">
        <img src={splashImage} alt="HelpTec Splash Screen" className="splash-image" />
        <div className="loading-overlay">
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="loading-title">Carregando Sistema {progress}%</p>
          <p className="loading-subtitle">Preparando o ambiente de trabalho</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Sem tela de login: /login vai direto para "Escolha uma conta" do Google,
              e o Google volta para /login/callback. /cadastro (antigo) também vai para o Google. */}
          <Route path="/login" element={<IrParaGoogle />} />
          <Route path={ROTA_RETORNO_GOOGLE} element={<RetornoDoGoogle />} />
          <Route path="/cadastro" element={<Navigate to="/login" replace />} />

          {/* Cada conta só abre a sua área; as outras voltam para a própria área */}
          <Route
            path="/meus-chamados"
            element={
              <PrivateRoute perfis={[PERFIL.FUNCIONARIO]}>
                <MeusChamadosPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/aprovador"
            element={
              <PrivateRoute perfis={[PERFIL.APROVADOR]}>
                <ApproverPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/suporte"
            element={
              <PrivateRoute perfis={[PERFIL.SUPORTE]}>
                <SupportPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestor"
            element={
              <PrivateRoute perfis={[PERFIL.GESTOR, PERFIL.ADMIN]}>
                <ManagerPage />
              </PrivateRoute>
            }
          />

          {/* Páginas de todas as contas (sem "perfis") */}
          <Route
            path="/webmail"
            element={
              <PrivateRoute>
                <WebmailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/candidato"
            element={
              <PrivateRoute>
                <CandidatePage />
              </PrivateRoute>
            }
          />

          {/* "/" e qualquer outro endereço (ex.: /dashboard, /chamados) vão para a área da conta */}
          <Route
            path="*"
            element={
              <PrivateRoute>
                <IrParaMinhaArea />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;