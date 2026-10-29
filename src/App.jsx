// src/App.jsx
import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { PrivateRoute } from './shared/components/PrivateRoute';

import './App.css';
import splashImage from './assets/print certo.jpg'; 
import RegisterFormComponent from './pages/cadastro/Cadastro';
import DashboardPage from './pages/dashboard/DashboardPage';

// Componente para capturar o token OAuth2, autenticar no contexto e redirecionar
const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Chama o login do AuthContext (salva em '@HelpTec:token' e atualiza o estado)
      login(token);
      // Redireciona para o dashboard autenticado
      navigate('/dashboard', { replace: true });
    } else {
      // Caso não venha token na URL, volta para a tela de cadastro/login
      navigate('/cadastro', { replace: true });
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="text-white flex items-center justify-center min-h-screen bg-[#050505]">
      <p>Processando autenticação...</p>
    </div>
  );
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

function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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
  }, []);

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
          <Route path="/cadastro" element={<RegisterFormComponent />} />
          
          {/* Rota OAuth2 adicionada (mantido /oauth2/ederect conforme solicitado, e /oauth2/redirect por segurança caso seja erro de digitação no backend) */}
          <Route path="/oauth2/ederect" element={<OAuth2RedirectHandler />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/cadastro" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;