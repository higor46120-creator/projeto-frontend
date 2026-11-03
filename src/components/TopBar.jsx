import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

// Atalhos do menu
const ITENS_MENU = [
  { rota: '/dashboard', rotulo: 'Dashboard' },
  { rota: '/meus-chamados', rotulo: 'Meus Chamados' },
  { rota: '/chamados', rotulo: 'Todos os Chamados' },
  { rota: '/aprovador', rotulo: 'Área do Aprovador' },
  { rota: '/suporte', rotulo: 'Área do Suporte' },
  { rota: '/candidato', rotulo: 'Candidatos' },
  { rota: '/webmail', rotulo: 'Webmail' },
];

// Seletor de perfil: leva para o portal de cada perfil
const PERFIS = [
  { valor: 'funcionario', rotulo: 'Funcionário', rota: '/meus-chamados' },
  { valor: 'aprovador', rotulo: 'Aprovador', rota: '/aprovador' },
  { valor: 'suporte', rotulo: 'Suporte', rota: '/suporte' },
];

const botaoTopo =
  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors bg-black/5 text-gray-700 hover:bg-black/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10';

/**
 * Cabeçalho das áreas (aprovador, suporte...).
 * - icone: componente do lucide-react; cor: { glow, bg, texto } com classes do Tailwind
 * - perfil: 'funcionario' | 'aprovador' | 'suporte' (valor mostrado no seletor)
 * - acoes: botões extras, mostrados antes dos ícones (opcional)
 */
export function TopBar({ titulo, subtitulo, icone: Icone, cor, perfil, tema, onAlternarTema, acoes }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [menuAberto, setMenuAberto] = useState(false);

  const handleSair = () => {
    logout();
    navigate('/cadastro');
  };

  return (
    <header className="bg-linear-to-r from-[#f2e9f6] to-[#f8ecf1] dark:bg-none dark:bg-[#14141b] shadow-sm border-b border-[#e3d5e6] dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Voltar</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center shrink-0">
                <span aria-hidden className={`absolute inset-0 rounded-full ${cor.glow} opacity-30 blur-md`} />
                <span className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br ${cor.bg} shadow-inner`}>
                  <Icone className={`w-5 h-5 ${cor.texto}`} />
                </span>
              </span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{titulo}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitulo}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {acoes}

            <button onClick={() => navigate('/webmail')} className={botaoTopo} title="Webmail">
              <Mail className="w-4 h-4" />
            </button>
            <button onClick={onAlternarTema} className={botaoTopo} title="Alternar tema">
              {tema === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleSair} className={botaoTopo}>
              <LogOut className="w-4 h-4" />
              Sair
            </button>

            <select
              value={perfil}
              onChange={(e) => {
                const escolhido = PERFIS.find((p) => p.valor === e.target.value);
                if (escolhido) navigate(escolhido.rota);
              }}
              className="rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#14141b] text-gray-800 dark:text-gray-100 text-sm font-semibold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {PERFIS.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.rotulo}
                </option>
              ))}
            </select>

            <div className="relative">
              <button onClick={() => setMenuAberto((aberto) => !aberto)} className={botaoTopo}>
                <User className="w-4 h-4" />
                MENU
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {menuAberto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
                  <div className="absolute right-0 mt-2 w-52 z-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1b26] shadow-xl py-1">
                    {ITENS_MENU.map((item) => (
                      <button
                        key={item.rota}
                        onClick={() => navigate(item.rota)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
                      >
                        {item.rotulo}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}