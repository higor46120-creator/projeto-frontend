import api from './api';

export const equipamentoService = {
  async buscar(filtro = {}, pageRequest = {}) {
    return await api.get('/api/equipamentos', {
      params: { ...filtro, ...pageRequest },
    });
  },

  async criar(dadosEquipamento) {
    return await api.post('/api/equipamentos', dadosEquipamento);
  },

  async buscarPorId(idEquipamento) {
    return await api.get(`/api/equipamentos/${idEquipamento}`);
  },

  async atualizar(idEquipamento, dadosEquipamento) {
    return await api.put(`/api/equipamentos/${idEquipamento}`, dadosEquipamento);
  },

  async deletar(idEquipamento) {
    return await api.delete(`/api/equipamentos/${idEquipamento}`);
  },
};