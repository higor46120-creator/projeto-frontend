import axios from 'axios';

const api = axios.create({
  // Endereço do back-end. Defina VITE_API_URL no .env (ex.: http://localhost:8080)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

if (import.meta.env.DEV) {
  console.log(`[API] baseURL ativo: ${api.defaults.baseURL} (modo: ${import.meta.env.MODE})`);
}

// ==========================================
// 2. Interceptador de Requisição (Request)
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@HelpTec:token');

    // Verifica se é uma rota pública de autenticação
    const isPublicAuthRoute = config.url?.includes('/api/v1/auth/');

    // Só adiciona o token se ele existir E não for rota de login/registro
    if (token && token !== 'undefined' && token !== 'null' && !isPublicAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} -> ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ==========================================
// 3. Interceptador de Resposta (Response)
// ==========================================
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 401:
          console.warn('[API] Sessão expirada. Redirecionando...');
          localStorage.removeItem('@HelpTec:token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('[API] Acesso negado.');
          break;
        case 404:
          console.error('[API] Recurso não encontrado.');
          break;
        case 500:
          console.error('[API] Erro interno no servidor.');
          break;
        default:
          console.error(`[API Error] Status: ${response.status}`, response.data);
          break;
      }
    } else {
      console.error('[API Network Error] Não foi possível conectar ao servidor ou bloqueio de CORS.');
    }

    return Promise.reject(error);
  }
);

export default api;