// Perfis do back (UserRole) e a área de cada um no front.
// O perfil vem de GET /usuarios/me (campo "role").

export const PERFIL = {
  FUNCIONARIO: 'USER',
  APROVADOR: 'APROVADOR',
  SUPORTE: 'SUPORTE',
  GESTOR: 'GERENTE',
  ADMIN: 'ADMIN',
};

// Página inicial de cada perfil. ADMIN usa a área do gestor.
const AREA_POR_PERFIL = {
  [PERFIL.FUNCIONARIO]: '/meus-chamados',
  [PERFIL.APROVADOR]: '/aprovador',
  [PERFIL.SUPORTE]: '/suporte',
  [PERFIL.GESTOR]: '/gestor',
  [PERFIL.ADMIN]: '/gestor',
};

export function rotaDoPerfil(perfil) {
  return AREA_POR_PERFIL[perfil] ?? '/meus-chamados';
}

export function ehGestor(perfil) {
  return perfil === PERFIL.GESTOR || perfil === PERFIL.ADMIN;
}