import api from './api';

export const chamadoService = {
  async buscar(filtro = {}, pageRequest = {}) {
    return await api.get('/api/chamados', {
      params: { ...filtro, ...pageRequest },
    });
  },

  async criar(dadosChamado) {
    return await api.post('/api/chamados', dadosChamado);
  },

  async buscarPorId(idChamado) {
    return await api.get(`/api/chamados/${idChamado}`);
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