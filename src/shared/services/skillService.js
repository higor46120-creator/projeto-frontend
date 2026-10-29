import api from './api';

export const skillService = {
  async listar() {
    return await api.get('/api/skills');
  },

  async criar(dadosSkill) {
    return await api.post('/api/skills', dadosSkill);
  },

  async listarDoUsuario(idUsuario) {
    return await api.get(`/api/skills/usuarios/${idUsuario}`);
  },

  async listarSuportesPorSkill(idSkill) {
    return await api.get(`/api/skills/${idSkill}/suportes`);
  },

  async atribuirSkillAoUsuario(idSkill, idUsuario) {
    return await api.post(`/api/skills/${idSkill}/usuarios/${idUsuario}`);
  },

  async removerSkillDoUsuario(idSkill, idUsuario) {
    return await api.delete(`/api/skills/${idSkill}/usuarios/${idUsuario}`);
  },
};