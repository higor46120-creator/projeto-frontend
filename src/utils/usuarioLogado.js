// Lê os dados do usuário logado direto do token JWT salvo no login.
// O back coloca no token: "sub" (e-mail) e "id" (id do usuário).
// Obs.: aqui só LEMOS o token; quem confere se ele é válido é o back.

const CHAVE_TOKEN = '@HelpTec:token';

function lerPayload(token) {
  try {
    const parte = token.split('.')[1];
    // O JWT usa Base64 "url" (- e _ no lugar de + e /), sem os "=" do final
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
    const completo = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    // decodeURIComponent/escape mantém acentos (ex.: nomes) corretos
    const json = decodeURIComponent(
      Array.from(atob(completo), (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function obterUsuarioLogado() {
  let token = null;
  try {
    token = localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
  if (!token || token === 'undefined' || token === 'null') return null;

  const payload = lerPayload(token);
  if (!payload) return null;

  return {
    id: payload.id ?? null,
    email: payload.sub ?? null,
    nome: payload.name ?? null,
  };
}

export function obterIdUsuarioLogado() {
  return obterUsuarioLogado()?.id ?? null;
}