import { initializeApp } from 'firebase/app'

// Substitua pelos dados do seu projeto no Console do Firebase
// (Configurações do projeto > Geral > Seus apps > Config do SDK)
const firebaseConfig = {
  apiKey: 'SUA_API_KEY',
  authDomain: 'SEU_PROJETO.firebaseapp.com',
  projectId: 'SEU_PROJETO',
  storageBucket: 'SEU_PROJETO.appspot.com',
  messagingSenderId: 'SEU_SENDER_ID',
  appId: 'SEU_APP_ID',
}

export const app = initializeApp(firebaseConfig)
