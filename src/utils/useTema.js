import { useState } from 'react';

const CHAVE_TEMA = '@helptec:tema'; // mesma chave em todas as páginas

function lerTemaSalvo() {
  try {
    return localStorage.getItem(CHAVE_TEMA) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

// Devolve [tema, alternarTema]. O tema escolhido fica salvo no navegador.
export function useTema() {
  const [tema, setTema] = useState(lerTemaSalvo);

  const alternarTema = () => {
    const novo = tema === 'dark' ? 'light' : 'dark';
    setTema(novo);
    try {
      localStorage.setItem(CHAVE_TEMA, novo);
    } catch {
      /* sem armazenamento: o tema só vale nesta visita */
    }
  };

  return [tema, alternarTema];
}