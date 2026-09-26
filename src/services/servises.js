import { api } from './api'; // Importa a instância configurada no api.js

// ==========================================
// Auth Service
// ==========================================
export const AuthService = {
  register: (data) => api.post('/api/v1/auth/register', data), //[cite: 1]
  login: (data) => api.post('/api/v1/auth/login', data) //[cite: 1]
};

// ==========================================
// Usuário Service
// ==========================================
export const UsuarioService = {
  buscarPorId: (id) => api.get(`/usuarios/${id}`), //[cite: 1]
  atualizar: (id, data) => api.put(`/usuarios/${id}`, data), //[cite: 1]
  deletar: (id) => api.delete(`/usuarios/${id}`), //[cite: 1]
  listarTodos: () => api.get('/usuarios'), //[cite: 1]
  criar: (data) => api.post('/usuarios', data), //[cite: 1]
  listarPaginado: (page = 0, size = 10) => 
    api.get('/usuarios/paginado', { params: { page, size } }) //[cite: 1]
};

// ==========================================
// Salas Service
// ==========================================
export const SalasService = {
  buscarPorId: (id) => api.get(`/api/salas/${id}`), //[cite: 1]
  atualizar: (id, data) => api.put(`/api/salas/${id}`, data), //[cite: 1]
  deletar: (id) => api.delete(`/api/salas/${id}`), //[cite: 1]
  buscar: (filtro, pageRequest) => 
    api.get('/api/salas', { params: { ...filtro, ...pageRequest } }), //[cite: 1]
  criar: (data) => api.post('/api/salas', data) //[cite: 1]
};

// ==========================================
// Equipamentos Service
// ==========================================
export const EquipamentoService = {
  buscarPorId: (id) => api.get(`/api/equipamentos/${id}`), //[cite: 1]
  atualizar: (id, data) => api.put(`/api/equipamentos/${id}`, data), //[cite: 1]
  deletar: (id) => api.delete(`/api/equipamentos/${id}`), //[cite: 1]
  buscar: (filtro, pageRequest) => 
    api.get('/api/equipamentos', { params: { ...filtro, ...pageRequest } }), //[cite: 1]
  criar: (data) => api.post('/api/equipamentos', data) //[cite: 1]
};

// ==========================================
// Skills Service
// ==========================================
export const SkillService = {
  listar: () => api.get('/api/skills'), //[cite: 1]
  criar: (data) => api.post('/api/skills', data), //[cite: 1]
  atribuir: (idSkill, idUsuario) => 
    api.post(`/api/skills/${idSkill}/usuarios/${idUsuario}`), //[cite: 1]
  remover: (idSkill, idUsuario) => 
    api.delete(`/api/skills/${idSkill}/usuarios/${idUsuario}`), //[cite: 1]
  listarSuportesPorSkill: (idSkill) => 
    api.get(`/api/skills/${idSkill}/suportes`), //[cite: 1]
  listarDoUsuario: (idUsuario) => 
    api.get(`/api/skills/usuarios/${idUsuario}`) //[cite: 1]
};

// ==========================================
// Chamados Service
// ==========================================
export const ChamadoService = {
  buscarPorId: (id) => api.get(`/api/chamados/${id}`), //[cite: 1]
  deletar: (id) => api.delete(`/api/chamados/${id}`), //[cite: 1]
  buscar: (filtro, pageRequest) => 
    api.get('/api/chamados', { params: { ...filtro, ...pageRequest } }), //[cite: 1]
  criar: (data) => api.post('/api/chamados', data), //[cite: 1]
  
  // Anexos
  listarAnexos: (id) => api.get(`/api/chamados/${id}/anexos`), //[cite: 1]
  uploadAnexo: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/chamados/${id}/anexos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' } //[cite: 1]
    });
  },
  uploadAnexoComThumbnail: (id, file) => {
    // Nota: O Swagger indica application/json para esse endpoint, mas possui uma propriedade binária[cite: 1]. 
    // É comum enviar como FormData se for arquivo físico. Ajuste conforme necessário pelo backend real.
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/chamados/${id}/anexos/thumbnail`, formData); //[cite: 1]
  },
  deletarAnexo: (idAnexo) => api.delete(`/api/chamados/anexos/${idAnexo}`), //[cite: 1]
  
  // Ações Específicas
  criarViaCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/chamados/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' } //[cite: 1]
    });
  },
  triar: (id, triagemData) => api.patch(`/api/chamados/${id}/triagem`, triagemData), //[cite: 1]
  resolver: (id, resolucaoText) => api.patch(`/api/chamados/${id}/resolver`, resolucaoText, {
      headers: { 'Content-Type': 'application/json' } //[cite: 1]
  }), 
  reprovar: (id) => api.patch(`/api/chamados/${id}/reprovar`), //[cite: 1]
  aprovar: (id) => api.patch(`/api/chamados/${id}/aprovar`) //[cite: 1]
};

// ==========================================
// Dashboard Service
// ==========================================
export const DashboardService = {
  gerente: (area) => api.get('/api/dashboard/gerente', { params: { area } }), //[cite: 1]
  resumoAprovador: (area) => 
    api.get('/api/dashboard/aprovador/resumo', { params: { area } }), //[cite: 1]
  chamadosAprovador: (area, apenasPendentes = false) => 
    api.get('/api/dashboard/aprovador/chamados', { params: { area, apenasPendentes } }) //[cite: 1]
};

// ==========================================
// File (Imagens) Service
// ==========================================
export const FileService = {
  buscarImagem: (id, thumb = false) => 
    api.get(`/images/${id}`, { params: { thumb }, responseType: 'blob' }) //[cite: 1]
};