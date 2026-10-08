// public/firebase-messaging-sw.js
//
// ⚠️ ARQUIVO GERADO AUTOMATICAMENTE por scripts/generate-firebase-sw.js
// Não edite este arquivo diretamente — as mudanças serão perdidas no
// próximo "npm run dev" / "npm run build". Edite o .env e rode de novo:
//   node scripts/generate-firebase-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  "apiKey": "\"......\",",
  "authDomain": "\".........\",",
  "projectId": "\"........\",",
  "storageBucket": "\"..........\",",
  "messagingSenderId": "\"..........\",",
  "appId": "\"............\","
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
