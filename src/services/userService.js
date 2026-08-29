import api from './api';
import { createCreateUserRequestDTO, createTokenRequestDTO } from '../types';

export const userService = {
  /**
   * Cria um novo usuário.
   * @param {Object} userData
   */
  createUser: async (userData) => {
    const payload = createCreateUserRequestDTO(userData);
    const response = await api.post('/users', payload);
    return response.data;
  },

  /**
   * Atualiza/define o token do usuário.
   * @param {Object} tokenData
   */
  setToken: async (tokenData) => {
    const payload = createTokenRequestDTO(tokenData);
    const response = await api.put('/users', payload);
    return response.data;
  },

  /**
   * Busca os dados do usuário autenticado (usa o token do interceptor).
   */
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};
