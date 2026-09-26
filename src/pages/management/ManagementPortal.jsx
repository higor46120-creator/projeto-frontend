import { useState } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Filter,
  Download,
  Search,
  Edit2,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TopBar } from '../../components/TopBar';
import { PageBackdrop } from '../../components/PageBackdrop';
export function ManagementPortal({
  tickets,
  onUpdateTicket,
  onBack,
  userEmail,
  onLogout,
  userType,
  onUserTypeChange,
  onNavigate,
}) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Cálculo de métricas
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === 'Aberto').length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === 'Em Andamento',
  ).length;
  const resolvedTickets = tickets.filter(
    (t) => t.status === 'Resolvido' || t.status === 'Fechado',
  ).length;
  const resolutionRate =
    totalTickets > 0
      ? ((resolvedTickets / totalTickets) * 100).toFixed(1)
      : '0';

  // Dados para gráficos
  const statusData = [
    {
      name: 'Aberto',
      value: openTickets,
      color: '#3B82F6',
    },
    {
      name: 'Em Andamento',
      value: inProgressTickets,
      color: '#F59E0B',
    },
    {
      name: 'Resolvido',
      value: resolvedTickets,
      color: '#10B981',
    },
  ];
  const priorityData = [
    {
      name: 'Baixa',
      value: tickets.filter((t) => t.prioridade === 'Baixa').length,
    },
    {
      name: 'Média',
      value: tickets.filter((t) => t.prioridade === 'Média').length,
    },
    {
      name: 'Alta',
      value: tickets.filter((t) => t.prioridade === 'Alta').length,
    },
    {
      name: 'Crítica',
      value: tickets.filter((t) => t.prioridade === 'Crítica').length,
    },
  ];
  const dailyData = [
    {
      dia: 'Seg',
      chamados: 12,
      resolvidos: 8,
    },
    {
      dia: 'Ter',
      chamados: 15,
      resolvidos: 11,
    },
    {
      dia: 'Qua',
      chamados: 18,
      resolvidos: 14,
    },
    {
      dia: 'Qui',
      chamados: 14,
      resolvidos: 10,
    },
    {
      dia: 'Sex',
      chamados: 16,
      resolvidos: 13,
    },
    {
      dia: 'Sáb',
      chamados: 8,
      resolvidos: 6,
    },
    {
      dia: 'Dom',
      chamados: 5,
      resolvidos: 4,
    },
  ];

  // Filtrar tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch =
      ticket.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.solicitante_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === 'all' || ticket.status === filterStatus;
    const matchPriority =
      filterPriority === 'all' || ticket.prioridade === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });
  const handleEditTicket = (field, value) => {
    if (selectedTicket) {
      const updated = {
        ...selectedTicket,
        [field]: value,
      };
      setSelectedTicket(updated);
    }
  };
  const handleSaveTicket = () => {
    if (selectedTicket) {
      onUpdateTicket(selectedTicket.id_chamado, selectedTicket);
      setEditMode(false);
    }
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
                    className="absolute inset-0 rounded-full bg-indigo-500 opacity-30 blur-md"
                  />
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 shadow-inner">
                    <TrendingUp className="w-5 h-5 text-indigo-700" />
                  </span>
                </span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Portal de Gerenciamento
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Indicadores e Gestão de Atendimentos
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white rounded-lg shadow-[0_0_20px_-4px_rgba(79,70,229,0.65)] hover:shadow-[0_0_28px_-4px_rgba(79,70,229,0.85)] transition-all font-medium">
                <Download className="w-4 h-4" />
                Exportar Relatório
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-indigo-400 opacity-40 blur-lg"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 shadow-inner">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </span>
              </div>
              <span className="text-xs font-medium text-emerald-600">+12%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
            <p className="text-sm text-gray-500">Total de Chamados</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-amber-400 opacity-40 blur-lg"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-50 shadow-inner">
                  <Clock className="w-6 h-6 text-amber-600" />
                </span>
              </div>
              <span className="text-xs font-medium text-amber-600">Ativo</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {inProgressTickets}
            </p>
            <p className="text-sm text-gray-500">Em Atendimento</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-emerald-400 opacity-40 blur-lg"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 shadow-inner">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </span>
              </div>
              <span className="text-xs font-medium text-emerald-600">
                {resolutionRate}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {resolvedTickets}
            </p>
            <p className="text-sm text-gray-500">Resolvidos</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-orange-400 opacity-40 blur-lg"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-50 shadow-inner">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </span>
              </div>
              <span className="text-xs font-medium text-orange-600">
                Atenção
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{openTickets}</p>
            <p className="text-sm text-gray-500">Aguardando Aprovação</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuição por Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Prioridade */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chamados por Prioridade
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Tendência */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tendência Semanal
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="chamados"
                  stroke="#3B82F6"
                  name="Chamados Abertos"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="resolvidos"
                  stroke="#10B981"
                  name="Chamados Resolvidos"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por descrição ou solicitante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                <option value="Aberto">Aberto</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Resolvido">Resolvido</option>
                <option value="Fechado">Fechado</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Chamados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Gestão de Chamados ({filteredTickets.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id_chamado}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{ticket.id_chamado.toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {ticket.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.solicitante_nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.prioridade)}`}
                      >
                        {ticket.prioridade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.data_abertura}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setEditMode(false);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Visualizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Chamado #{selectedTicket.id_chamado.toString().padStart(4, '0')}
              </h3>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(79,70,229,0.6)] hover:shadow-[0_0_26px_-4px_rgba(79,70,229,0.8)] transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                )}
                {editMode && (
                  <>
                    <button
                      onClick={handleSaveTicket}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg shadow-[0_0_18px_-4px_rgba(16,185,129,0.6)] hover:shadow-[0_0_26px_-4px_rgba(16,185,129,0.8)] transition-all"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    setEditMode(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  {editMode ? (
                    <select
                      value={selectedTicket.status}
                      onChange={(e) =>
                        handleEditTicket('status', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Aberto">Aberto</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Aguardando">Aguardando</option>
                      <option value="Resolvido">Resolvido</option>
                      <option value="Fechado">Fechado</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{selectedTicket.status}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  {editMode ? (
                    <select
                      value={selectedTicket.prioridade}
                      onChange={(e) =>
                        handleEditTicket('prioridade', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                      <option value="Crítica">Crítica</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{selectedTicket.prioridade}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                {editMode ? (
                  <textarea
                    value={selectedTicket.descricao}
                    onChange={(e) =>
                      handleEditTicket('descricao', e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{selectedTicket.descricao}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Solicitante
                  </label>
                  <p className="text-gray-900">
                    {selectedTicket.solicitante_nome}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Criticidade
                  </label>
                  {editMode ? (
                    <select
                      value={selectedTicket.criticidade}
                      onChange={(e) =>
                        handleEditTicket('criticidade', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {selectedTicket.criticidade}
                    </p>
                  )}
                </div>
              </div>

              {(selectedTicket.equipamento ||
                selectedTicket.sala ||
                selectedTicket.cod_patrimonio) && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Informações Adicionais
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedTicket.equipamento && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Equipamento
                        </label>
                        <p className="text-gray-900">
                          {selectedTicket.equipamento}
                        </p>
                      </div>
                    )}
                    {selectedTicket.sala && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sala
                        </label>
                        <p className="text-gray-900">{selectedTicket.sala}</p>
                      </div>
                    )}
                    {selectedTicket.cod_patrimonio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Patrimônio/Máquina
                        </label>
                        <p className="text-gray-900">
                          {selectedTicket.cod_patrimonio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Histórico</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Abertura:</span>
                    <span className="text-gray-900">
                      {selectedTicket.data_abertura}
                    </span>
                  </div>
                  {selectedTicket.data_final && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-500">Finalização:</span>
                      <span className="text-gray-900">
                        {selectedTicket.data_final}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
