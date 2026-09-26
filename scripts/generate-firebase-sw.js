// scripts/generate-firebase-sw.js
//
// Gera public/firebase-messaging-sw.js com os valores REAIS do Firebase
// já embutidos no arquivo.
//
// Por quê esse script existe?
// Service workers rodam FORA do bundler do Vite — o navegador carrega
// esse arquivo direto da pasta public/, sem nenhuma transformação. Ou
// seja, `import.meta.env.VITE_FIREBASE_API_KEY` dentro de um service
// worker nunca vira o valor real: ele simplesmente não existe nesse
// contexto, e o Firebase Messaging falha silenciosamente (ou com erro de
// "invalid api key") em produção.
//
// A solução: manter as variáveis no seu .env normalmente (do mesmo jeito
// que já são usadas em src/firebase/config.js, via import.meta.env), e
// deixar que ESTE script — que roda em Node, não no navegador — leia
// essas mesmas variáveis e "grave" os valores literais dentro do arquivo
// public/firebase-messaging-sw.js antes do dev/build.
//
// Uso manual:
//   node scripts/generate-firebase-sw.js
//
// Uso automático (já configurado no package.json):
//   npm run dev    -> roda "predev" -> este script -> depois "vite"
//   npm run build  -> roda "prebuild" -> este script -> depois "vite build"

import { loadEnv } from 'vite';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = loadEnv(mode, rootDir, 'VITE_');

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missing = REQUIRED_KEYS.filter((key) => !env[key]);
if (missing.length > 0) {
  console.warn(
    '\n[generate-firebase-sw] Aviso: faltam variáveis no .env (o arquivo será gerado assim mesmo, mas as notificações push não vão funcionar até você preencher):\n' +
      missing.map((k) => `  - ${k}`).join('\n') +
      '\n'
  );
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
};

const swContent = `// public/firebase-messaging-sw.js
//
// \u26A0\uFE0F ARQUIVO GERADO AUTOMATICAMENTE por scripts/generate-firebase-sw.js
// N\u00E3o edite este arquivo diretamente \u2014 as mudan\u00E7as ser\u00E3o perdidas no
// pr\u00F3ximo "npm run dev" / "npm run build". Edite o .env e rode de novo:
//   node scripts/generate-firebase-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};

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
`;

const publicDir = resolve(rootDir, 'public');
mkdirSync(publicDir, { recursive: true });

const outputPath = resolve(publicDir, 'firebase-messaging-sw.js');
writeFileSync(outputPath, swContent, 'utf8');

console.log(`[generate-firebase-sw] Gerado com sucesso: ${outputPath}`);
