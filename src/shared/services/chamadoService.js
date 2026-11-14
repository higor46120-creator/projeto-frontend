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

// Procura a sala pelo nome (igual, sem diferenciar maiúsculas/minúsculas)
async function obterIdSala(nome) {
  const nomeLimpo = String(nome ?? '').trim();
  if (!nomeLimpo) return null;

  const resposta = await api.get('/api/salas', {
    params: { nome: nomeLimpo, page: 0, size: 100 },
  });
  const sala = (resposta.itens || []).find(
    (s) => String(s.nome ?? '').trim().toLowerCase() === nomeLimpo.toLowerCase()
  );
  if (!sala) {
    throw erroParaUsuario(`A sala "${nomeLimpo}" não está cadastrada. Confira o nome da sala.`);
  }
  return sala.idSala;
}

// Troca o nome da sala pelo idSala e acrescenta o idUsuario (quem está abrindo o chamado).
// O equipamento vai como texto (tipo + patrimônio): o back procura pelo patrimônio e,
// se ainda não existir, cadastra o equipamento sozinho — o funcionário não depende do suporte.
async function prepararChamado(dados) {
  const idUsuario = obterIdUsuarioLogado();
  if (!idUsuario) {
    throw erroParaUsuario('Não foi possível identificar o usuário logado. Faça login novamente.');
  }

  const { sala, equipamento, codPatrimonio, ...resto } = dados;
  const idSala = await obterIdSala(sala);
  return {
    ...resto,
    idUsuario,
    idSala,
    equipamento: String(equipamento ?? '').trim(),
    codPatrimonio: String(codPatrimonio ?? '').trim(),
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
