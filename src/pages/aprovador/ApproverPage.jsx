import { useState, useEffect, useCallback } from 'react';
import { Check, X, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import { TopBar } from '../../components/TopBar';
import { useTema } from '../../utils/useTema';
import { chamadoService } from '../../shared/services/chamadoService';
import { chamadoApiParaTela } from '../../utils/chamadoMapper';
import {
  formatarDataHora,
  formatarId,
  formatarStatus,
  getStatusColor,
} from '../../utils/formatters';

const STATUS_PENDENTE = 'AGUARDANDO_APROVACAO';
const STATUS_APROVADOS = ['APROVADO', 'EM_ATENDIMENTO', 'RESOLVIDO'];

const COR_TOPBAR = {
  glow: 'bg-emerald-500',
  bg: 'from-emerald-100 to-teal-50 dark:from-emerald-900/60 dark:to-emerald-900/30',
  texto: 'text-emerald-700 dark:text-emerald-300',
};

// Etiquetas vivas no tema escuro, como no layout
function corPrioridade(prioridade) {
  const p = String(prioridade ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  switch (p) {
    case 'critica':
      return 'bg-red-100 text-red-800 dark:bg-red-500 dark:text-white';
    case 'alta':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-500 dark:text-white';
    case 'media':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-white';
    case 'baixa':
      return 'bg-green-100 text-green-800 dark:bg-green-500 dark:text-white';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300';
  }
}

function corStatus(status) {
  if (status === STATUS_PENDENTE) return 'bg-yellow-100 text-yellow-800 dark:bg-amber-400 dark:text-gray-900';
  return getStatusColor(status);
}

export default function ApproverPage() {
  const [tema, alternarTema] = useTema();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null); // chamado sendo aprovado/reprovado

  const [expandedTicket, setExpandedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');

  // Busca os chamados (o api.js já devolve o corpo da resposta)
  const carregarTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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

  const pendingTickets = tickets.filter((t) => t.status_api === STATUS_PENDENTE);
  const approvedTickets = tickets.filter((t) => STATUS_APROVADOS.includes(t.status_api));
  const displayTickets = filterStatus === 'pending' ? pendingTickets : tickets;

  const executarAcao = async (acao, idChamado, mensagemErro) => {
    setActingId(idChamado);
    setError(null);
    try {
      await acao(idChamado);
      setExpandedTicket(null);
      await carregarTickets();
    } catch (err) {
      console.error(mensagemErro, err);
      setError(mensagemErro);
    } finally {
      setActingId(null);
    }
  };

  const handleApprove = (idChamado) =>
    executarAcao(chamadoService.aprovar, idChamado, 'Não foi possível aprovar o chamado.');

  const handleReject = (idChamado) =>
    executarAcao(chamadoService.reprovar, idChamado, 'Não foi possível reprovar o chamado.');

  return (
    <div className={tema === 'dark' ? 'dark' : ''}>
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
                    <TopBar
            titulo="Área do Aprovador"
            subtitulo="Gerenciamento de aprovações"
            icone={Check}
            cor={COR_TOPBAR}
            tema={tema}
            onAlternarTema={alternarTema}
          />

          {/* Stats */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label="Pendentes"
                value={pendingTickets.length}
                glow="bg-amber-400"
                bg="from-amber-100 to-yellow-50 dark:from-amber-900/60 dark:to-amber-900/30"
                icon={<Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
              />
              <StatCard
                label="Aprovados"
                value={approvedTickets.length}
                glow="bg-emerald-400"
                bg="from-emerald-100 to-teal-50 dark:from-emerald-900/60 dark:to-emerald-900/30"
                icon={<Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
              />
              <StatCard
                label="Total"
                value={tickets.length}
                glow="bg-sky-400"
                bg="from-sky-100 to-blue-50 dark:from-sky-900/60 dark:to-sky-900/30"
                icon={<AlertCircle className="w-6 h-6 text-sky-600 dark:text-sky-400" />}
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
                    ativo={filterStatus === 'pending'}
                    cor="from-amber-100 to-yellow-50 text-amber-800 dark:from-amber-900/50 dark:to-amber-900/50 dark:text-amber-300"
                    onClick={() => setFilterStatus('pending')}
                  >
                    Pendentes ({pendingTickets.length})
                  </FilterButton>
                  <FilterButton
                    ativo={filterStatus === 'all'}
                    cor="from-sky-100 to-blue-50 text-sky-800 dark:from-sky-900/50 dark:to-sky-900/50 dark:text-sky-300"
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
                      <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum chamado encontrado</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Não há chamados para aprovação no momento.</p>
                </div>
              ) : (
                displayTickets.map((ticket) => {
                  const pendente = ticket.status_api === STATUS_PENDENTE;
                  const aberto = expandedTicket === ticket.id_chamado;
                  const ocupado = actingId === ticket.id_chamado;

                  return (
                    <div
                      key={ticket.id_chamado}
                      className="bg-white dark:bg-[#16161e] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                #{formatarId(ticket.id_chamado)}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${corPrioridade(ticket.prioridade)}`}>
                                {ticket.prioridade}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${corStatus(ticket.status_api)}`}>
                                {formatarStatus(ticket.status_api)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ticket.descricao}</h3>
                            {ticket.solicitante_nome && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Solicitante: {ticket.solicitante_nome}
                              </p>
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
                            {pendente ? (
                              <div className="flex flex-wrap items-center gap-3 pt-3">
                                <button
                                  onClick={() => handleApprove(ticket.id_chamado)}
                                  disabled={ocupado}
                                  className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(16,185,129,0.6)] hover:shadow-[0_0_26px_-4px_rgba(16,185,129,0.8)] transition-all font-medium disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" /> Aprovar
                                </button>
                                <button
                                  onClick={() => handleReject(ticket.id_chamado)}
                                  disabled={ocupado}
                                  className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(239,68,68,0.6)] hover:shadow-[0_0_26px_-4px_rgba(239,68,68,0.8)] transition-all font-medium disabled:opacity-50"
                                >
                                  <X className="w-4 h-4" /> Reprovar
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">Este chamado já foi analisado.</p>
                            )}
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