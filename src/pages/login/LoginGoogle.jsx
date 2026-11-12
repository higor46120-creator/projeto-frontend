import { useContext, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { authService } from '../../shared/services/authService';
import {
  googleConfigurado,
  iniciarLoginGoogle,
  lerRetornoDoGoogle,
  limparLoginGoogle,
  marcarAbaComLogin,
} from '../../utils/loginGoogle';

function Mensagem({ texto, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-screen bg-[#050505] text-gray-200 px-4 text-center">
      <p className="text-sm">{texto}</p>
      {children}
    </div>
  );
}

function BotaoTentarDeNovo() {
  return (
    <button
      onClick={iniciarLoginGoogle}
      className="px-5 py-2.5 rounded-lg bg-linear-to-r from-fuchsia-600 to-purple-700 text-white text-sm font-semibold"
    >
      Entrar com o Google
    </button>
  );
}

// /login: não tem tela; vai direto para "Escolha uma conta" do Google
export function IrParaGoogle() {
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated && googleConfigurado()) iniciarLoginGoogle();
  }, [isAuthenticated]);

  if (isAuthenticated) return <Navigate to="/" replace />;
  if (!googleConfigurado()) {
    return <Mensagem texto="Login indisponível: falta VITE_GOOGLE_CLIENT_ID no .env do front." />;
  }
  return <Mensagem texto="Abrindo o login do Google..." />;
}

// /login/callback: o Google volta aqui; troca o ID token pelo token do HelpTec
export function RetornoDoGoogle() {
  // Lido uma vez ao abrir a página (o endereço tem #id_token=...)
  const [retorno] = useState(lerRetornoDoGoogle);
  const [erroDoBack, setErroDoBack] = useState('');
  // Em desenvolvimento o React roda os efeitos duas vezes: isto evita mandar o token duas vezes
  const jaEnviou = useRef(false);

  useEffect(() => {
    if (retorno.erro || jaEnviou.current) return;
    jaEnviou.current = true;
    authService
      .loginComGoogle(retorno.idToken)
      .then((resposta) => {
        if (!resposta?.token) throw new Error('O back não devolveu o token.');
        limparLoginGoogle();
        localStorage.setItem('@HelpTec:token', resposta.token);
        marcarAbaComLogin(); // os próximos F5 desta aba não voltam para o Google
        // Recarrega na raiz: com o token salvo, aparece a tela de abertura e depois a área da conta
        window.location.replace('/');
      })
      .catch((err) => {
        console.error('Erro no login com Google', err);
        limparLoginGoogle();
        setErroDoBack(
          err?.response?.data?.mensagem ||
            err?.response?.data?.message ||
            'Não foi possível entrar com o Google. Tente de novo.'
        );
      });
  }, [retorno]);

  const erro = retorno.erro || erroDoBack;
  if (erro) {
    return (
      <Mensagem texto={erro}>
        <BotaoTentarDeNovo />
      </Mensagem>
    );
  }
  return <Mensagem texto="Entrando no HelpTec..." />;
}