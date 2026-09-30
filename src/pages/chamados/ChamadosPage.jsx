import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { ChamadoService } from '../../services/servises';
// Reaproveita a tela que você já programou (cards, estatísticas, botão de chat)
import { TicketList } from '../helpdesk/components/TicketList';

// ---------------------------------------------------------------------------
// Adaptador: o endpoint paginado devolve ChamadoDTO (camelCase + enums como
// AGUARDANDO_APROVACAO), mas o TicketList espera o formato do resto do app
// (id_chamado, status "Aberto", prioridade "Alta"...). Convertemos aqui.
// Se algum campo não aparecer, confira o JSON real na aba Network do navegador
// e ajuste os nomes abaixo.
// ---------------------------------------------------------------------------
const STATUS_LABEL = {
  AGUARDANDO_APROVACAO: 'Aguardando',
  APROVADO: 'Aberto',
  EM_ATENDIMENTO: 'Em Andamento',
  RESOLVIDO: 'Resolvido',
  CANCELADO: 'Fechado',
};

const PRIORIDADE_LABEL = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

// Se o backend mandar um objeto (ex.: sala: { id, nome }), pega só o texto.
const texto = (valor) =>
  valor && typeof valor === 'object'
    ? (valor.nome ?? valor.descricao ?? null)
    : valor;

function paraTicket(c) {
  return {
    ...c,
    id_chamado: c.idChamado ?? c.id_chamado,
    status: STATUS_LABEL[c.status] ?? c.status,
    prioridade: PRIORIDADE_LABEL[c.prioridade] ?? c.prioridade,
    solicitante_nome:
      c.solicitanteNome ?? c.solicitante_nome ?? texto(c.solicitante),
    data_abertura: c.dataAbertura
      ? new Date(c.dataAbertura).toLocaleDateString('pt-BR')
      : c.data_abertura,
    sala: texto(c.sala),
    equipamento: texto(c.equipamento),
    cod_patrimonio: c.codPatrimonio ?? c.cod_patrimonio,
  };
}

export default function ChamadosPage() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalItens, setTotalItens] = useState(0);

  const [filtros, setFiltros] = useState({
    termo: '',
    status: '',
    prioridade: '',
  });

  useEffect(() => {
    let cancelado = false; // evita resposta antiga sobrescrever a nova

    async function carregarChamados() {
      setLoading(true);
      setError(null);
      try {
        // não manda parâmetros vazios (?termo=&status=)
        const filtrosLimpos = Object.fromEntries(
          Object.entries(filtros).filter(([, v]) => v !== ''),
        );
        const response = await ChamadoService.buscar(filtrosLimpos, {
          page,
          size,
        });
        if (cancelado) return;

        const { itens, totalItens, totalPaginas } = response.data;
        setChamados((itens || []).map(paraTicket));
        setTotalItens(totalItens || 0);
        setTotalPaginas(totalPaginas || 0);
      } catch (err) {
        if (cancelado) return;
        console.error('Erro ao buscar chamados', err);
        setError(
          'Não foi possível carregar os chamados. Tente novamente mais tarde.',
        );
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregarChamados();
    return () => {
      cancelado = true;
    };
  }, [page, size, filtros]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 max-w-6xl">
          <div className="relative flex-1 min-w-60">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="termo"
              placeholder="Buscar na descrição..."
              value={filtros.termo}
              onChange={handleFiltroChange}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <select
            name="status"
            value={filtros.status}
            onChange={handleFiltroChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Todos os status</option>
            <option value="AGUARDANDO_APROVACAO">Aguardando aprovação</option>
            <option value="APROVADO">Aprovado</option>
            <option value="EM_ATENDIMENTO">Em atendimento</option>
            <option value="RESOLVIDO">Resolvido</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        {error && (
          <p className="max-w-6xl rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading && <p className="text-sm text-gray-500">Carregando chamados...</p>}

        {/* Sua tela de chamados, agora alimentada pela pesquisa */}
        {!loading && !error && <TicketList tickets={chamados} />}

        {/* Paginação */}
        <div className="flex max-w-6xl items-center justify-between text-sm text-gray-600">
          <span>Total de itens: {totalItens}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0 || loading}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span>
              Página {page + 1} de {totalPaginas || 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPaginas - 1 || loading}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-40"
            >
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
