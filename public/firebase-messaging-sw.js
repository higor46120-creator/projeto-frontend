// public/firebase-messaging-sw.js
//
// ⚠️ ARQUIVO GERADO AUTOMATICAMENTE por scripts/generate-firebase-sw.js
// Não edite este arquivo diretamente — as mudanças serão perdidas no
// próximo "npm run dev" / "npm run build". Edite o .env e rode de novo:
//   node scripts/generate-firebase-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  "apiKey": "\"AIzaSyAf5K-Qwyx7cePz9cH2CaI2-N6yNy4M1l0\",",
  "authDomain": "\"teste-p2-front.firebaseapp.com\",",
  "projectId": "\"teste-p2-front\",",
  "storageBucket": "\"teste-p2-front.firebasestorage.app\",",
  "messagingSenderId": "\"663885825318\",",
  "appId": "1:663885825318:web:457079b4c8565da8baede7"
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
