import { AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import fiecLogo from '../../assets/fiec-logo.jpeg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ERROR_MESSAGES = {
  oauth2: 'Não foi possível concluir o login com o Google. Tente novamente.',
  sessao_expirada: 'Sua sessão expirou. Faça login novamente.',
};

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const erro = searchParams.get('erro');
  const errorMessage = erro ? ERROR_MESSAGES[erro] || 'Não foi possível entrar.' : '';

  const handleGoogleLogin = () => {
    // Rota gerada automaticamente pelo Spring Security (oauth2Login) no
    // backend - inicia o fluxo de consentimento do Google.
    window.location.assign(`${API_URL}/oauth2/authorization/google`);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          'radial-gradient(circle at 65% 15%, #ffffff 0%, #fde047 25%, transparent 55%), linear-gradient(160deg, #a855f7 0%, #ef4444 40%, #9ca3af 75%, #52525b 100%)',
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full ring-4 ring-purple-100 overflow-hidden mb-4 bg-white flex items-center justify-center">
              <img
                src={fiecLogo}
                alt="HelpTec"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">HelpTec</h1>
            <p className="text-sm text-gray-500 mt-2">
              Entre com sua conta Google institucional para acessar o portal
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-1.5 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg border border-gray-300 shadow-sm transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.96 11.96 0 000 12c0 1.93.46 3.76 1.29 5.38l3.98-3.09z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
              />
            </svg>
            Entrar com Google
          </button>

          <p className="text-xs text-gray-400 text-center mt-6">
            O acesso é validado pelo backend HelpTec a cada login.
          </p>
        </div>
      </div>
    </div>
  );
}
