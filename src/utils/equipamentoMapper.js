// Ponte entre a API de equipamentos e a tela EquipmentManagement.
// Correspondência dos campos da tela com o back:
//   cod_patrimonio -> patrimonio   (/api/equipamentos)
//   numero_maquina -> id           (/api/equipamentos, gerado pelo banco; só exibição)
//   sala           -> nome da sala (/api/salas; o equipamento guarda idSala — ver equipamentoService.js)
//   setor          -> area         (/api/equipamentos)
//   descricao      -> descricao    (/api/equipamentos)

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
// (o campo "sala" chega preenchido pelo equipamentoService, que troca idSala pelo nome)
export function equipamentoApiParaTela(e) {
  return {
    id: e.id,
    tipo: texto(e.tipo),
    cod_patrimonio: e.patrimonio ?? '',
    numero_maquina: e.id != null ? String(e.id) : '',
    sala: texto(e.sala),
    setor: e.area ?? '',
    status: STATUS_TELA[normalizar(e.status)] ?? e.status ?? '',
    descricao: e.descricao ?? '',
  };
}

// tela -> API (corpo do POST/PUT /api/equipamentos)
// "sala" segue como texto aqui; o equipamentoService troca por idSala antes de enviar.
// numero_maquina não é enviado: é o id, que o banco gera.
export function equipamentoTelaParaApi(f) {
  return {
    tipo: f.tipo,
    patrimonio: f.cod_patrimonio,
    sala: f.sala,
    area: f.setor,
    status: normalizar(f.status).toUpperCase(), // OPERACIONAL, MANUTENCAO, INATIVO
    descricao: f.descricao,
  };
}