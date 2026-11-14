import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

// Configuração lida do .env (as mesmas variáveis usadas por scripts/generate-firebase-sw.js).
// Tira aspas e vírgula do fim, caso o .env tenha sido copiado do .env.example com elas.
function lerEnv(nome) {
  return String(import.meta.env[nome] ?? '')
    .trim()
    .replace(/,$/, '')
    .replace(/^["']|["']$/g, '')
    .trim();
}

const firebaseConfig = {
  apiKey: lerEnv('VITE_FIREBASE_API_KEY'),
  authDomain: lerEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: lerEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: lerEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: lerEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: lerEnv('VITE_FIREBASE_APP_ID'),
};

const VAPID_KEY = lerEnv('VITE_FIREBASE_VAPID_KEY');

const configurado =
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId) &&
  !firebaseConfig.apiKey.includes('...');

// Só inicializa se o .env estiver preenchido (sem isso o app continua funcionando, só sem push)
const app = configurado ? initializeApp(firebaseConfig) : null;

// Pede permissão de notificação e devolve o token FCM deste navegador.
// Devolve null (sem lançar erro) quando o Firebase não está configurado, o navegador não
// suporta push ou o usuário recusou a permissão.
export async function obterTokenNotificacao() {
  try {
    if (!app || !VAPID_KEY) return null;
    if (typeof window === 'undefined' || !('Notification' in window)) return null;
    if (!(await isSupported())) return null;
    if (Notification.permission === 'denied') return null;

    // Usa o service worker gerado em public/firebase-messaging-sw.js
    const registro = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(getMessaging(app), {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registro,
    });
    return token || null;
  } catch (err) {
    console.warn('[Firebase] Não foi possível obter o token de notificação', err);
    return null;
  }
}

export default app;
