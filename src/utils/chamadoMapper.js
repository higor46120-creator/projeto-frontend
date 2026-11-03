// Ponte entre a API (camelCase, status em MAIÚSCULAS) e as telas TicketList/TicketForm
// (snake_case, status em português). Se algum campo não aparecer na tela ou o envio
// der erro 400, é AQUI que se ajusta — só este arquivo.

function normalizar(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Aceita string ("Sala 201") ou objeto ({ nome: "Sala 201" })
function texto(valor) {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'object') return valor.nome ?? valor.descricao ?? '';
  return String(valor);
}

const PRIORIDADE_TELA = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

const STATUS_TELA = {
  AGUARDANDO_APROVACAO: 'Aberto',
  APROVADO: 'Em Andamento',
  EM_ATENDIMENTO: 'Em Andamento',
  RESOLVIDO: 'Resolvido',
  CANCELADO: 'Fechado',
};

// API -> tela
export function chamadoApiParaTela(c) {
  return {
    id_chamado: c.idChamado,
    descricao: c.descricao,
    prioridade: PRIORIDADE_TELA[normalizar(c.prioridade)] ?? c.prioridade,
    status: STATUS_TELA[c.status] ?? c.status,
    data_abertura: c.dataAbertura,
    status_api: c.status, // status original da API (usado pela tela de suporte)
    // AJUSTAR: nomes abaixo são suposições
    id_suporte: c.idSuporte ?? c.suporte?.idUsuario ?? c.suporte?.id ?? null,
    criticidade: texto(c.criticidade),
    // AJUSTAR: nomes abaixo são suposições (não sei como a API devolve esses campos)
    solicitante_nome: texto(c.solicitante ?? c.solicitanteNome),
    sala: texto(c.sala),
    equipamento: texto(c.equipamento),
    cod_patrimonio: texto(c.codPatrimonio ?? c.patrimonio),
  };
}

// tela -> API (corpo do POST /api/chamados)
// AJUSTAR: o formato abaixo é uma suposição; confira no Swagger do backend.
export function chamadoTelaParaApi(t) {
  return {
    descricao: t.descricao,
    prioridade: normalizar(t.prioridade).toUpperCase(), // BAIXA, MEDIA, ALTA, CRITICA
    sala: t.sala,
    equipamento: t.equipamento,
    codPatrimonio: t.cod_patrimonio,
  };
}