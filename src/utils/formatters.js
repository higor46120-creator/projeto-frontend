// Formatadores usados pelas páginas de chamados

// Número -> 0007. Código longo (UUID) -> 6 primeiros caracteres em maiúsculas (ex.: 6548D3)
export function formatarId(id) {
  if (id === null || id === undefined) return '-';
  const texto = String(id);
  if (/^\d+$/.test(texto)) return texto.padStart(4, '0');
  return texto.replace(/-/g, '').slice(0, 6).toUpperCase();
}

export function formatarDataHora(data) {
  if (!data) return '-';
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Aceita "Alta", "ALTA", "Crítica", "CRITICA"... (ignora acento e maiúscula)
function normalizar(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function getPriorityColor(prioridade) {
  switch (normalizar(prioridade)) {
    case 'critica':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'alta':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    case 'media':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'baixa':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300';
  }
}

// Texto amigável para o status que vem da API (ex.: EM_ATENDIMENTO -> "Em Atendimento")
const STATUS_LABEL = {
  AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
  EM_ATENDIMENTO: 'Em Atendimento',
  RESOLVIDO: 'Resolvido',
  CANCELADO: 'Cancelado',
};

export function formatarStatus(status) {
  if (!status) return '-';
  if (STATUS_LABEL[status]) return STATUS_LABEL[status];
  return String(status)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export function getStatusColor(status) {
  switch (String(status ?? '').toUpperCase()) {
    case 'AGUARDANDO_APROVACAO':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'APROVADO':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'REPROVADO':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'EM_ATENDIMENTO':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
    case 'RESOLVIDO':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    case 'CANCELADO':
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300';
  }
}