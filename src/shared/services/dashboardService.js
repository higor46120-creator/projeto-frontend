import api from './api';

export const dashboardService = {
  async obterGerente(area) {
    return await api.get('/api/dashboard/gerente', {
      params: { area },
    });
  },

  async obterResumoAprovador(area) {
    return await api.get('/api/dashboard/aprovador/resumo', {
      params: { area },
    });
  },

  async listarChamadosAprovador(area, apenasPendentes = false) {
    return await api.get('/api/dashboard/aprovador/chamados', {
      params: { area, apenasPendentes },
    });
  },
};