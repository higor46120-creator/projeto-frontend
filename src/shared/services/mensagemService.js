import api from './api';

// Webmail interno: mensagens entre as contas do HelpTec (rotas /api/mensagens do back).
// Pastas: 'inbox' (caixa de entrada), 'sent' (enviados) e 'trash' (lixeira).
export const mensagemService = {
  async buscar(pasta) {
    return await api.get('/api/mensagens', { params: { pasta } });
  },

  async contarNaoLidas() {
    const resposta = await api.get('/api/mensagens/nao-lidas');
    return resposta?.total ?? 0;
  },

  // para = e-mail de uma conta cadastrada no HelpTec
  async enviar({ para, assunto, corpo }) {
    return await api.post('/api/mensagens', { para, assunto, corpo });
  },

  async marcarComoLida(id) {
    return await api.patch(`/api/mensagens/${id}/lida`);
  },

  async alternarFavorita(id) {
    return await api.patch(`/api/mensagens/${id}/favorita`);
  },

  async moverParaLixeira(id) {
    return await api.patch(`/api/mensagens/${id}/lixeira`);
  },

  async restaurar(id) {
    return await api.patch(`/api/mensagens/${id}/restaurar`);
  },

  // Apaga de vez (só para quem apagou)
  async deletar(id) {
    return await api.delete(`/api/mensagens/${id}`);
  },
};
