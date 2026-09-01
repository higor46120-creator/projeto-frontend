import axios from 'axios';

/**
 * Serializador de query params customizado.
 *
 * Por padrão, ao enviar um array como parâmetro (ex: { productType: ['A','B'] }),
 * o axios (via `qs`) gera `productType[]=A&productType[]=B`, e o navegador
 * codifica os colchetes como `%5B%5D` — o que gera URLs feias e, em alguns
 * backends (ex: Spring com @RequestParam simples), não é interpretado
 * corretamente.
 *
 * Este serializador:
 *  - ignora chaves com valor null / undefined / string vazia;
 *  - para arrays, repete a chave sem colchetes: `productType=A&productType=B`
 *    (formato aceito por @RequestParam List<T> / String[] no Spring);
 *  - usa URLSearchParams, que já cuida do encoding correto do restante.
 */
function serializeParams(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;

    if (Array.isArray(value)) {
      value
        .filter((item) => item !== null && item !== undefined && item !== '')
        .forEach((item) => searchParams.append(key, item));
      return;
    }

    searchParams.append(key, value);
  });

  return searchParams.toString();
}

// Instância base do Axios configurada com a URL do servidor
const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    serialize: serializeParams,
  },
});

// Interceptor para adicionar o token JWT automaticamente em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
