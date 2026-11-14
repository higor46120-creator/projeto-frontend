import api from './api';

// Chat do chamado (rotas /api/chamados/{id}/mensagens do back).
// Cada mensagem vem como { id, idChamado, idRemetente, sender, senderName, text, timestamp, dataEnvio },
// em que sender é "user" (quem abriu o chamado) ou "support" (suporte/gestão).
export const chatService = {
  async listar(idChamado) {
    return await api.get(`/api/chamados/${idChamado}/mensagens`);
  },

  async enviar(idChamado, texto) {
    return await api.post(`/api/chamados/${idChamado}/mensagens`, { text: texto });
  },
};
