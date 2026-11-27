import api from '../../utils/api';
import { obterIdUsuarioLogado } from '../../utils/usuarioLogado';

// O formulário trabalha com TEXTO (nome da sala, código do patrimônio, tipo do equipamento),
// mas o back guarda só os ids (idSala, idEquipamento). As funções abaixo fazem a ponte
// usando as rotas /api/salas e /api/equipamentos.

function erroParaUsuario(mensagem) {
  const erro = new Error(mensagem);
  erro.mensagemUsuario = mensagem; // as telas mostram este texto
  return erro;
}

// Compara textos sem diferenciar maiúsculas/minúsculas nem espaços nas pontas
export function mesmoTexto(a, b) {
  return String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();
}

// Salas e equipamentos já cadastrados (só leitura: daqui nada é criado no banco)
async function listarSalas() {
  const resposta = await api.get('/api/salas', { params: { page: 0, size: 1000 } });
  return resposta?.itens || [];
}

async function listarEquipamentos() {
  const resposta = await api.get('/api/equipamentos', { params: { page: 0, size: 1000 } });
  return resposta?.itens || [];
}

// Troca o nome da sala e o patrimônio pelos ids do banco (idSala, idEquipamento) e
// acrescenta o idUsuario (quem está abrindo o chamado).
// O que o funcionário digitou e NÃO existe no banco não é cadastrado (nenhum POST em
// /api/salas ou /api/equipamentos): vai só como texto no fim da descrição, para o suporte saber.
async function prepararChamado(dados) {
  const idUsuario = obterIdUsuarioLogado();
  if (!idUsuario) {
    throw erroParaUsuario('Não foi possível identificar o usuário logado. Faça login novamente.');
  }

  const { sala, equipamento, codPatrimonio, descricao, ...resto } = dados;
  const salaTexto = String(sala ?? '').trim();
  const patrimonioTexto = String(codPatrimonio ?? '').trim();
  const equipamentoTexto = String(equipamento ?? '').trim();

  const [salas, equipamentos] = await Promise.all([
    salaTexto ? listarSalas() : [],
    patrimonioTexto ? listarEquipamentos() : [],
  ]);
  const salaDoBanco = salas.find((s) => mesmoTexto(s.nome, salaTexto));
  const equipamentoDoBanco = equipamentos.find((e) => mesmoTexto(e.patrimonio, patrimonioTexto));

  const informados = [];
  if (salaTexto && !salaDoBanco) informados.push(`Sala informada: ${salaTexto}`);
  if (patrimonioTexto && !equipamentoDoBanco) informados.push(`Patrimônio informado: ${patrimonioTexto}`);
  if (equipamentoTexto && !equipamentoDoBanco) informados.push(`Equipamento: ${equipamentoTexto}`);

  return {
    ...resto,
    descricao: informados.length ? `${descricao ?? ''}\n\n${informados.join('\n')}` : descricao,
    idUsuario,
    idSala: salaDoBanco?.idSala ?? null,
    idEquipamento: equipamentoDoBanco?.id ?? null,
    equipamento: equipamentoTexto,
    codPatrimonio: patrimonioTexto,
  };
}

// Preenche sala (nome), equipamento (tipo), codPatrimonio e solicitanteNome em cada chamado
// para a tela exibir (o back devolve só os ids). Cada consulta é independente: se uma falhar,
// a lista continua funcionando, só sem aquele detalhe.
async function anexarDetalhes(pagina) {
  const itens = pagina?.itens || [];
  if (itens.length === 0) return pagina;

  const [salas, equipamentos, usuarios] = await Promise.allSettled([
    api.get('/api/salas', { params: { page: 0, size: 1000 } }),
    api.get('/api/equipamentos', { params: { page: 0, size: 1000 } }),
    api.get('/usuarios'),
  ]);
  [salas, equipamentos, usuarios].forEach((r) => {
    if (r.status === 'rejected') console.error('Não foi possível carregar um detalhe dos chamados', r.reason);
  });

  const lista = (r) => (r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : r.value?.itens || []) : []);
  const salaPorId = new Map(lista(salas).map((s) => [s.idSala, s.nome]));
  const equipPorId = new Map(lista(equipamentos).map((e) => [e.id, e]));
  const nomePorIdUsuario = new Map(lista(usuarios).map((u) => [u.idUsuario, u.nome || u.email]));

  return {
    ...pagina,
    itens: itens.map((c) => {
      const equip = equipPorId.get(c.idEquipamento);
      return {
        ...c,
        sala: salaPorId.get(c.idSala) ?? '',
        equipamento: equip?.tipo ?? '',
        codPatrimonio: equip?.patrimonio ?? '',
        solicitanteNome: nomePorIdUsuario.get(c.idUsuario) ?? '',
      };
    }),
  };
}

export const chamadoService = {
  async buscar(filtro = {}, pageRequest = {}) {
    const pagina = await api.get('/api/chamados', {
      params: { ...filtro, ...pageRequest },
    });
    return await anexarDetalhes(pagina);
  },

  // Sugestões dos campos Sala e Patrimônio do formulário: { salas, equipamentos }.
  // Se uma lista falhar, ela volta vazia e o campo continua aceitando texto livre.
  async opcoesDoFormulario() {
    const [salas, equipamentos] = await Promise.allSettled([listarSalas(), listarEquipamentos()]);
    return {
      salas: salas.status === 'fulfilled' ? salas.value : [],
      equipamentos: equipamentos.status === 'fulfilled' ? equipamentos.value : [],
    };
  },

  async criar(dadosChamado) {
    return await api.post('/api/chamados', await prepararChamado(dadosChamado));
  },

  async buscarPorId(idChamado) {
    const chamado = await api.get(`/api/chamados/${idChamado}`);
    const { itens } = await anexarDetalhes({ itens: [chamado] });
    return itens[0];
  },

  async deletar(idChamado) {
    return await api.delete(`/api/chamados/${idChamado}`);
  },

  // Suporte logado assume o chamado aprovado (o back usa quem está logado)
  async iniciarAtendimento(idChamado) {
    return await api.patch(`/api/chamados/${idChamado}/iniciar`);
  },

  async triar(idChamado, idSuporte) {
    return await api.patch(`/api/chamados/${idChamado}/triagem`, { idSuporte });
  },

  async resolver(idChamado, resolucaoTexto) {
    // O endpoint espera uma string pura no corpo
    return await api.patch(`/api/chamados/${idChamado}/resolver`, resolucaoTexto, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async aprovar(idChamado) {
    return await api.patch(`/api/chamados/${idChamado}/aprovar`);
  },

  async reprovar(idChamado) {
    return await api.patch(`/api/chamados/${idChamado}/reprovar`);
  },

  // Anexos
  async listarAnexos(idChamado) {
    return await api.get(`/api/chamados/${idChamado}/anexos`);
  },

  async uploadAnexo(idChamado, arquivoFile) {
    const formData = new FormData();
    formData.append('file', arquivoFile);
    return await api.post(`/api/chamados/${idChamado}/anexos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async uploadAnexoComThumbnail(idChamado, arquivoFile) {
    const formData = new FormData();
    formData.append('file', arquivoFile);
    return await api.post(`/api/chamados/${idChamado}/anexos/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async deletarAnexo(idAnexo) {
    return await api.delete(`/api/chamados/anexos/${idAnexo}`);
  },

  async criarViaCsv(arquivoCsv) {
    const formData = new FormData();
    formData.append('file', arquivoCsv);
    return await api.post('/api/chamados/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};