import api from './api';

export const salaService = {
  async buscar(filtro = {}, pageRequest = {}) {
    return await api.get('/api/salas', {
      params: { ...filtro, ...pageRequest },
    });
  },

  async criar(dadosSala) {
    return await api.post('/api/salas', dadosSala);
  },

  async buscarPorId(idSala) {
    return await api.get(`/api/salas/${idSala}`);
  },

  async atualizar(idSala, dadosSala) {
    return await api.put(`/api/salas/${idSala}`, dadosSala);
  },

  async deletar(idSala) {
    return await api.delete(`/api/salas/${idSala}`);
  },
};