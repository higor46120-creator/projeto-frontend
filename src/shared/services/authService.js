import api from "../../utils/api";


export const authService = {
  async login(credenciais) {
    // { email, password } -> Retorna { token }
    return await api.post('/api/v1/auth/login', credenciais);
  },

  // Login com Google: o botão do Google entrega um "ID token" ao front, e o back confere
  // esse token com o Google e devolve o token do sistema. Retorna { token }
  async loginComGoogle(idToken) {
    return await api.post('/api/v1/auth/google', { idToken });
  },

  async register(dadosRegistro) {
    return await api.post('/api/v1/auth/register', dadosRegistro);
  },
};