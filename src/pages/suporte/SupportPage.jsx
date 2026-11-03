import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ArrowLeft,
  MessageCircle,
  Package,
  Mail,
  Sun,
  Moon,
  LogOut,
  User,
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { ChatBox } from './components/ChatBox';
import { EquipmentManagement } from './components/EquipmentManagement';
import { chamadoService } from '../../shared/services/chamadoService';
import { chamadoApiParaTela } from '../../utils/chamadoMapper';
import {
  formatarDataHora,
  formatarId,
  formatarStatus,
  getStatusColor,
  getPriorityColor,
} from '../../utils/formatters';

// TODO: ligar ao login real (hoje o AuthContext só guarda o token).
// É o id do técnico de suporte usado em "Iniciar Atendimento" e para saber quais chamados são "meus".
const ID_SUPORTE_ATUAL = 1;

const CHAVE_TEMA = '@helptec:tema'; // mesma chave do Portal do Solicitante

// Atalhos do menu do topo
const ITENS_MENU = [
  { rota: '/dashboard', rotulo: 'Dashboard' },
  { rota: '/meus-chamados', rotulo: 'Meus Chamados' },
  { rota: '/chamados', rotulo: 'Todos os Chamados' },
  { rota: '/aprovador', rotulo: 'Área do Aprovador' },
  { rota: '/candidato', rotulo: 'Candidatos' },
  { rota: '/webmail', rotulo: 'Webmail' },
];

// Seletor de perfil: leva para o portal de cada perfil
const PERFIS = [
  { valor: 'funcionario', rotulo: 'Funcionário', rota: '/meus-chamados' },
  { valor: 'aprovador', rotulo: 'Aprovador', rota: '/aprovador' },
  { valor: 'suporte', rotulo: 'Suporte', rota: '/suporte' },
];

