import api from './api';
import {
  createProductRequestDTO,
  createProductResponseDTO,
  createProductFilterDTO,
  createCustomPageResponseDTOProductResponseDTO,
} from '../types';

export const productService = {
  getAllProducts: async () => {
    const response = await api.get('/api/v1/products');
    return Array.isArray(response.data)
      ? response.data.map(createProductResponseDTO)
      : [];
  },

  getProductById: async (id) => {
    const response = await api.get(`/api/v1/products/${id}`);
    return createProductResponseDTO(response.data);
  },

  createProduct: async (productData) => {
    const payload = createProductRequestDTO(productData);
    const response = await api.post('/api/v1/products', payload);
    return createProductResponseDTO(response.data);
  },

  updateProduct: async (id, productData) => {
    const payload = createProductRequestDTO(productData);
    const response = await api.put(`/api/v1/products/${id}`, payload);
    return createProductResponseDTO(response.data);
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/api/v1/products/${id}`);
    return response.data;
  },

  /**
   * Realiza busca paginada e filtrada de produtos enviando os parâmetros
   * flat (não aninhados) na query string — o `api.js` cuida de serializar
   * sem gerar `%5B%5D` na URL.
   */
  searchProducts: async ({ filter = {}, page = 0, size = 10, sortBy = 'name', sortOrder = 'ASC' }) => {
    const filterDTO = createProductFilterDTO(filter);

    // Remove chaves com valores null, undefined ou string vazia para evitar
    // enviar parâmetros desnecessários na URL.
    const cleanFilter = Object.fromEntries(
      Object.entries(filterDTO).filter(
        ([, v]) => v !== null && v !== undefined && v !== ''
      )
    );

    const response = await api.get('/api/v1/products/search', {
      params: {
        ...cleanFilter,
        page,
        size,
        sortBy,
        sortOrder,
      },
    });

    return createCustomPageResponseDTOProductResponseDTO(response.data);
  },
};
