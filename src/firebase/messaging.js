// src/firebase/messaging.js
//
// Complementa src/firebase/config.js (que só cuida de Auth/Firestore/
// Storage) com o serviço de Cloud Messaging — notificações push.
//
// Fica em arquivo separado porque `getMessaging`/`isSupported` exigem
// um contexto de navegador com Service Worker (não existe em SSR nem em
// alguns navegadores mais antigos), então precisa ser resolvido de forma
// assíncrona e opcional, diferente de Auth/Firestore/Storage.

import { getMessaging, isSupported } from 'firebase/messaging';
import app from './config';

/**
 * Retorna a instância do Firebase Messaging, ou `null` se o navegador não
 * suportar (Safari mais antigo, contexto não seguro sem HTTPS/localhost,
 * SSR, etc.) — sempre confira o retorno antes de usar.
 */
export async function getMessagingIfSupported() {
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(app);
}
