<<<<<<< HEAD
# fe

Projeto criado com Vite + React, com Firebase configurado e duas telas: splashscreen e uma tela com botão "Avançar".

## Rodando localmente

O sandbox onde este projeto foi montado não tem acesso à internet, então os pacotes ainda não foram instalados. No seu computador, rode:

```bash
npm install
npm run dev
```

## Firebase

O SDK do `firebase` já está no `package.json`. Falta:

1. Criar um projeto em https://console.firebase.google.com
2. Copiar as credenciais do "Config do SDK" (Configurações do projeto > Geral) e colar em `src/firebase.js` e `public/sw.js` (mesmos valores nos dois arquivos).
3. Se for usar Firebase Cloud Messaging (push notifications), o `public/sw.js` já está pronto como service worker de mensagens em segundo plano.

## Estrutura

```
fe/
├── public/
│   └── sw.js                  # service worker do Firebase
├── src/
│   ├── components/
│   │   ├── SplashScreen.jsx   # tela inicial
│   │   └── AdvanceScreen.jsx  # tela com botão "Avançar"
│   ├── App.jsx                # alterna splash -> Avançar
│   ├── firebase.js            # inicialização do Firebase
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Subindo para o Git

```bash
git init
git add .
git commit -m "Setup inicial: Vite + React + Firebase, splashscreen e tela Avançar"
git branch -M main
git remote add origin <URL_DO_SEU_REPOSITORIO>
git push -u origin main
```
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
>>>>>>> 0d2f4ea (atualizado front)
