// Ponte entre a API de equipamentos e a tela EquipmentManagement.
// Se algum campo não aparecer ou o salvar der erro 400, é AQUI que se ajusta — só este arquivo.

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

const STATUS_TELA = {
  operacional: 'Operacional',
  manutencao: 'Manutenção',
  inativo: 'Inativo',
};

// API -> tela
export function equipamentoApiParaTela(e) {
  return {
    // AJUSTAR: nomes abaixo são suposições (não sei como a API devolve esses campos)
    id: e.idEquipamento ?? e.id,
    tipo: texto(e.tipo),
    cod_patrimonio: e.codPatrimonio ?? e.patrimonio ?? '',
    numero_maquina: e.numeroMaquina ?? '',
    sala: texto(e.sala),
    setor: texto(e.setor),
    status: STATUS_TELA[normalizar(e.status)] ?? e.status ?? '',
    descricao: e.descricao ?? '',
  };
}

// tela -> API (corpo do POST/PUT /api/equipamentos)
// AJUSTAR: o formato abaixo é uma suposição; confira no Swagger do backend.
export function equipamentoTelaParaApi(f) {
  return {
    tipo: f.tipo,
    codPatrimonio: f.cod_patrimonio,
    numeroMaquina: f.numero_maquina,
    sala: f.sala,
    setor: f.setor,
    status: normalizar(f.status).toUpperCase(), // OPERACIONAL, MANUTENCAO, INATIVO
    descricao: f.descricao,
  };
}