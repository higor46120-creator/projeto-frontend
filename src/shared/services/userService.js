import api from './api';

export const userService = {
  async listarTodos() {
    return await api.get('/usuarios');
  },

  async listarPaginado(page = 0, size = 10) {
    return await api.get('/usuarios/paginado', {
      params: { page, size },
    });
  },

  async buscarPorId(idUsuario) {
    return await api.get(`/usuarios/${idUsuario}`);
  },

  async criar(dadosUsuario) {
    return await api.post('/usuarios', dadosUsuario);
  },

  async atualizar(idUsuario, dadosUsuario) {
    return await api.put(`/usuarios/${idUsuario}`, dadosUsuario);
  },

  async deletar(idUsuario) {
    return await api.delete(`/usuarios/${idUsuario}`);
  },
};