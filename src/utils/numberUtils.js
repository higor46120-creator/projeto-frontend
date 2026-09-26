/**
 * Utilitários de conversão numérica.
 *
 * O backend trabalha com números do tipo `double` (Java), que exigem ponto
 * decimal (ex: 10.5). Como o usuário brasileiro digita números com vírgula
 * (ex: 10,5), essas funções fazem a normalização em ambas as direções.
 */

/**
 * Converte um valor (string ou number) do formato brasileiro para um double
 * válido em JS/JSON.
 *
 * Aceita:
 *  - "10,5"      -> 10.5
 *  - "1.234,56"  -> 1234.56  (ponto de milhar é removido)
 *  - "10.5"      -> 10.5     (já em formato "internacional")
 *  - 10.5        -> 10.5     (number passa direto)
 *  - "" | null | undefined -> null
 *
 * @param {string|number|null|undefined} value
 * @returns {number|null}
 */
export function parseDoubleBR(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;

  const str = String(value).trim();
  if (str === '') return null;

  // Se existir vírgula, tratamos como formato BR: pontos são separador de
  // milhar (removidos) e a vírgula vira o ponto decimal.
  const normalized = str.includes(',')
    ? str.replace(/\./g, '').replace(',', '.')
    : str;

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Igual a parseDoubleBR, mas retorna 0 em vez de null.
 * Útil para campos obrigatórios (ex: price em um DTO de request).
 *
 * @param {string|number|null|undefined} value
 * @returns {number}
 */
export function parseDoubleBROrZero(value) {
  const parsed = parseDoubleBR(value);
  return parsed === null ? 0 : parsed;
}

/**
 * Converte um inteiro vindo de input/string, retornando null se vazio.
 * @param {string|number|null|undefined} value
 * @returns {number|null}
 */
export function parseIntOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Formata um double para exibição no padrão brasileiro (vírgula).
 * @param {number|string|null|undefined} value
 * @param {number} minimumFractionDigits
 * @returns {string}
 */
export function formatDoubleBR(value, minimumFractionDigits = 2) {
  const num = typeof value === 'number' ? value : parseDoubleBR(value);
  if (num === null || num === undefined) return '';
  return num.toLocaleString('pt-BR', { minimumFractionDigits, maximumFractionDigits: 2 });
}

/**
 * Formata um double como moeda BRL (R$).
 * @param {number|string|null|undefined} value
 * @returns {string}
 */
export function formatCurrencyBRL(value) {
  const num = typeof value === 'number' ? value : parseDoubleBR(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0);
}
