import api from '../../utils/api';

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

// Procura o equipamento pelo código do patrimônio; se não achar e o valor for só número,
// tenta como número da máquina (que é o id do equipamento)
async function obterIdEquipamento(codigo) {
  const valor = String(codigo ?? '').trim();
  if (!valor) return null;

  const resposta = await api.get('/api/equipamentos', { params: { page: 0, size: 1000 } });
  const itens = resposta.itens || [];

  const porPatrimonio = itens.find(
    (e) => String(e.patrimonio ?? '').trim().toLowerCase() === valor.toLowerCase()
  );
  if (porPatrimonio) return porPatrimonio.id;

  if (/^\d+$/.test(valor)) {
    const porId = itens.find((e) => e.id === Number(valor));
    if (porId) return porId.id;
  }
  throw erroParaUsuario(
    `Nenhum equipamento encontrado com o código "${valor}". Confira o patrimônio ou o número da máquina.`
  );
}

// Troca { sala, equipamento, codPatrimonio } (texto) por { idSala, idEquipamento } antes de enviar
async function prepararChamado(dados) {
  const { sala, equipamento, codPatrimonio, ...resto } = dados;
  const idSala = await obterIdSala(sala);
  const idEquipamento = await obterIdEquipamento(codPatrimonio);
  return { ...resto, idSala, idEquipamento };
}

// Preenche sala (nome), equipamento (tipo) e codPatrimonio em cada chamado para a tela exibir.
// Se esta consulta extra falhar, a lista de chamados continua funcionando sem esses detalhes.
async function anexarDetalhes(pagina) {
  const itens = pagina?.itens || [];
  if (!itens.some((c) => c.idSala != null || c.idEquipamento != null)) return pagina;

  try {
    const [salas, equipamentos] = await Promise.all([
      api.get('/api/salas', { params: { page: 0, size: 1000 } }),
      api.get('/api/equipamentos', { params: { page: 0, size: 1000 } }),
    ]);
    const salaPorId = new Map((salas.itens || []).map((s) => [s.idSala, s.nome]));
    const equipPorId = new Map((equipamentos.itens || []).map((e) => [e.id, e]));

    return {
      ...pagina,
      itens: itens.map((c) => {
        const equip = equipPorId.get(c.idEquipamento);
        return {
          ...c,
          sala: salaPorId.get(c.idSala) ?? '',
          equipamento: equip?.tipo ?? '',
          codPatrimonio: equip?.patrimonio ?? '',
        };
      }),
    };
  } catch (err) {
    console.error('Não foi possível carregar sala/equipamento dos chamados', err);
    return pagina;
  }
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