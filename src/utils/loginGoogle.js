// Login direto pela página do Google (sem tela de login no HelpTec).
//
// 1. iniciarLoginGoogle() leva o navegador para "Escolha uma conta" do Google.
// 2. O Google volta para /login/callback com o "ID token" no endereço (#id_token=...).
// 3. lerRetornoDoGoogle() pega esse token; o front manda para o back (/api/v1/auth/google),
//    que confere com o Google e devolve o token do HelpTec.

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CHAVE_STATE = '@HelpTec:google-state';
const CHAVE_NONCE = '@HelpTec:google-nonce';
// Marca "esta aba já passou pelo Google". Fica no sessionStorage: vale para os F5
// da mesma aba e some quando a aba é fechada. Aba ou janela nova = Google de novo.
const MARCA_ABA_COM_LOGIN = '@HelpTec:aba-com-login';

export const ROTA_RETORNO_GOOGLE = '/login/callback';

function textoAleatorio() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Endereço para onde o Google volta (precisa estar cadastrado no Google Cloud Console)
export function enderecoDeRetorno() {
  return `${window.location.origin}${ROTA_RETORNO_GOOGLE}`;
}

export function googleConfigurado() {
  return Boolean(GOOGLE_CLIENT_ID);
}

export function iniciarLoginGoogle() {
  const state = textoAleatorio();
  const nonce = textoAleatorio();
  sessionStorage.setItem(CHAVE_STATE, state);
  sessionStorage.setItem(CHAVE_NONCE, nonce);

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: enderecoDeRetorno(),
    response_type: 'id_token',
    scope: 'openid email profile',
    prompt: 'select_account', // sempre mostra "Escolha uma conta"
    state,
    nonce,
  });
  window.location.replace(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

function lerPayload(idToken) {
  try {
    const parte = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(parte + '='.repeat((4 - (parte.length % 4)) % 4)));
  } catch {
    return null;
  }
}

export function marcarAbaComLogin() {
  try {
    sessionStorage.setItem(MARCA_ABA_COM_LOGIN, 'sim');
  } catch {
    /* sem sessionStorage: o Google vai aparecer em todo carregamento */
  }
}

export function abaJaPassouPeloGoogle() {
  try {
    return sessionStorage.getItem(MARCA_ABA_COM_LOGIN) === 'sim';
  } catch {
    return false;
  }
}

// Apaga o state/nonce guardados (depois que o login terminou, com sucesso ou erro)
export function limparLoginGoogle() {
  sessionStorage.removeItem(CHAVE_STATE);
  sessionStorage.removeItem(CHAVE_NONCE);
}

// Lê o que o Google mandou de volta no endereço (#id_token=...&state=...), sem apagar nada.
// Devolve { idToken } ou { erro } com uma mensagem para a tela.
export function lerRetornoDoGoogle() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const stateEsperado = sessionStorage.getItem(CHAVE_STATE);
  const nonceEsperado = sessionStorage.getItem(CHAVE_NONCE);

  if (params.get('error')) {
    return { erro: 'O login com o Google foi cancelado.' };
  }
  const idToken = params.get('id_token');
  if (!idToken) {
    return { erro: 'O Google não devolveu o login.' };
  }
  // Confere se a resposta é do login que este navegador começou
  if (!stateEsperado || params.get('state') !== stateEsperado) {
    return { erro: 'Resposta do Google inválida. Tente de novo.' };
  }
  if (lerPayload(idToken)?.nonce !== nonceEsperado) {
    return { erro: 'Resposta do Google inválida. Tente de novo.' };
  }
  return { idToken };
}