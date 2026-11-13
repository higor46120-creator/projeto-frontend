import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { rotaDoPerfil } from '../../utils/perfis';

// Protege uma página:
//  - sem login: vai para o login (/cadastro)
//  - com "perfis": só esses perfis entram; os outros voltam para a própria área
//  - sem "perfis": qualquer conta logada entra (ex.: webmail, candidatos)
export const PrivateRoute = ({ children, perfis }) => {
  const { isAuthenticated, perfil, carregandoUsuario, erroUsuario, recarregarUsuario, logout } =
    useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (carregandoUsuario) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f14] text-gray-300 text-sm">
        Carregando seu perfil...
      </div>
    );
  }

  if (erroUsuario || !perfil) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-screen bg-[#0f0f14] text-gray-200 px-4 text-center">
        <p className="text-sm">
          Não foi possível carregar o seu perfil. Confira se o back-end está rodando.
        </p>
        <div className="flex gap-2">
          <button
            onClick={recarregarUsuario}
            className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-sm font-semibold"
          >
            Tentar de novo
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  if (perfis && !perfis.includes(perfil)) {
    return <Navigate to={rotaDoPerfil(perfil)} replace />;
  }

  return children;
};