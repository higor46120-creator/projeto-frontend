import api from './api';

// A tela trabalha com o NOME da sala, mas o back guarda só o idSala.
// Aqui a gente faz a ponte usando a rota /api/salas.

// Procura a sala pelo nome (igual, sem diferenciar maiúsculas/minúsculas); se não existir, cria.
async function obterIdSala(nome) {
  const nomeLimpo = String(nome ?? '').trim();
  if (!nomeLimpo) return null;

  const resposta = await api.get('/api/salas', {
    params: { nome: nomeLimpo, page: 0, size: 100 },
  });
  const existente = (resposta.itens || []).find(
    (s) => String(s.nome ?? '').trim().toLowerCase() === nomeLimpo.toLowerCase()
  );
  if (existente) return existente.idSala;

  const criada = await api.post('/api/salas', { nome: nomeLimpo });
  return criada.idSala;
}

// Troca { sala: "Sala 201" } por { idSala: 5 } antes de mandar para o back
async function prepararCorpo(dados) {
  const { sala, ...resto } = dados;
  return { ...resto, idSala: await obterIdSala(sala) };
}

// Preenche "sala" (nome) em cada equipamento a partir do idSala
async function anexarNomeDaSala(pagina) {
  const itens = pagina?.itens || [];
  if (!itens.some((i) => i.idSala != null)) return pagina;

  const salas = await api.get('/api/salas', { params: { page: 0, size: 1000 } });
  const nomePorId = new Map((salas.itens || []).map((s) => [s.idSala, s.nome]));
  return {
    ...pagina,
    itens: itens.map((i) => ({ ...i, sala: nomePorId.get(i.idSala) ?? '' })),
  };
}

export const equipamentoService = {
  async buscar(filtro = {}, pageRequest = {}) {
    const pagina = await api.get('/api/equipamentos', {
      params: { ...filtro, ...pageRequest },
    });
    return await anexarNomeDaSala(pagina);
  },

  async criar(dadosEquipamento) {
    return await api.post('/api/equipamentos', await prepararCorpo(dadosEquipamento));
  },

  async buscarPorId(idEquipamento) {
    const equipamento = await api.get(`/api/equipamentos/${idEquipamento}`);
    const { itens } = await anexarNomeDaSala({ itens: [equipamento] });
    return itens[0];
  },

  async atualizar(idEquipamento, dadosEquipamento) {
    return await api.put(
      `/api/equipamentos/${idEquipamento}`,
      await prepararCorpo(dadosEquipamento)
    );
  },

  async deletar(idEquipamento) {
    return await api.delete(`/api/equipamentos/${idEquipamento}`);
  },
};