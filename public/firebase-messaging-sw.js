// public/firebase-messaging-sw.js
//
// ⚠️ ARQUIVO GERADO AUTOMATICAMENTE por scripts/generate-firebase-sw.js
// Não edite este arquivo diretamente — as mudanças serão perdidas no
// próximo "npm run dev" / "npm run build". Edite o .env e rode de novo:
//   node scripts/generate-firebase-sw.js

importScripts('');
importScripts('');

const firebaseConfig = {
  apiKey: 'SUA_API_KEY',
  authDomain: 'SEU_PROJETO.firebaseapp.com',
  projectId: 'SEU_PROJETO',
  storageBucket: 'SEU_PROJETO.appspot.com',
  messagingSenderId: 'SEU_SENDER_ID',
  appId: 'SEU_APP_ID',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handler para mensagens recebidas em segundo plano
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  const notificationOptions = {
    body,
    icon: icon || '/logo192.png',
  };
  self.registration.showNotification(title, notificationOptions);
});
