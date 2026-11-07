import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Mail, Users, Bell, FileText, List } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { TicketForm } from './TicketForm';
import { TicketList } from './TicketList';
import { chamadoService } from '../../shared/services/chamadoService';
import { chamadoApiParaTela, chamadoTelaParaApi } from '../../utils/chamadoMapper';

const CHAVE_TEMA = '@helptec:tema';

function lerTemaSalvo() {
  try {
    return localStorage.getItem(CHAVE_TEMA) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export default function MeusChamadosPage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [tema, setTema] = useState(lerTemaSalvo);

  const [aba, setAba] = useState('novo'); // 'novo' | 'lista'
  const [chamados, setChamados] = useState([]);
  const [rascunhos, setRascunhos] = useState([]); // chamados preenchidos, ainda não enviados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregarChamados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // O api.js já devolve o corpo da resposta
      const response = await chamadoService.buscar({}, { page: 0, size: 50 });
      setChamados((response.itens || []).map(chamadoApiParaTela));
    } catch (err) {
      console.error('Erro ao buscar chamados', err);
      setError('Não foi possível carregar os chamados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarChamados();
  }, [carregarChamados]);

  const alternarTema = () => {
    const novo = tema === 'dark' ? 'light' : 'dark';
    setTema(novo);
    try {
      localStorage.setItem(CHAVE_TEMA, novo);
    } catch {
      /* sem armazenamento: o tema só vale nesta visita */
    }
  };

  const handleSair = () => {
    logout();
    navigate('/cadastro');
  };

  // Formulário preenchido -> vira rascunho na lista
  const handleSubmitForm = (formData) => {
    setRascunhos((prev) => [
      {
        ...formData,
        id_local: Date.now(),
        isPendente: true,
        status: 'Pendente',
        data_abertura: new Date().toISOString(),
      },
      ...prev,
    ]);
    setAba('lista');
  };

  // "Confirmar Envio" -> manda o rascunho para a API
  const handleConfirmTicket = async (ticket) => {
    setError(null);
    try {
      await chamadoService.criar(chamadoTelaParaApi(ticket));
      setRascunhos((prev) => prev.filter((r) => r.id_local !== ticket.id_local));
      await carregarChamados();
    } catch (err) {
      console.error('Erro ao enviar chamado', err);
      setError(
        err.mensagemUsuario
          ? `${err.mensagemUsuario} Ele continua como rascunho.`
          : 'Não foi possível enviar o chamado. Ele continua como rascunho.'
      );
    }
  };

  const handleDeletePending = (idLocal) => {
    setRascunhos((prev) => prev.filter((r) => r.id_local !== idLocal));
  };

  const totalChamados = chamados.length + rascunhos.length;

  const abaClasse = (ativa) =>
    `flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
      ativa
        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
        : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
    }`;

  const botaoTopo =
    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10';

  return (
    <div className={`${tema === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-[#0f0f14] text-gray-900 dark:text-gray-100">
        {/* Cabeçalho */}
        <header className="bg-white dark:bg-[#16161e] border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sistema de Help Desk</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Portal do Solicitante</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-md bg-indigo-100 text-indigo-600 text-xs font-semibold">
                Funcionário
              </span>

              <button onClick={() => navigate('/candidato')} className={botaoTopo} title="Candidatos">
                <Users className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/webmail')} className={botaoTopo} title="Webmail">
                <Mail className="w-4 h-4" />
              </button>
              <button onClick={alternarTema} className={botaoTopo} title="Alternar tema">
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
        </header>

        {/* Abas */}
        <nav className="bg-white dark:bg-[#16161e] border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-6">
            <button onClick={() => setAba('novo')} className={abaClasse(aba === 'novo')}>
              <FileText className="w-4 h-4" />
              Abrir Chamado
            </button>
            <button onClick={() => setAba('lista')} className={abaClasse(aba === 'lista')}>
              <List className="w-4 h-4" />
              Meus Chamados
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                {totalChamados}
              </span>
            </button>
          </div>
        </nav>

        {/* Conteúdo */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
          {loading && <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Carregando chamados...</p>}

          {aba === 'novo' ? (
            <TicketForm onSubmit={handleSubmitForm} />
          ) : (
            <TicketList
              tickets={[...rascunhos, ...chamados]}
              onConfirmTicket={handleConfirmTicket}
              onDeletePending={handleDeletePending}
            />
          )}
        </main>
      </div>
    </div>
  );
}