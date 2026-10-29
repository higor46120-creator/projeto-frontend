import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.5.36.7:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ==========================================
// 2. Interceptador de Requisição (Request)
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Verifica se é uma rota pública de autenticação
    const isPublicAuthRoute = 
      config.url?.includes('/api/v1/auth/login') || 
      config.url?.includes('/api/v1/auth/register');

    // Só adiciona o token se ele existir E não for rota de login/registro
    if (token && token !== 'undefined' && token !== 'null' && !isPublicAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
     console.log(`[API Request] ${config.method?.toUpperCase()} -> ${config.url}`);

    if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
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
          localStorage.removeItem('token');
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