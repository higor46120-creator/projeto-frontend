// src/pages/gestor/ManagerPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Search,
  Filter,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

// No topo de src/pages/gestor/ManagerPage.jsx:
import { TopBar } from '../../components/TopBar';
import { useTema } from '../../shared/utils/useTema';
import { chamadoService } from '../../shared/services/chamadoService';
import { chamadoApiParaTela } from '../../utils/chamadoMapper';
import {
  formatarDataHora,
  formatarId,
  formatarStatus,
  getStatusColor,
  getPriorityColor,
} from '../../utils/formatters';

const STATUS_LISTA = ['AGUARDANDO_APROVACAO', 'APROVADO', 'REPROVADO', 'EM_ATENDIMENTO', 'RESOLVIDO', 'CANCELADO'];
const PRIORIDADES = ['Baixa', 'Média', 'Alta', 'Crítica'];

const COR_STATUS = {
  AGUARDANDO_APROVACAO: '#f59e0b',
  APROVADO: '#3b82f6',
  REPROVADO: '#ef4444',
  EM_ATENDIMENTO: '#a855f7',
  RESOLVIDO: '#10b981',
  CANCELADO: '#6b7280',
};

const COR_TOPBAR = {
  glow: 'bg-indigo-500',
  bg: 'from-indigo-100 to-violet-50 dark:from-indigo-900/60 dark:to-indigo-900/30',
  texto: 'text-indigo-700 dark:text-indigo-300',
};

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Últimos 7 dias (terminando hoje): chamados abertos e, se a API informar a data, resolvidos
function montarTendencia(tickets) {
  const mesmoDia = (a, b) => a && b && new Date(a).toDateString() === b.toDateString();
  const dias = [];
  for (let i = 6; i >= 0; i -= 1) {
    const dia = new Date();
    dia.setDate(dia.getDate() - i);
    dias.push({
      dia: DIAS_SEMANA[dia.getDay()],
      abertos: tickets.filter((t) => mesmoDia(t.data_abertura, dia)).length,
      resolvidos: tickets.filter((t) => mesmoDia(t.data_resolucao, dia)).length,
    });
  }
  return dias;
}

function escaparCsv(valor) {
  return `"${String(valor ?? '').replace(/"/g, '""')}"`;
}

