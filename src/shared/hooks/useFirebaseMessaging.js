// src/shared/hooks/useFirebaseMessaging.js
import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { initMessaging } from '../../config/firebase';

export const useFirebaseMessaging = (vapidKey) => {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    const setupMessaging = async () => {
      try {
        const messaging = await initMessaging();
        if (!messaging) return;

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const currentToken = await getToken(messaging, { vapidKey });
          if (currentToken) {
            setToken(currentToken);
          }
        }

        // Handler para mensagens com o app em primeiro plano
        unsubscribe = onMessage(messaging, (payload) => {
          setNotification(payload.notification);
        });
      } catch (error) {
        console.error('Erro ao configurar mensagens do Firebase:', error);
      }
    };

    setupMessaging();

    return () => unsubscribe();
  }, [vapidKey]);

  return { token, notification };
};