import { parseDoubleBR, parseDoubleBROrZero, parseIntOrNull } from '../utils/numberUtils';

// ============================================================
// USER DTOs
// ============================================================

/** @typedef {{ token: string, nome: string }} TokenRequestDTO */
export function createTokenRequestDTO({ token = '', nome = '' } = {}) {
  return {
    token,
    nome,
  };
}

/** @typedef {{ nome: string, email: string, password: string }} CreateUserRequestDTO */
export function createCreateUserRequestDTO({ nome = '', email = '', password = '' } = {}) {
  return {
    nome,
    email,
    password,
  };
}

// ============================================================
// PRODUCT DTOs
// ============================================================

export const PRODUCT_TYPES = [
  'FRIOS',
  'ACOUGUE',
  'BEBIDA',
  'HORTIFRUTI',
  'PADARIA',
  'GRAOS',
  'MASSAS',
  'DOCES',
  'CONDIMENTOS',
];

/**
 * @typedef {Object} ProductRequestDTO
 * @property {string} name
 * @property {number} price          - double (ponto), já convertido de vírgula
 * @property {string} description
 * @property {string} imageUrl
 * @property {string} productType
 * @property {number} batch
 * @property {string} mfg
 * @property {string} exp
 * @property {number} supplierId
 */
export function createProductRequestDTO({
  name = '',
  price = 0,
  description = '',
  imageUrl = '',
  productType = 'FRIOS',
  batch = 0,
  mfg = '',
  exp = '',
  supplierId = 0,
} = {}) {
  return {
    name,
    price: parseDoubleBROrZero(price),
    description,
    imageUrl,
    productType,
    batch: parseIntOrNull(batch) ?? 0,
    mfg,
    exp,
    supplierId: parseIntOrNull(supplierId) ?? 0,
  };
}

/** @typedef {ProductRequestDTO & { id: string|number }} ProductResponseDTO */
export function createProductResponseDTO(data = {}) {
  return {
    id: data.id ?? '',
    name: data.name || '',
    price: typeof data.price === 'number' ? data.price : parseDoubleBROrZero(data.price),
    description: data.description || '',
    imageUrl: data.imageUrl || '',
    productType: data.productType || '',
    batch: data.batch || 0,
    mfg: data.mfg || '',
    exp: data.exp || '',
    supplierId: data.supplierId || 0,
  };
}

/**
 * @typedef {Object} ProductFilterDTO
 * @property {string} name
 * @property {number|null} minPrice  - double
 * @property {number|null} maxPrice  - double
 * @property {string} description
 * @property {string} productType
 * @property {number|null} batch
 * @property {string} mfgFrom
 * @property {string} mfgTo
 * @property {string} expFrom
 * @property {string} expTo
 * @property {number|null} supplierId
 */
export function createProductFilterDTO({
  name = '',
  minPrice = null,
  maxPrice = null,
  description = '',
  productType = '',
  batch = null,
  mfgFrom = '',
  mfgTo = '',
  expFrom = '',
  expTo = '',
  supplierId = null,
} = {}) {
  return {
    name,
    minPrice: parseDoubleBR(minPrice),
    maxPrice: parseDoubleBR(maxPrice),
    description,
    productType,
    batch: parseIntOrNull(batch),
    mfgFrom,
    mfgTo,
    expFrom,
    expTo,
    supplierId: parseIntOrNull(supplierId),
  };
}

/**
 * @typedef {Object} CustomPageResponseDTOProductResponseDTO
 * @property {ProductResponseDTO[]} products
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {number} currentPage
 */
export function createCustomPageResponseDTOProductResponseDTO(data = {}) {
  return {
    products: Array.isArray(data.products) ? data.products.map(createProductResponseDTO) : [],
    totalElements: data.totalElements || 0,
    totalPages: data.totalPages || 0,
    currentPage: data.currentPage || 0,
  };
}
