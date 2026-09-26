import { useState } from 'react';
import {
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ArrowLeft,
  MessageCircle,
  Package,
} from 'lucide-react';
import { ChatBox } from './components/ChatBox';
import { EquipmentManagement } from './components/EquipmentManagement';
import { TopBar } from '../../components/TopBar';
import { PageBackdrop } from '../../components/PageBackdrop';
export function SupportDashboard({
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
  const [chatTicket, setChatTicket] = useState(null);
  const [showEquipmentManagement, setShowEquipmentManagement] = useState(false);
  const [filterStatus, setFilterStatus] = useState('queue');
  const queueTickets = tickets.filter(
    (t) => t.status === 'Em Andamento' && !t.id_suporte,
  );
  const myTickets = tickets.filter((t) => t.id_suporte === 1); // ID do técnico (mockado)
  const inProgressTickets = myTickets.filter(
    (t) => t.status === 'Em Andamento',
  );
  const resolvedTickets = myTickets.filter(
    (t) => t.status === 'Resolvido' || t.status === 'Fechado',
  );
  let displayTickets = tickets;
  if (filterStatus === 'queue') displayTickets = queueTickets;
  if (filterStatus === 'in-progress') displayTickets = inProgressTickets;
  const handleStartSupport = (ticketId) => {
    onUpdateTicket(ticketId, {
      id_suporte: 1,
      // ID do técnico (mockado)
      status: 'Em Andamento',
    });
  };
  const handleResolve = (ticketId) => {
    onUpdateTicket(ticketId, {
      status: 'Resolvido',
      data_final: new Date().toLocaleString('pt-BR'),
    });
  };
  const getStatusColor = (status) => {
    const colors = {
      Aberto: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm',
      'Em Andamento':
        'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm',
      Aguardando:
        'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm',
      Resolvido:
        'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm',
      Fechado:
        'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm',
    };
    return colors[status];
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
    <>
      {chatTicket && (
        <ChatBox
          ticketId={chatTicket.id_chamado}
          ticketTitle={chatTicket.descricao}
          userType="support"
          onClose={() => setChatTicket(null)}
        />
      )}
      {showEquipmentManagement && (
        <EquipmentManagement
          onClose={() => setShowEquipmentManagement(false)}
        />
      )}
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
                      className="absolute inset-0 rounded-full bg-purple-500 opacity-30 blur-md"
                    />
                    <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-50 shadow-inner">
                      <Package className="w-5 h-5 text-purple-700" />
                    </span>
                  </span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Área do Suporte Técnico
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Atendimento de chamados
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEquipmentManagement(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white rounded-lg shadow-[0_0_20px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.85)] transition-all font-medium"
                >
                  <Package className="w-4 h-4" />
                  Gerenciar Equipamentos
                </button>
                <TopBar
                  userEmail={userEmail}
                  onLogout={onLogout}
                  userType={userType}
                  onUserTypeChange={onUserTypeChange}
                  onNavigate={onNavigate}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-sky-400 opacity-40 blur-lg"
                  />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-50 shadow-inner">
                    <Clock className="w-6 h-6 text-sky-600" />
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fila</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {queueTickets.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-amber-400 opacity-40 blur-lg"
                  />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-50 shadow-inner">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Em Atendimento</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inProgressTickets.length}
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
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Resolvidos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {resolvedTickets.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-purple-400 opacity-40 blur-lg"
                  />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-50 shadow-inner">
                    <Play className="w-6 h-6 text-purple-600" />
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Meus Chamados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {myTickets.length}
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
              <span className="text-sm font-medium text-gray-700">
                Filtrar:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('queue')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'queue' ? 'bg-gradient-to-r from-sky-100 to-blue-50 text-sky-800 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Fila ({queueTickets.length})
                </button>
                <button
                  onClick={() => setFilterStatus('in-progress')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'in-progress' ? 'bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-800 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Em Atendimento ({inProgressTickets.length})
                </button>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-gradient-to-r from-purple-100 to-fuchsia-50 text-purple-800 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum chamado encontrado
                </h3>
                <p className="text-sm text-gray-500">
                  Não há chamados nesta categoria no momento.
                </p>
              </div>
            ) : (
              displayTickets.map((ticket) => {
                const isMyTicket = ticket.id_suporte === 1;
                return (
                  <div
                    key={ticket.id_chamado}
                    className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden ${isMyTicket ? 'border-purple-200' : 'border-gray-100'}`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">
                              #{ticket.id_chamado.toString().padStart(4, '0')}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}
                            >
                              {ticket.status}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.prioridade)}`}
                            >
                              {ticket.prioridade}
                            </span>
                            {isMyTicket && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-sm">
                                Meu Atendimento
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
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">
                                Criticidade:
                              </span>
                              <span className="ml-2 font-medium text-gray-900">
                                {ticket.criticidade}
                              </span>
                            </div>
                            {ticket.equipamento && (
                              <div>
                                <span className="text-gray-500">
                                  Equipamento:
                                </span>
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

                          <div className="flex items-center gap-3 pt-3">
                            {!isMyTicket &&
                              ticket.status === 'Em Andamento' && (
                                <button
                                  onClick={() =>
                                    handleStartSupport(ticket.id_chamado)
                                  }
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(168,85,247,0.65)] hover:shadow-[0_0_26px_-4px_rgba(168,85,247,0.85)] transition-all font-medium"
                                >
                                  <Play className="w-4 h-4" />
                                  Iniciar Atendimento
                                </button>
                              )}
                            {isMyTicket && ticket.status === 'Em Andamento' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleResolve(ticket.id_chamado)
                                  }
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(16,185,129,0.6)] hover:shadow-[0_0_26px_-4px_rgba(16,185,129,0.8)] transition-all font-medium"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Marcar como Resolvido
                                </button>
                                <button
                                  onClick={() => setChatTicket(ticket)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(59,130,246,0.6)] hover:shadow-[0_0_26px_-4px_rgba(59,130,246,0.8)] transition-all font-medium"
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
    </>
  );
}
