// generate-sw.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

const swContent = `// public/firebase-messaging-sw.js (Gerado automaticamente pelo .env)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "${process.env.VITE_APP_FIREBASE_API_KEY || ''}",
  authDomain: "${process.env.VITE_APP_FIREBASE_AUTH_DOMAIN || ''}",
  projectId: "${process.env.VITE_APP_FIREBASE_PROJECT_ID || ''}",
  storageBucket: "${process.env.VITE_APP_FIREBASE_STORAGE_BUCKET || ''}",
  messagingSenderId: "${process.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID || ''}",
  appId: "${process.env.VITE_APP_FIREBASE_APP_ID || ''}"
});

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
`;

const targetPath = path.resolve('public', 'firebase-messaging-sw.js');
fs.writeFileSync(targetPath, swContent);
console.log('✅ Service Worker gerado com sucesso utilizando o .env!');