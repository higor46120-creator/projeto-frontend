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
  apiKey: "AIzaSyCRYIAHyNOB7lXmiNNbfk4AugwxbYWzauY",
  authDomain: "help-tech-4888a.firebaseapp.com",
  projectId: "help-tech-4888a",
  storageBucket: "help-tech-4888a.firebasestorage.app",
  messagingSenderId: "766257049899",
  appId: "1:766257049899:web:434678b3acb938419b156e"
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