function baixarCsv(tickets) {
  const cabecalho = ['ID', 'Descrição', 'Solicitante', 'Status', 'Prioridade', 'Data de abertura'];
  const linhas = tickets.map((t) => [
    t.id_chamado,
    t.descricao,
    t.solicitante_nome,
    formatarStatus(t.status_api),
    t.prioridade,
    formatarDataHora(t.data_abertura),
  ]);
  const csv = [cabecalho, ...linhas].map((linha) => linha.map(escaparCsv).join(';')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'relatorio-chamados.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function ManagerPage() {
  // Compatível tanto se useTema() devolver array [tema, fn] quanto objeto { tema, toggleTema }
  const resultadoTema = useTema();
  const tema = Array.isArray(resultadoTema) ? resultadoTema[0] : (resultadoTema?.tema || 'dark');
  const alternarTema = Array.isArray(resultadoTema)
    ? resultadoTema[1]
    : (resultadoTema?.alternarTema || resultadoTema?.toggleTema || (() => {}));

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [expandido, setExpandido] = useState(null);

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

  // Números e gráficos
  const total = tickets.length;
  const contar = (status) => tickets.filter((t) => t.status_api === status).length;
  const emAtendimento = contar('EM_ATENDIMENTO');
  const resolvidos = contar('RESOLVIDO');
  const aguardando = contar('AGUARDANDO_APROVACAO');
  const taxaResolucao = total > 0 ? Math.round((resolvidos / total) * 100) : 0;

  const dadosStatus = STATUS_LISTA.map((status) => ({
    status,
    nome: formatarStatus(status),
    valor: contar(status),
  })).filter((item) => item.valor > 0);

  const dadosPrioridade = PRIORIDADES.map((nome) => ({
    nome,
    valor: tickets.filter((t) => t.prioridade === nome).length,
  }));

  const dadosTendencia = useMemo(() => montarTendencia(tickets), [tickets]);
  const temResolucao = tickets.some((t) => t.data_resolucao);

  // Tabela com filtros
  const ticketsFiltrados = tickets.filter((t) => {
    const termo = busca.trim().toLowerCase();
    const bateBusca =
      !termo ||
      String(t.descricao ?? '').toLowerCase().includes(termo) ||
      String(t.solicitante_nome ?? '').toLowerCase().includes(termo);
    const bateStatus = !filtroStatus || t.status_api === filtroStatus;
    const batePrioridade = !filtroPrioridade || t.prioridade === filtroPrioridade;
    return bateBusca && bateStatus && batePrioridade;
  });

  // Cores dos gráficos conforme o tema
  const escuro = tema === 'dark';
  const corGrade = escuro ? '#2a2a38' : '#e5e7eb';
  const corEixo = '#6b7280';
  const estiloTooltip = {
    contentStyle: {
      background: escuro ? '#1a1b26' : '#ffffff',
      border: `1px solid ${escuro ? '#2a2a38' : '#e5e7eb'}`,
      borderRadius: 8,
      color: escuro ? '#e5e7eb' : '#111827',
      fontSize: 12,
    },
    labelStyle: { color: escuro ? '#e5e7eb' : '#111827' },
    itemStyle: { color: escuro ? '#e5e7eb' : '#111827' },
  };

  const campoClasse =
    'rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-[#14141b] text-gray-800 dark:text-gray-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500';

  return (
    <div className={escuro ? 'dark' : ''}>
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
            titulo="Portal de Gerenciamento"
            subtitulo="Indicadores e Gestão de Atendimentos"
            icone={TrendingUp}
            cor={COR_TOPBAR}
            tema={tema}
            onAlternarTema={alternarTema}
            acoes={
              <button
                onClick={() => baixarCsv(ticketsFiltrados)}
                disabled={ticketsFiltrados.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg shadow-[0_0_20px_-4px_rgba(124,58,237,0.7)] transition-all font-semibold text-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Exportar Relatório
              </button>
            }
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Carregando chamados...</p>}

            {/* Indicadores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Total de Chamados"
                valor={total}
                glow="bg-indigo-400"
                bg="from-indigo-100 to-violet-50 dark:from-indigo-900/60 dark:to-indigo-900/30"
                icone={<TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
              />
              <KpiCard
                label="Em Atendimento"
                valor={emAtendimento}
                tag={emAtendimento > 0 ? 'Ativo' : null}
                tagCor="text-amber-600 dark:text-amber-400"
                glow="bg-amber-400"
                bg="from-amber-100 to-yellow-50 dark:from-amber-900/60 dark:to-amber-900/30"
                icone={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              />
              <KpiCard
                label="Resolvidos"
                valor={resolvidos}
                tag={`${taxaResolucao}%`}
                tagCor="text-emerald-600 dark:text-emerald-400"
                glow="bg-emerald-400"
                bg="from-emerald-100 to-teal-50 dark:from-emerald-900/60 dark:to-emerald-900/30"
                icone={<CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              />
              <KpiCard
                label="Aguardando Aprovação"
                valor={aguardando}
                tag={aguardando > 0 ? 'Atenção' : null}
                tagCor="text-orange-600 dark:text-orange-400"
                glow="bg-orange-400"
                bg="from-orange-100 to-amber-50 dark:from-orange-900/60 dark:to-orange-900/30"
                icone={<AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Cartao titulo="Distribuição por Status">
                {dadosStatus.length === 0 ? (
                  <SemDados />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={dadosStatus}
                        dataKey="valor"
                        nameKey="nome"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {dadosStatus.map((item) => (
                          <Cell key={item.status} fill={COR_STATUS[item.status]} />
                        ))}
                      </Pie>
                      <Tooltip {...estiloTooltip} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Cartao>

              <Cartao titulo="Chamados por Prioridade">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dadosPrioridade}>
                    <CartesianGrid strokeDasharray="3 3" stroke={corGrade} />
                    <XAxis dataKey="nome" stroke={corEixo} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} stroke={corEixo} tick={{ fontSize: 12 }} />
                    <Tooltip {...estiloTooltip} cursor={{ fill: escuro ? '#ffffff10' : '#00000008' }} />
                    <Bar dataKey="valor" name="Chamados" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Cartao>
            </div>

            <Cartao titulo="Tendência Semanal (últimos 7 dias)">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={dadosTendencia}>
                  <CartesianGrid strokeDasharray="3 3" stroke={corGrade} />
                  <XAxis dataKey="dia" stroke={corEixo} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} stroke={corEixo} tick={{ fontSize: 12 }} />
                  <Tooltip {...estiloTooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="abertos" name="Chamados Abertos" stroke="#6366f1" strokeWidth={2} />
                  {temResolucao && (
                    <Line type="monotone" dataKey="resolvidos" name="Chamados Resolvidos" stroke="#10b981" strokeWidth={2} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Cartao>

            {/* Filtros */}
            <div className="bg-white dark:bg-[#16161e] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-60">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por descrição ou solicitante..."
                    className={`${campoClasse} w-full pl-9`}
                  />
                </div>
                <Filter className="w-4 h-4 text-gray-400" />
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className={campoClasse}>
                  <option value="">Todos os Status</option>
                  {STATUS_LISTA.map((status) => (
                    <option key={status} value={status}>
                      {formatarStatus(status)}
                    </option>
                  ))}
                </select>
                <select
                  value={filtroPrioridade}
                  onChange={(e) => setFiltroPrioridade(e.target.value)}
                  className={campoClasse}
                >
                  <option value="">Todas as Prioridades</option>
                  {PRIORIDADES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabela */}
            <div className="bg-white dark:bg-[#16161e] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
              <h2 className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                Gestão de Chamados ({ticketsFiltrados.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-black/30 text-left text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <th className="px-6 py-3 font-semibold">ID</th>
                      <th className="px-6 py-3 font-semibold">Descrição</th>
                      <th className="px-6 py-3 font-semibold">Solicitante</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Prioridade</th>
                      <th className="px-6 py-3 font-semibold">Data</th>
                      <th className="px-6 py-3 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketsFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                          Nenhum chamado encontrado.
                        </td>
                      </tr>
                    ) : (
                      ticketsFiltrados.map((t) => {
                        const aberto = expandido === t.id_chamado;
                        const detalhes = [
                          ['Criticidade', t.criticidade],
                          ['Equipamento', t.equipamento],
                          ['Sala', t.sala],
                          ['Patrimônio/Máquina', t.cod_patrimonio],
                        ].filter(([, valor]) => valor);

                        return (
                          <FragmentoLinha key={t.id_chamado}>
                            <tr className="border-t border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                              <td className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                                #{formatarId(t.id_chamado)}
                              </td>
                              <td className="px-6 py-3 text-gray-900 dark:text-gray-100 max-w-xs truncate">
                                {t.descricao}
                              </td>
                              <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                                {t.solicitante_nome || '-'}
                              </td>
                              <td className="px-6 py-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(t.status_api)}`}>
                                  {formatarStatus(t.status_api)}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(t.prioridade)}`}>
                                  {t.prioridade}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {formatarDataHora(t.data_abertura)}
                              </td>
                              <td className="px-6 py-3">
                                <button
                                  onClick={() => setExpandido(aberto ? null : t.id_chamado)}
                                  title="Ver detalhes"
                                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                            {aberto && (
                              <tr className="bg-gray-50 dark:bg-black/20">
                                <td colSpan="7" className="px-6 py-4">
                                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{t.descricao}</p>
                                  {detalhes.length > 0 ? (
                                    <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
                                      {detalhes.map(([rotulo, valor]) => (
                                        <p key={rotulo}>
                                          <span className="text-gray-500 dark:text-gray-400">{rotulo}:</span>
                                          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{valor}</span>
                                        </p>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Sem detalhes adicionais.</p>
                                  )}
                                </td>
                              </tr>
                            )}
                          </FragmentoLinha>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Agrupa duas <tr> sem criar elemento extra no HTML
function FragmentoLinha({ children }) {
  return <>{children}</>;
}

function KpiCard({ label, valor, tag, tagCor, glow, bg, icone }) {
  return (
    <div className="bg-white dark:bg-[#16161e] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="relative flex h-11 w-11 items-center justify-center shrink-0">
          <span aria-hidden className={`absolute inset-0 rounded-full ${glow} opacity-40 blur-lg`} />
          <span className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br ${bg} shadow-inner`}>
            {icone}
          </span>
        </div>
        {tag && <span className={`text-xs font-bold ${tagCor}`}>{tag}</span>}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{valor}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function Cartao({ titulo, children }) {
  return (
    <div className="bg-white dark:bg-[#16161e] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 p-6">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{titulo}</h2>
      {children}
    </div>
  );
}

function SemDados() {
  return (
    <div className="h-60 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      Nenhum chamado para mostrar.
    </div>
  );
}