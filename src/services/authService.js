import api from './api';

export const authService = {
  /**
   * POST /api/v1/auth/register
   *
   * Aceita tanto um objeto JSON simples quanto um FormData (usado quando
   * há foto de perfil). Quando `registerData` é um FormData, o axios
   * detecta e ajusta o Content-Type para multipart/form-data com o
   * boundary correto automaticamente.
   */
  register: async (registerData) => {
    const isFormData = registerData instanceof FormData;
    const response = await api.post('/api/v1/auth/register', registerData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  // POST /api/v1/auth/login
  login: async (loginData) => {
    const response = await api.post('/api/v1/auth/login', loginData);
    return response.data; // Retorna { token: "..." }
  },
};
