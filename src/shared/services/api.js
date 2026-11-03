// Os services importam './api', mas o arquivo real fica em src/utils/api.js.
// Este re-export resolve o caminho para todos os services de uma vez.
export { default } from '../../utils/api';