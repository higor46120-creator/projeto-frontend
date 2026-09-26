import axios from 'axios';

// Base do backend Spring Boot (helptec-backend). Configurada em .env como
// VITE_API_URL - em dev aponta para http://localhost:8080.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({ baseURL });

const TOKEN_KEY = 'helptec_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export const TOKEN_STORAGE_KEY = TOKEN_KEY;

// Anexa "Authorization: Bearer <token>" em toda requisição - é o header que
// o JwtAuthenticationFilter do backend lê.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o backend responder 401 (token ausente/expirado/inválido), derruba a
// sessão local e manda o usuário de volta para o /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login?erro=sessao_expirada');
      }
    }
    return Promise.reject(error);
  },
);
