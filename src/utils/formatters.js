// src/utils/formatters.js

/**
 * Retorna data e hora no padrão Brasileiro (Ex: 10/10/2026 22:39)
 */
export const formatarDataHora = (dataIso) => {
  if (!dataIso) return '--/--/---- --:--';
  try {
    const data = new Date(dataIso);
    return data.toLocaleString('pt-BR', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  } catch (error) {
    return dataIso; // Fallback para não quebrar a tela se a string for inválida
  }
};

/**
 * Retorna APENAS a data no padrão Brasileiro (Ex: 10/10/2026)
 */
export const formatarDataCurta = (dataIso) => {
  if (!dataIso) return '--/--/----';
  try {
    const data = new Date(dataIso);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  } catch (error) {
    return dataIso;
  }
};

/**
 * Encurta IDs longos (UUIDs) para 6 caracteres ou mantém números padronizados com 4 dígitos.
 */
export const formatarId = (id) => {
  if (!id) return '----';
  const idStr = String(id);
  // Se for um UUID gerado pelo nosso mock, cortamos para visualização amigável
  if (idStr.length > 10) return idStr.substring(0, 6).toUpperCase();
  // Se for um ID numérico do banco, padronizamos com zeros à esquerda
  return idStr.padStart(4, '0');
};

/**
 * Gera um número sequencial estável baseado na posição original do chamado na lista total.
 * Mantém a numeração fixa mesmo quando filtros de pesquisa são aplicados.
 */
export const obterIdSequencial = (ticket, listaCompletaTickets) => {
  if (!ticket || !listaCompletaTickets) return '#--º chamado';
  
  // Encontra a posição real do chamado na lista total (imutável perante filtros)
  const index = listaCompletaTickets.findIndex(t => 
    (t.id_chamado || t.id_local) === (ticket.id_chamado || ticket.id_local)
  );
  
  if (index === -1) return '#--º chamado';

  // Como chamados novos entram no topo (índice 0), invertemos a matemática 
  // para garantir que o chamado mais antigo seja sempre o número 1.
  const numero = listaCompletaTickets.length - index;
  return `#${numero}º chamado`;
};

/**
 * Retorna as classes Tailwind de gradiente e sombra baseadas no status.
 */
export const getStatusColor = (status) => {
  const colors = {
    Aberto: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm',
    'Em Andamento': 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm',
    Aguardando: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm',
    Resolvido: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm',
    Fechado: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm',
    Pendente: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-sm',
  };
  return colors[status] || 'bg-gray-500 text-white shadow-sm'; 
};

/**
 * Retorna as classes Tailwind de gradiente e sombra baseadas na prioridade.
 */
export const getPriorityColor = (prioridade) => {
  const colors = {
    Baixa: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm',
    Média: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm',
    Alta: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm',
    Crítica: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-sm',
  };
  return colors[prioridade] || 'bg-gray-500 text-white shadow-sm'; 
};