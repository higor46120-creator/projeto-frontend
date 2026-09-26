// src/hooks/useFirebaseMessaging.js
//
// Cuida do ciclo de vida das notificações push:
//  1. registra o service worker (public/firebase-messaging-sw.js, gerado
//     por scripts/generate-firebase-sw.js);
//  2. pede permissão de notificação ao usuário;
//  3. obtém o token do dispositivo (é esse token que você envia pro seu
//     backend, pra ele saber "pra quem" mandar a notificação depois);
//  4. escuta mensagens recebidas com o app ABERTO (primeiro plano) — as
//     que chegam com o app fechado/minimizado são tratadas direto pelo
//     service worker, não passam por aqui.
//
// Uso:
//   const { token, permission, requestPermission, error } = useFirebaseMessaging({
//     onForegroundMessage: (payload) => {
//       console.log('Notificação recebida com o app aberto:', payload);
//     },
//   });
//
//   <button onClick={requestPermission}>Ativar notificações</button>

import { useEffect, useState, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingIfSupported } from '../firebase/messaging';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export function useFirebaseMessaging({ onForegroundMessage } = {}) {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [error, setError] = useState(null);

  const requestPermission = useCallback(async () => {
    setError(null);

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setError('Este navegador não suporta notificações.');
      return null;
    }

    if (!VAPID_KEY) {
      setError('VITE_FIREBASE_VAPID_KEY não está configurada no seu .env.');
      return null;
    }

    try {
      const messaging = await getMessagingIfSupported();
      if (!messaging) {
        setError('Firebase Messaging não é suportado neste navegador.');
        return null;
      }

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        return null;
      }

      // Registra explicitamente o service worker gerado por
      // scripts/generate-firebase-sw.js (fica servido em /firebase-messaging-sw.js).
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );

      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!currentToken) {
        setError('Não foi possível gerar o token de notificação.');
        return null;
      }

      setToken(currentToken);
      return currentToken;
    } catch (err) {
      console.error('[useFirebaseMessaging] erro ao pedir permissão:', err);
      setError(err?.message || 'Erro desconhecido ao configurar notificações.');
      return null;
    }
  }, []);

  // Mensagens recebidas com o app aberto não passam pelo service worker —
  // precisam desse listener em primeiro plano.
  useEffect(() => {
    let unsubscribe;

    (async () => {
      const messaging = await getMessagingIfSupported();
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        onForegroundMessage?.(payload);
      });
    })();

    return () => {
      unsubscribe?.();
    };
  }, [onForegroundMessage]);

  return { token, permission, requestPermission, error };
}
