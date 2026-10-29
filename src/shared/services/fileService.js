import api from './api';

export const fileService = {
  async buscarImagem(idImagem, thumb = false) {
    return await api.get(`/images/${idImagem}`, {
      params: { thumb },
    });
  },
};