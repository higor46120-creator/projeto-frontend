// src/components/TopBar.jsx
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Users, Sun, Moon, Bell, LogOut } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const botaoTopo =
  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors bg-black/5 text-gray-700 hover:bg-black/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10';

// Topo das áreas (Aprovador, Suporte, Gestor). Cada conta só tem a própria área,
// então aqui ficam só os atalhos comuns a todos: Candidatos, Webmail, tema, notificações e Sair.
export function TopBar({ titulo, subtitulo, icone: Icone, cor, tema, onAlternarTema, acoes }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleSair = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-linear-to-r from-[#f2e9f6] to-[#f8ecf1] dark:bg-none dark:bg-[#14141b] shadow-sm border-b border-[#e3d5e6] dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icone && cor && (
              <span className="relative flex h-11 w-11 items-center justify-center shrink-0">
                <span aria-hidden className={`absolute inset-0 rounded-full ${cor.glow} opacity-30 blur-md`} />
                <span className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br ${cor.bg} shadow-inner`}>
                  <Icone className={`w-5 h-5 ${cor.texto}`} />
                </span>
              </span>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{titulo}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitulo}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {acoes}

            <button onClick={() => navigate('/candidato')} className={botaoTopo} title="Candidatos">
              <Users className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/webmail')} className={botaoTopo} title="Webmail">
              <Mail className="w-4 h-4" />
            </button>
            <button onClick={onAlternarTema} className={botaoTopo} title="Alternar tema">
              {tema === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className={botaoTopo} title="Notificações">
              <Bell className="w-4 h-4" />
            </button>
            <button onClick={handleSair} className={botaoTopo}>
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;