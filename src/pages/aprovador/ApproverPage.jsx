import { useState, useEffect, useCallback } from 'react';
import { Check, X, Clock, AlertCircle, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chamadoService } from '../../shared/services/chamadoService';
import { formatarDataHora, formatarId, getPriorityColor } from '../../utils/formatters';

const STATUS_PENDENTE = 'AGUARDANDO_APROVACAO';

export default function ApproverPage() {
  const navigate = useNavigate();

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
      setTickets(response.itens || []);
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

  const pendingTickets = tickets.filter((t) => t.status === STATUS_PENDENTE);
  const analyzedTickets = tickets.filter((t) => t.status !== STATUS_PENDENTE);
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
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-gray-50 via-white to-purple-50/40">
      {/* Header */}
      <header className="bg-linear-to-r from-[#f2e9f6] to-[#f8ecf1] shadow-sm border-b border-[#e3d5e6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Voltar</span>
              </button>
              <div className="h-6 w-px bg-black/10" />
              <div className="flex items-center gap-3">
                <span className="relative flex h-11 w-11 items-center justify-center shrink-0">
                  <span aria-hidden className="absolute inset-0 rounded-full bg-emerald-500 opacity-30 blur-md" />
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-emerald-100 to-teal-50 shadow-inner">
                    <Check className="w-5 h-5 text-emerald-700" />
                  </span>
                </span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Área do Aprovador</h1>
                  <p className="text-sm text-gray-500 mt-1">Gerenciamento de aprovações</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Pendentes"
            value={pendingTickets.length}
            glow="bg-amber-400"
            bg="from-amber-100 to-yellow-50"
            icon={<Clock className="w-6 h-6 text-amber-600" />}
          />
          <StatCard
            label="Analisados"
            value={analyzedTickets.length}
            glow="bg-emerald-400"
            bg="from-emerald-100 to-teal-50"
            icon={<Check className="w-6 h-6 text-emerald-600" />}
          />
          <StatCard
            label="Total"
            value={tickets.length}
            glow="bg-sky-400"
            bg="from-sky-100 to-blue-50"
            icon={<AlertCircle className="w-6 h-6 text-sky-600" />}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filtrar:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-linear-to-r from-amber-100 to-yellow-50 text-amber-800 shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pendentes ({pendingTickets.length})
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-linear-to-r from-sky-100 to-blue-50 text-sky-800 shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos ({tickets.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {loading && <p className="mb-4 text-sm text-gray-500">Carregando chamados...</p>}

        <div className="space-y-3">
          {!loading && displayTickets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span aria-hidden className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 blur-lg" />
                <span className="relative w-16 h-16 rounded-full bg-linear-to-br from-emerald-100 to-teal-50 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-600" />
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum chamado encontrado</h3>
              <p className="text-sm text-gray-500">Não há chamados para aprovação no momento.</p>
            </div>
          ) : (
            displayTickets.map((ticket) => {
              const pendente = ticket.status === STATUS_PENDENTE;
              const aberto = expandedTicket === ticket.idChamado;
              const ocupado = actingId === ticket.idChamado;

              return (
                <div
                  key={ticket.idChamado}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            #{formatarId(ticket.idChamado)}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.prioridade)}`}
                          >
                            {ticket.prioridade}
                          </span>
                          {pendente ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-linear-to-r from-amber-400 to-yellow-500 text-white shadow-sm">
                              Aguardando Aprovação
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {ticket.status}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{ticket.descricao}</h3>
                        {ticket.area && <p className="text-sm text-gray-500">Área: {ticket.area}</p>}
                        <p className="text-sm text-gray-500">
                          Abertura: {formatarDataHora(ticket.dataAbertura)}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedTicket(aberto ? null : ticket.idChamado)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform ${aberto ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>

                    {aberto && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        {pendente ? (
                          <div className="flex items-center gap-3 pt-3">
                            <button
                              onClick={() => handleApprove(ticket.idChamado)}
                              disabled={ocupado}
                              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(16,185,129,0.6)] hover:shadow-[0_0_26px_-4px_rgba(16,185,129,0.8)] transition-all font-medium disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" /> Aprovar
                            </button>
                            <button
                              onClick={() => handleReject(ticket.idChamado)}
                              disabled={ocupado}
                              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(239,68,68,0.6)] hover:shadow-[0_0_26px_-4px_rgba(239,68,68,0.8)] transition-all font-medium disabled:opacity-50"
                            >
                              <X className="w-4 h-4" /> Reprovar
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Este chamado já foi analisado.</p>
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
  );
}

function StatCard({ label, value, glow, bg, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
          <span aria-hidden className={`absolute inset-0 rounded-full ${glow} opacity-40 blur-lg`} />
          <span className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br ${bg} shadow-inner`}>
            {icon}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}