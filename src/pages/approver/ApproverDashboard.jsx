import { useState } from 'react';
import {
  Check,
  X,
  Clock,
  AlertCircle,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { TopBar } from '../../components/TopBar';
import { PageBackdrop } from '../../components/PageBackdrop';
export function ApproverDashboard({
  tickets,
  onUpdateTicket,
  onBack,
  userEmail,
  onLogout,
  userType,
  onUserTypeChange,
  onNavigate,
}) {
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [editingTicket, setEditingTicket] = useState(null);
  const pendingTickets = tickets.filter((t) => t.status === 'Aberto');
  const approvedTickets = tickets.filter((t) => t.status !== 'Aberto');
  const displayTickets = filterStatus === 'pending' ? pendingTickets : tickets;
  const handleApprove = (ticketId) => {
    const updates = {
      status: 'Em Andamento',
      id_aprovacao: 1, // ID do aprovador (mockado)
    };

    // Se houver edição de prioridade/criticidade, incluir nas atualizações
    if (editingTicket && editingTicket.id === ticketId) {
      updates.prioridade = editingTicket.prioridade;
      updates.criticidade = editingTicket.criticidade;
      setEditingTicket(null);
    }
    onUpdateTicket(ticketId, updates);
  };
  const handleReject = (ticketId) => {
    onUpdateTicket(ticketId, {
      status: 'Fechado',
      id_aprovacao: 1,
      data_final: new Date().toLocaleString('pt-BR'),
    });
  };
  const getPriorityColor = (prioridade) => {
    const colors = {
      Baixa: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm',
      Média: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm',
      Alta: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm',
      Crítica: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-sm',
    };
    return colors[prioridade];
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 via-white to-purple-50/40">
      <PageBackdrop />
      {/* Header */}
      <header className="bg-gradient-to-r from-[#f2e9f6] to-[#f8ecf1] shadow-sm border-b border-[#e3d5e6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Voltar</span>
              </button>
              <div className="h-6 w-px bg-black/10" />
              <div className="flex items-center gap-3">
                <span className="relative flex h-11 w-11 items-center justify-center shrink-0">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-emerald-500 opacity-30 blur-md"
                  />
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 shadow-inner">
                    <Check className="w-5 h-5 text-emerald-700" />
                  </span>
                </span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Área do Aprovador
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Gerenciamento de aprovações
                  </p>
                </div>
              </div>
            </div>
            <TopBar
              userEmail={userEmail}
              onLogout={onLogout}
              userType={userType}
              onUserTypeChange={onUserTypeChange}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-amber-400 opacity-40 blur-lg"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-50 shadow-inner">
                  <Clock className="w-6 h-6 text-amber-600" />
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingTickets.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-emerald-400 opacity-40 blur-lg"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 shadow-inner">
                  <Check className="w-6 h-6 text-emerald-600" />
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Aprovados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvedTickets.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-sky-400 opacity-40 blur-lg"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-50 shadow-inner">
                  <AlertCircle className="w-6 h-6 text-sky-600" />
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.length}
                </p>
              </div>
            </div>
          </div>
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'pending' ? 'bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-800 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Pendentes ({pendingTickets.length})
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-gradient-to-r from-sky-100 to-blue-50 text-sky-800 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Todos ({tickets.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="space-y-3">
          {displayTickets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 blur-lg"
                />
                <span className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-600" />
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum chamado encontrado
              </h3>
              <p className="text-sm text-gray-500">
                Não há chamados para aprovação no momento.
              </p>
            </div>
          ) : (
            displayTickets.map((ticket) => (
              <div
                key={ticket.id_chamado}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          #{ticket.id_chamado.toString().padStart(4, '0')}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.prioridade)}`}
                        >
                          {ticket.prioridade}
                        </span>
                        {ticket.status === 'Aberto' && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm">
                            Aguardando Aprovação
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {ticket.descricao}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Solicitante: {ticket.solicitante_nome}
                      </p>
                      <p className="text-sm text-gray-500">
                        Abertura: {ticket.data_abertura}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedTicket(
                          expandedTicket === ticket.id_chamado
                            ? null
                            : ticket.id_chamado,
                        )
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedTicket === ticket.id_chamado ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {expandedTicket === ticket.id_chamado && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {ticket.status === 'Aberto' && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-semibold text-blue-900 mb-3">
                            Definir Classificação
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prioridade *
                              </label>
                              <select
                                value={
                                  editingTicket?.id === ticket.id_chamado
                                    ? editingTicket.prioridade
                                    : ticket.prioridade
                                }
                                onChange={(e) =>
                                  setEditingTicket({
                                    id: ticket.id_chamado,
                                    prioridade: e.target.value,
                                    criticidade:
                                      editingTicket?.id === ticket.id_chamado
                                        ? editingTicket.criticidade
                                        : ticket.criticidade,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              >
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                                <option value="Crítica">Crítica</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Criticidade *
                              </label>
                              <select
                                value={
                                  editingTicket?.id === ticket.id_chamado
                                    ? editingTicket.criticidade
                                    : ticket.criticidade
                                }
                                onChange={(e) =>
                                  setEditingTicket({
                                    id: ticket.id_chamado,
                                    prioridade:
                                      editingTicket?.id === ticket.id_chamado
                                        ? editingTicket.prioridade
                                        : ticket.prioridade,
                                    criticidade: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              >
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {ticket.equipamento && (
                          <div>
                            <span className="text-gray-500">Equipamento:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {ticket.equipamento}
                            </span>
                          </div>
                        )}
                        {ticket.sala && (
                          <div>
                            <span className="text-gray-500">Sala:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {ticket.sala}
                            </span>
                          </div>
                        )}
                        {ticket.cod_patrimonio && (
                          <div className="col-span-2">
                            <span className="text-gray-500">
                              Patrimônio/Máquina:
                            </span>
                            <span className="ml-2 font-medium text-gray-900">
                              {ticket.cod_patrimonio}
                            </span>
                          </div>
                        )}
                      </div>

                      {ticket.status === 'Aberto' && (
                        <div className="flex items-center gap-3 pt-3">
                          <button
                            onClick={() => handleApprove(ticket.id_chamado)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(16,185,129,0.6)] hover:shadow-[0_0_26px_-4px_rgba(16,185,129,0.8)] transition-all font-medium"
                          >
                            <Check className="w-4 h-4" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleReject(ticket.id_chamado)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(239,68,68,0.6)] hover:shadow-[0_0_26px_-4px_rgba(239,68,68,0.8)] transition-all font-medium"
                          >
                            <X className="w-4 h-4" />
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
