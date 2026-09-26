// Configuração base do Firebase para o HelpTec.
//
// As chaves NÃO ficam fixas no código: elas vêm de variáveis de ambiente
// (arquivo .env, que não deve ser commitado — veja .env.example).
//
// Este arquivo apenas inicializa o app. Os serviços (Auth, Firestore,
// Storage etc.) são exportados prontos para uso quando forem integrados
// nas próximas etapas — por enquanto nada no HelpTec os utiliza ainda.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Evita reinicializar o app em hot-reload do Vite
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