function lerTemaSalvo() {
  try {
    return localStorage.getItem(CHAVE_TEMA) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export default function SupportPage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [tema, setTema] = useState(lerTemaSalvo);
  const [menuAberto, setMenuAberto] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);

  const [expandedTicket, setExpandedTicket] = useState(null);
  const [chatTicket, setChatTicket] = useState(null);
  const [showEquipmentManagement, setShowEquipmentManagement] = useState(false);
  const [filterStatus, setFilterStatus] = useState('queue');

  const carregarTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // O api.js já devolve o corpo da resposta
      const response = await chamadoService.buscar({}, { page: 0, size: 100 });
      setTickets((response.itens || []).map(chamadoApiParaTela));
    } catch (err) {
      console.error('Erro ao buscar chamados', err);
      setError('Não foi possível carregar os chamados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarTickets();
  }, [carregarTickets]);

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

  // Fila: aprovados que ainda não têm técnico
  const queueTickets = tickets.filter((t) => t.status_api === 'APROVADO' && !t.id_suporte);
  const myTickets = tickets.filter((t) => t.id_suporte === ID_SUPORTE_ATUAL);
  const inProgressTickets = myTickets.filter((t) => t.status_api === 'EM_ATENDIMENTO');
  const resolvedTickets = myTickets.filter((t) => t.status_api === 'RESOLVIDO');

  let displayTickets = tickets;
  if (filterStatus === 'queue') displayTickets = queueTickets;
  if (filterStatus === 'in-progress') displayTickets = inProgressTickets;

  const executarAcao = async (acao, idChamado, mensagemErro) => {
    setActingId(idChamado);
    setError(null);
    try {
      await acao();
      setExpandedTicket(null);
      await carregarTickets();
    } catch (err) {
      console.error(mensagemErro, err);
      setError(mensagemErro);
    } finally {
      setActingId(null);
    }
  };

  const handleStartSupport = (idChamado) =>
    executarAcao(
      () => chamadoService.triar(idChamado, ID_SUPORTE_ATUAL),
      idChamado,
      'Não foi possível iniciar o atendimento.',
    );

  const handleResolve = (idChamado) => {
    // O backend exige o texto da resolução
    const resolucao = window.prompt('Descreva como o chamado foi resolvido:');
    if (!resolucao || !resolucao.trim()) return;
    executarAcao(
      () => chamadoService.resolver(idChamado, resolucao.trim()),
      idChamado,
      'Não foi possível marcar o chamado como resolvido.',
    );
  };

  const botaoTopo =
    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors bg-black/5 text-gray-700 hover:bg-black/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10';

  return (
    <div className={tema === 'dark' ? 'dark' : ''}>
      {chatTicket && (
        <ChatBox
          ticketId={chatTicket.id_chamado}
          ticketTitle={chatTicket.descricao}
          userType="support"
          onClose={() => setChatTicket(null)}
        />
      )}
      {showEquipmentManagement && (
        <EquipmentManagement onClose={() => setShowEquipmentManagement(false)} />
      )}

      <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-gray-50 via-white to-purple-50/40 dark:bg-none dark:bg-[#0c0a12] text-gray-900 dark:text-gray-100">
        {/* Brilho de fundo (só no tema escuro) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(ellipse 40% 35% at 30% 92%, rgba(99,76,160,0.28), transparent 70%), radial-gradient(ellipse 30% 30% at 92% 70%, rgba(120,60,150,0.18), transparent 70%)',
          }}
        />

        <div className="relative">
          {/* Header */}
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
                      <span aria-hidden className="absolute inset-0 rounded-full bg-purple-500 opacity-30 blur-md" />
                      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-purple-100 to-fuchsia-50 dark:from-purple-900/60 dark:to-purple-900/30 shadow-inner">
                        <Package className="w-5 h-5 text-purple-700 dark:text-purple-300" />
                      </span>
                    </span>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Área do Suporte Técnico</h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Atendimento de chamados</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowEquipmentManagement(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-fuchsia-600 to-fuchsia-500 hover:from-fuchsia-500 hover:to-fuchsia-400 text-white rounded-lg shadow-[0_0_20px_-4px_rgba(217,70,239,0.7)] hover:shadow-[0_0_28px_-4px_rgba(217,70,239,0.9)] transition-all font-semibold text-sm"
                  >
                    <Package className="w-4 h-4" />
                    Gerenciar Equipamentos
                  </button>

                  <button onClick={() => navigate('/webmail')} className={botaoTopo} title="Webmail">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button onClick={alternarTema} className={botaoTopo} title="Alternar tema">
                    {tema === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <button onClick={handleSair} className={botaoTopo}>
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>

                  <select
                    value="suporte"
                    onChange={(e) => {
                      const perfil = PERFIS.find((p) => p.valor === e.target.value);
                      if (perfil) navigate(perfil.rota);
                    }}
                    className="rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-[#14141b] text-gray-800 dark:text-gray-100 text-sm font-semibold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {PERFIS.map((perfil) => (
                      <option key={perfil.valor} value={perfil.valor}>
                        {perfil.rotulo}
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

          {/* Stats */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                label="Fila"
                value={queueTickets.length}
                glow="bg-sky-400"
                bg="from-sky-100 to-blue-50 dark:from-sky-900/60 dark:to-sky-900/30"
                icon={<Clock className="w-6 h-6 text-sky-600 dark:text-sky-400" />}
              />
              <StatCard
                label="Em Atendimento"
                value={inProgressTickets.length}
                glow="bg-amber-400"
                bg="from-amber-100 to-yellow-50 dark:from-amber-900/60 dark:to-amber-900/30"
                icon={<AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
              />
              <StatCard
                label="Resolvidos"
                value={resolvedTickets.length}
                glow="bg-emerald-400"
                bg="from-emerald-100 to-teal-50 dark:from-emerald-900/60 dark:to-emerald-900/30"
                icon={<CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
              />
              <StatCard
                label="Meus Chamados"
                value={myTickets.length}
                glow="bg-purple-400"
                bg="from-purple-100 to-fuchsia-50 dark:from-purple-900/60 dark:to-purple-900/30"
                icon={<Play className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            <div className="bg-white dark:bg-[#16161e] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Filtrar:</span>
                <div className="flex gap-2">
                  <FilterButton
                    ativo={filterStatus === 'queue'}
                    cor="from-sky-100 to-blue-50 text-sky-800 dark:from-sky-900/50 dark:to-sky-900/50 dark:text-sky-300"
                    onClick={() => setFilterStatus('queue')}
                  >
                    Fila ({queueTickets.length})
                  </FilterButton>
                  <FilterButton
                    ativo={filterStatus === 'in-progress'}
                    cor="from-amber-100 to-yellow-50 text-amber-800 dark:from-amber-900/50 dark:to-amber-900/50 dark:text-amber-300"
                    onClick={() => setFilterStatus('in-progress')}
                  >
                    Em Atendimento ({inProgressTickets.length})
                  </FilterButton>
                  <FilterButton
                    ativo={filterStatus === 'all'}
                    cor="from-purple-100 to-fuchsia-50 text-purple-800 dark:from-purple-900/50 dark:to-purple-900/50 dark:text-purple-300"
                    onClick={() => setFilterStatus('all')}
                  >
                    Todos ({tickets.length})
                  </FilterButton>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            {loading && <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Carregando chamados...</p>}

            <div className="space-y-3">
              {!loading && displayTickets.length === 0 ? (
                <div className="bg-white dark:bg-[#16161e] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 p-12 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span aria-hidden className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 blur-lg" />
                    <span className="relative w-16 h-16 rounded-full bg-linear-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/60 dark:to-emerald-900/30 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum chamado encontrado</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Não há chamados nesta categoria no momento.</p>
                </div>
              ) : (
                displayTickets.map((ticket) => {
                  const isMyTicket = ticket.id_suporte === ID_SUPORTE_ATUAL;
                  const naFila = ticket.status_api === 'APROVADO' && !ticket.id_suporte;
                  const emAtendimento = isMyTicket && ticket.status_api === 'EM_ATENDIMENTO';
                  const aberto = expandedTicket === ticket.id_chamado;
                  const ocupado = actingId === ticket.id_chamado;

                  return (
                    <div
                      key={ticket.id_chamado}
                      className={`bg-white dark:bg-[#16161e] rounded-xl shadow-sm border-2 overflow-hidden ${
                        isMyTicket ? 'border-purple-200 dark:border-purple-800/60' : 'border-gray-100 dark:border-white/10'
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                #{formatarId(ticket.id_chamado)}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status_api)}`}>
                                {formatarStatus(ticket.status_api)}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.prioridade)}`}>
                                {ticket.prioridade}
                              </span>
                              {isMyTicket && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-linear-to-r from-fuchsia-500 to-purple-600 text-white shadow-sm">
                                  Meu Atendimento
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{ticket.descricao}</h3>
                            {ticket.solicitante_nome && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">Solicitante: {ticket.solicitante_nome}</p>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Abertura: {formatarDataHora(ticket.data_abertura)}
                            </p>
                          </div>
                          <button
                            onClick={() => setExpandedTicket(aberto ? null : ticket.id_chamado)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform ${aberto ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>

                        {aberto && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {ticket.criticidade && <Detalhe label="Criticidade" valor={ticket.criticidade} />}
                              {ticket.equipamento && <Detalhe label="Equipamento" valor={ticket.equipamento} />}
                              {ticket.sala && <Detalhe label="Sala" valor={ticket.sala} />}
                              {ticket.cod_patrimonio && (
                                <div className="col-span-2">
                                  <Detalhe label="Patrimônio/Máquina" valor={ticket.cod_patrimonio} />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-3">
                              {naFila && (
                                <button
                                  onClick={() => handleStartSupport(ticket.id_chamado)}
                                  disabled={ocupado}
                                  className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_26px_-4px_rgba(168,85,247,0.85)] transition-all font-medium disabled:opacity-50"
                                >
                                  <Play className="w-4 h-4" />
                                  Iniciar Atendimento
                                </button>
                              )}
                              {emAtendimento && (
                                <>
                                  <button
                                    onClick={() => handleResolve(ticket.id_chamado)}
                                    disabled={ocupado}
                                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(16,185,129,0.6)] hover:shadow-[0_0_26px_-4px_rgba(16,185,129,0.8)] transition-all font-medium disabled:opacity-50"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Marcar como Resolvido
                                  </button>
                                  <button
                                    onClick={() => setChatTicket(ticket)}
                                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(59,130,246,0.6)] hover:shadow-[0_0_26px_-4px_rgba(59,130,246,0.8)] transition-all font-medium"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    Chat com Funcionário
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, glow, bg, icon }) {
  return (
    <div className="bg-white dark:bg-[#16161e] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
          <span aria-hidden className={`absolute inset-0 rounded-full ${glow} opacity-40 blur-lg`} />
          <span className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br ${bg} shadow-inner`}>
            {icon}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ ativo, cor, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        ativo
          ? `bg-linear-to-r ${cor} shadow-sm`
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function Detalhe({ label, valor }) {
  return (
    <div>
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>
      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{valor}</span>
    </div>
  );
}