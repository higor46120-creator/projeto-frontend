import api from "../../utils/api";


export const authService = {
  async login(credenciais) {
    // Retorna { token }
    return await api.post('/api/v1/auth/login', credenciais);
  },

  async register(dadosRegistro) {
    return await api.post('/api/v1/auth/register', dadosRegistro);
  },
};